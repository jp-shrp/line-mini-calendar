/**
 * 統合認証フック
 * LIFF認証と匿名認証を環境に応じて切り替える
 */

'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAnonymousAuth } from '@/src/hooks/useAnonymousAuth'
import { useLineAuth } from '@/src/hooks/useLineAuth'
import { useLiffContext } from '@/src/contexts/LiffContext'
import { getSupabaseClient } from '@/db/supabase'
import type { Profile } from '@line/liff'

export type AuthMethod = 'anonymous' | 'line'

export interface IntegratedAuthReturn {
    /**
     * 認証済みフラグ
     */
    isAuthenticated: boolean

    /**
     * ローディング中フラグ
     */
    isLoading: boolean

    /**
     * ユーザーID
     */
    userId: string | null

    /**
     * エラー
     */
    error: Error | null

    /**
     * 認証方法
     */
    authMethod: AuthMethod

    /**
     * LINEプロフィール（LINE認証時のみ）
     */
    lineProfile: Profile | null

    /**
     * LINE認証に切り替え
     */
    switchToLineAuth: () => Promise<void>

    /**
     * ログアウト
     */
    logout: () => Promise<void>
}

/**
 * 統合認証フック
 * 環境変数とLIFF状態に応じて認証方法を自動切り替え
 */
export function useIntegratedAuth(): IntegratedAuthReturn {
    const anonymousAuth = useAnonymousAuth()
    const { loginWithLine, isLoggingIn } = useLineAuth()
    const {
        isLiffReady,
        isInLineApp,
        isLoggedIn: isLiffLoggedIn,
        profile: liffProfile,
    } = useLiffContext()

    const [isLineAuthenticated, setIsLineAuthenticated] = useState(false)
    const [lineAuthError, setLineAuthError] = useState<Error | null>(null)

    // LIFF有効判定
    const isLiffEnabled =
        typeof window !== 'undefined' &&
        process.env.NEXT_PUBLIC_ENABLE_LIFF === 'true'

    // LINE認証を使用するかどうか
    const shouldUseLine = isLiffEnabled && isLiffReady && isInLineApp

    // LINE認証の自動実行
    useEffect(() => {
        if (!shouldUseLine) return
        if (isLineAuthenticated) return
        if (!isLiffLoggedIn) return

        const autoLineLogin = async () => {
            try {
                setLineAuthError(null)
                await loginWithLine()
                setIsLineAuthenticated(true)
            } catch (err) {
                const error =
                    err instanceof Error
                        ? err
                        : new Error('LINE authentication failed')
                setLineAuthError(error)
                console.error(
                    '[useIntegratedAuth] Auto LINE login failed:',
                    err
                )
            }
        }

        autoLineLogin()
    }, [shouldUseLine, isLiffLoggedIn, isLineAuthenticated, loginWithLine])

    /**
     * LINE認証に切り替え
     */
    const switchToLineAuth = useCallback(async () => {
        try {
            setLineAuthError(null)
            await loginWithLine()
            setIsLineAuthenticated(true)
        } catch (err) {
            const error =
                err instanceof Error
                    ? err
                    : new Error('Failed to switch to LINE auth')
            setLineAuthError(error)
            throw error
        }
    }, [loginWithLine])

    /**
     * ログアウト
     */
    const logout = useCallback(async () => {
        const supabase = getSupabaseClient()
        await supabase.auth.signOut()
        setIsLineAuthenticated(false)
    }, [])

    // LINE認証を使用する場合
    if (shouldUseLine) {
        return {
            isAuthenticated: isLineAuthenticated,
            isLoading: !isLiffReady || isLoggingIn,
            userId: anonymousAuth.userId, // Supabaseのユーザー情報を使用
            error: lineAuthError,
            authMethod: 'line',
            lineProfile: liffProfile,
            switchToLineAuth,
            logout,
        }
    }

    // 匿名認証を使用する場合（デフォルト）
    return {
        isAuthenticated: anonymousAuth.isAuthenticated,
        isLoading: anonymousAuth.isLoading,
        userId: anonymousAuth.userId,
        error: anonymousAuth.error,
        authMethod: 'anonymous',
        lineProfile: null,
        switchToLineAuth,
        logout,
    }
}
