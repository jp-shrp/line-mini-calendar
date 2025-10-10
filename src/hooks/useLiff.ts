/**
 * useLiffフック
 * LIFF SDKの初期化とログイン状態管理
 */

'use client'

import { useEffect, useState, useCallback } from 'react'
import type { Liff, Profile } from '@line/liff'
import { initializeLiff, isLiffEnabled } from '@/src/lib/liff-client'

export interface UseLiffReturn {
    /**
     * LIFF準備完了フラグ
     */
    isLiffReady: boolean

    /**
     * LINE内ブラウザかどうか
     */
    isInLineApp: boolean

    /**
     * ログイン済みかどうか
     */
    isLoggedIn: boolean

    /**
     * ユーザープロフィール
     */
    profile: Profile | null

    /**
     * LIFFインスタンス
     */
    liff: Liff | null

    /**
     * 初期化エラー
     */
    error: Error | null

    /**
     * ログイン
     */
    login: () => void

    /**
     * ログアウト
     */
    logout: () => void

    /**
     * アクセストークン取得
     */
    getAccessToken: () => string | null

    /**
     * IDトークン取得
     */
    getIDToken: () => string | null
}

/**
 * useLiffフック
 */
export function useLiff(): UseLiffReturn {
    const [isLiffReady, setIsLiffReady] = useState(false)
    const [isInLineApp, setIsInLineApp] = useState(false)
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [profile, setProfile] = useState<Profile | null>(null)
    const [liff, setLiff] = useState<Liff | null>(null)
    const [error, setError] = useState<Error | null>(null)

    useEffect(() => {
        // LIFF無効の場合は何もしない
        if (!isLiffEnabled()) {
            setIsLiffReady(true)
            return
        }

        // LIFFの初期化
        const init = async () => {
            try {
                const liffInstance = await initializeLiff()
                setLiff(liffInstance)

                // LINE内ブラウザ判定
                const inClient = liffInstance.isInClient()
                setIsInLineApp(inClient)

                // ログイン状態確認
                const loggedIn = liffInstance.isLoggedIn()
                setIsLoggedIn(loggedIn)

                // ログイン済みの場合、プロフィール取得
                if (loggedIn) {
                    try {
                        const userProfile = await liffInstance.getProfile()
                        setProfile(userProfile)
                    } catch (profileError) {
                        console.error(
                            '[useLiff] Failed to get profile:',
                            profileError
                        )
                    }
                }

                setIsLiffReady(true)
            } catch (err) {
                const error =
                    err instanceof Error
                        ? err
                        : new Error('LIFF initialization failed')
                setError(error)
                setIsLiffReady(true)
                console.error('[useLiff] Initialization error:', err)
            }
        }

        init()
    }, [])

    /**
     * ログイン
     */
    const login = useCallback(() => {
        if (!liff) {
            console.error('[useLiff] LIFF is not initialized')
            return
        }

        if (isLoggedIn) {
            console.log('[useLiff] Already logged in')
            return
        }

        try {
            liff.login({
                redirectUri: window.location.href,
            })
        } catch (err) {
            console.error('[useLiff] Login failed:', err)
        }
    }, [liff, isLoggedIn])

    /**
     * ログアウト
     */
    const logout = useCallback(() => {
        if (!liff) {
            console.error('[useLiff] LIFF is not initialized')
            return
        }

        try {
            liff.logout()
            setIsLoggedIn(false)
            setProfile(null)
        } catch (err) {
            console.error('[useLiff] Logout failed:', err)
        }
    }, [liff])

    /**
     * アクセストークン取得
     */
    const getAccessToken = useCallback((): string | null => {
        if (!liff) {
            return null
        }

        try {
            return liff.getAccessToken()
        } catch (err) {
            console.error('[useLiff] Failed to get access token:', err)
            return null
        }
    }, [liff])

    /**
     * IDトークン取得
     */
    const getIDToken = useCallback((): string | null => {
        if (!liff) {
            return null
        }

        try {
            return liff.getIDToken()
        } catch (err) {
            console.error('[useLiff] Failed to get ID token:', err)
            return null
        }
    }, [liff])

    return {
        isLiffReady,
        isInLineApp,
        isLoggedIn,
        profile,
        liff,
        error,
        login,
        logout,
        getAccessToken,
        getIDToken,
    }
}
