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

                // 決定論的UUIDを生成
                const deviceId = await generateDeterministicUUID()

                // auth-apiの/anonymous-loginエンドポイントを使用
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

                const { session: newSession } = response.data.data

                if (!newSession) {
                    throw new Error('セッション情報が取得できませんでした')
                }

                // セッションを設定
                const { error: sessionError } = await supabase.auth.setSession({
                    access_token: newSession.access_token,
                    refresh_token: newSession.refresh_token,
                })

                if (sessionError) {
                    throw sessionError
                }

                // ユーザー情報を更新
                const {
                    data: { user },
                } = await supabase.auth.getUser()

                if (user) {
                    setUserId(user.id)
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
