/**
 * LINE認証Hook
 * LIFF SDKを使用してLINEログインを実行し、Supabase認証と連携します
 */

'use client'

import { getSupabaseClient } from '@/db/supabase'
import { useLiffContext } from '@/src/contexts/LiffContext'
import { useCallback, useState } from 'react'

interface UseLineAuthReturn {
    /**
     * LINE認証でログイン
     */
    loginWithLine: () => Promise<void>

    /**
     * ログイン処理中フラグ
     */
    isLoggingIn: boolean

    /**
     * エラー
     */
    error: Error | null
}

/**
 * LINE認証フック
 */
export function useLineAuth(): UseLineAuthReturn {
    const { liff, isLoggedIn, getIDToken } = useLiffContext()
    const [isLoggingIn, setIsLoggingIn] = useState(false)
    const [error, setError] = useState<Error | null>(null)

    const loginWithLine = useCallback(async () => {
        setIsLoggingIn(true)
        setError(null)

        try {
            if (!liff) {
                throw new Error('LIFF is not initialized')
            }

            // LIFFログインしていない場合はログイン実行
            if (!isLoggedIn) {
                liff.login()
                return
            }

            // LINE ID tokenを取得
            const idToken = getIDToken()

            if (!idToken) {
                throw new Error('Failed to get LINE ID token')
            }

            const supabase = getSupabaseClient()

            // Edge FunctionでLINE認証
            const response = await supabase.functions.invoke(
                'auth-api/line-login',
                {
                    method: 'POST',
                    body: { idToken },
                }
            )

            if (response.error) {
                throw new Error(
                    response.error.message || 'LINEログインに失敗しました'
                )
            }

            const { email, password } = response.data.data

            if (!email || !password) {
                throw new Error('認証情報が取得できませんでした')
            }

            // Supabaseにログイン
            const { data: signInData, error: signInError } =
                await supabase.auth.signInWithPassword({
                    email,
                    password,
                })

            if (signInError) {
                throw signInError
            }

            if (!signInData.user) {
                throw new Error('ログインに失敗しました')
            }

            console.log('[useLineAuth] Login successful:', signInData.user.id)
        } catch (err) {
            const errorObj =
                err instanceof Error
                    ? err
                    : new Error('LINEログインに失敗しました')
            setError(errorObj)
            console.error('[useLineAuth] Login failed:', errorObj)
            throw errorObj
        } finally {
            setIsLoggingIn(false)
        }
    }, [liff, isLoggedIn, getIDToken])

    return {
        loginWithLine,
        isLoggingIn,
        error,
    }
}
