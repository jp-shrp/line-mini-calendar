/**
 * 認証ページ
 * LINEログインボタンを提供
 */

'use client'

import { useLineAuth } from '@/src/hooks/useLineAuth'
import { useLiffContext } from '@/src/contexts/LiffContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { getSupabaseClient } from '@/db/supabase'

export default function AuthPage() {
    const { loginWithLine, isLoggingIn, error } = useLineAuth()
    const { isLiffReady, isLoggedIn: isLiffLoggedIn } = useLiffContext()
    const router = useRouter()

    // すでにSupabaseにログイン済みの場合はトップページにリダイレクト
    useEffect(() => {
        const checkAuth = async () => {
            const supabase = getSupabaseClient()
            const {
                data: { session },
            } = await supabase.auth.getSession()

            if (session?.user) {
                router.push('/')
            }
        }

        if (isLiffReady) {
            checkAuth()
        }
    }, [isLiffReady, router])

    const handleLineLogin = async () => {
        try {
            await loginWithLine()
            // ログイン成功後、トップページにリダイレクト
            router.push('/')
        } catch (err) {
            console.error('LINE login failed:', err)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
            <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
                <div className="mb-8 text-center">
                    <h1 className="mb-2 text-2xl font-bold text-gray-900">
                        LINEカレンダー
                    </h1>
                    <p className="text-gray-600">
                        LINEアカウントでログインしてください
                    </p>
                </div>

                {/* LIFF初期化中 */}
                {!isLiffReady && (
                    <div className="text-center">
                        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-green-600"></div>
                        <p className="text-gray-600">初期化中...</p>
                    </div>
                )}

                {/* LIFFログイン済みだがSupabaseログイン中 */}
                {isLiffReady && isLiffLoggedIn && isLoggingIn && (
                    <div className="text-center">
                        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-green-600"></div>
                        <p className="text-gray-600">ログイン処理中...</p>
                    </div>
                )}

                {/* LINEログインボタン */}
                {isLiffReady && !isLoggingIn && (
                    <div className="space-y-4">
                        <button
                            onClick={handleLineLogin}
                            disabled={isLoggingIn}
                            className="w-full rounded-lg bg-green-500 py-3 font-bold text-white transition-colors hover:bg-green-600 disabled:cursor-not-allowed disabled:bg-gray-400">
                            {isLoggingIn ? 'ログイン中...' : 'LINEでログイン'}
                        </button>

                        {error && (
                            <div className="rounded-lg bg-red-50 p-4">
                                <p className="text-sm text-red-600">
                                    {error.message}
                                </p>
                            </div>
                        )}

                        <div className="mt-6 text-center text-sm text-gray-500">
                            <p>
                                ログインすることで、
                                <br />
                                利用規約とプライバシーポリシーに同意したことになります
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
