/**
 * 匿名認証Hook
 * アプリケーション起動時に自動で匿名ログインを実行します
 */

'use client'

import { getSupabaseClient } from '@/db/supabase'
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
        const authenticate = async () => {
            const supabase = getSupabaseClient()

            try {
                // 既存セッションを確認
                const {
                    data: { session },
                } = await supabase.auth.getSession()

                if (session?.user) {
                    setUserId(session.user.id)
                    setIsAuthenticated(true)
                    setIsLoading(false)
                    return
                }

                // Supabaseの匿名サインイン機能を使用
                const { data, error } = await supabase.auth.signInAnonymously({
                    options: {
                        data: {
                            display_name: 'Anonymous User',
                            is_anonymous: true,
                        },
                    },
                })

                if (error) {
                    throw error
                }

                if (data?.user) {
                    setUserId(data.user.id)
                    setIsAuthenticated(true)
                }
            } catch (err) {
                setError(
                    err instanceof Error ? err : new Error('認証に失敗しました')
                )
            } finally {
                setIsLoading(false)
            }
        }

        authenticate()
    }, [])

    return {
        isAuthenticated,
        isLoading,
        userId,
        error,
    }
}
