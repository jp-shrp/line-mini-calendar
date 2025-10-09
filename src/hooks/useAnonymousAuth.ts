/**
 * 匿名認証Hook
 * アプリケーション起動時に自動で匿名ログインを実行します
 * 決定論的UUIDを使用して、同じデバイスからは常に同じユーザーIDでログインします
 */

'use client'

import { getSupabaseClient } from '@/db/supabase'
import { generateDeterministicUUID } from '@/src/lib/deterministic-uuid'
import { useEffect, useState } from 'react'

interface UseAnonymousAuthReturn {
    isAuthenticated: boolean
    isLoading: boolean
    userId: string | null
    error: Error | null
}

export function useAnonymousAuth(): UseAnonymousAuthReturn {
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [userId, setUserId] = useState<string | null>(null)
    const [error, setError] = useState<Error | null>(null)

    useEffect(() => {
        const supabase = getSupabaseClient()
        let isReauthenticating = false

        const performAnonymousLogin = async () => {
            if (isReauthenticating) return

            try {
                const deviceId = await generateDeterministicUUID()

                const response = await supabase.functions.invoke(
                    'auth-api/anonymous-login',
                    {
                        method: 'POST',
                        body: { deviceId },
                    }
                )

                if (response.error) {
                    throw new Error(
                        response.error.message || '匿名ログインに失敗しました'
                    )
                }

                const { email, password } = response.data.data

                if (!email || !password) {
                    throw new Error('認証情報が取得できませんでした')
                }

                const { data: signInData, error: signInError } =
                    await supabase.auth.signInWithPassword({
                        email,
                        password,
                    })

                if (signInError) {
                    throw signInError
                }

                if (signInData.user) {
                    setUserId(signInData.user.id)
                    setIsAuthenticated(true)
                    setError(null)
                }
            } catch (err) {
                setError(
                    err instanceof Error ? err : new Error('認証に失敗しました')
                )
            } finally {
                setIsLoading(false)
                isReauthenticating = false
            }
        }

        const authenticate = async () => {
            try {
                const {
                    data: { session },
                } = await supabase.auth.getSession()

                if (session?.user) {
                    setUserId(session.user.id)
                    setIsAuthenticated(true)
                    setIsLoading(false)
                    return
                }

                await performAnonymousLogin()
            } catch (err) {
                setError(
                    err instanceof Error ? err : new Error('認証に失敗しました')
                )
                setIsLoading(false)
            }
        }

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_OUT') {
                if (!isReauthenticating) {
                    isReauthenticating = true
                    await performAnonymousLogin()
                }
            } else if (event === 'TOKEN_REFRESHED') {
                if (session?.user) {
                    setUserId(session.user.id)
                    setIsAuthenticated(true)
                    setError(null)
                }
            } else if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
                if (session?.user) {
                    setUserId(session.user.id)
                    setIsAuthenticated(true)
                    setError(null)
                }
            }
        })

        authenticate()

        return () => {
            subscription.unsubscribe()
        }
    }, [])

    return {
        isAuthenticated,
        isLoading,
        userId,
        error,
    }
}
