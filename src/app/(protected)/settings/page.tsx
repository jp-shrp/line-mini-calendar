/**
 * 設定ページ
 * アカウント連携・認証情報表示
 */

'use client'

import { useAuth } from '@/src/contexts/AuthContext'
import { useLiffContext } from '@/src/contexts/LiffContext'
import { getSupabaseClient } from '@/db/supabase'
import { useState } from 'react'

export default function SettingsPage() {
    const { authMethod, lineProfile, userId } = useAuth()
    const { getIDToken, isLoggedIn: isLiffLoggedIn } = useLiffContext()
    const [isLinking, setIsLinking] = useState(false)
    const [linkError, setLinkError] = useState<string | null>(null)
    const [linkSuccess, setLinkSuccess] = useState(false)

    const handleLinkLine = async () => {
        setIsLinking(true)
        setLinkError(null)
        setLinkSuccess(false)

        try {
            // LIFFからIDトークンを取得
            const idToken = getIDToken()

            if (!idToken) {
                throw new Error('LINE ID tokenが取得できませんでした')
            }

            const supabase = getSupabaseClient()

            // アカウント連携API呼び出し
            const response = await supabase.functions.invoke(
                'auth-api/link-line',
                {
                    method: 'POST',
                    body: { idToken },
                }
            )

            if (response.error) {
                throw new Error(
                    response.error.message || 'アカウント連携に失敗しました'
                )
            }

            setLinkSuccess(true)

            // ページをリロードして最新情報を取得
            setTimeout(() => {
                window.location.reload()
            }, 2000)
        } catch (err) {
            const errorMessage =
                err instanceof Error
                    ? err.message
                    : 'アカウント連携に失敗しました'
            setLinkError(errorMessage)
            console.error('[Settings] LINE linking failed:', err)
        } finally {
            setIsLinking(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="mx-auto max-w-2xl">
                <h1 className="mb-6 text-2xl font-bold text-gray-900">設定</h1>

                {/* アカウント情報 */}
                <div className="mb-6 rounded-lg bg-white p-6 shadow">
                    <h2 className="mb-4 text-lg font-semibold text-gray-800">
                        アカウント情報
                    </h2>

                    <div className="space-y-3">
                        <div>
                            <p className="text-sm text-gray-600">ユーザーID</p>
                            <p className="font-mono text-sm text-gray-900">
                                {userId}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-600">認証方法</p>
                            <p className="text-sm text-gray-900">
                                {authMethod === 'anonymous' && '匿名認証'}
                                {authMethod === 'line' && 'LINE認証'}
                            </p>
                        </div>

                        {lineProfile && (
                            <>
                                <div>
                                    <p className="text-sm text-gray-600">
                                        LINE表示名
                                    </p>
                                    <p className="text-sm text-gray-900">
                                        {lineProfile.displayName}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-600">
                                        LINE User ID
                                    </p>
                                    <p className="font-mono text-sm text-gray-900">
                                        {lineProfile.userId}
                                    </p>
                                </div>

                                {lineProfile.pictureUrl && (
                                    <div>
                                        <p className="mb-2 text-sm text-gray-600">
                                            プロフィール画像
                                        </p>
                                        <img
                                            src={lineProfile.pictureUrl}
                                            alt="プロフィール"
                                            className="h-16 w-16 rounded-full"
                                        />
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* LINE連携 */}
                {authMethod === 'anonymous' && (
                    <div className="mb-6 rounded-lg bg-white p-6 shadow">
                        <h2 className="mb-4 text-lg font-semibold text-gray-800">
                            LINEアカウント連携
                        </h2>

                        <p className="mb-4 text-sm text-gray-600">
                            匿名アカウントにLINEアカウントを連携することで、複数のデバイスで同じデータにアクセスできます。
                        </p>

                        {!isLiffLoggedIn && (
                            <p className="mb-4 rounded bg-yellow-50 p-3 text-sm text-yellow-800">
                                LINE連携を行うには、LINEアプリ内でこのページを開く必要があります。
                            </p>
                        )}

                        {linkSuccess && (
                            <div className="mb-4 rounded-lg bg-green-50 p-4">
                                <p className="text-sm text-green-800">
                                    LINEアカウントとの連携に成功しました！
                                    <br />
                                    ページを再読み込みしています...
                                </p>
                            </div>
                        )}

                        {linkError && (
                            <div className="mb-4 rounded-lg bg-red-50 p-4">
                                <p className="text-sm text-red-800">
                                    {linkError}
                                </p>
                            </div>
                        )}

                        <button
                            onClick={handleLinkLine}
                            disabled={isLinking || !isLiffLoggedIn}
                            className="w-full rounded-lg bg-green-500 py-3 font-bold text-white transition-colors hover:bg-green-600 disabled:cursor-not-allowed disabled:bg-gray-400">
                            {isLinking ? '連携中...' : 'LINEアカウントと連携'}
                        </button>
                    </div>
                )}

                {/* 戻るボタン */}
                <div className="text-center">
                    <button
                        onClick={() => (window.location.href = '/')}
                        className="text-sm text-blue-600 hover:text-blue-700 hover:underline">
                        カレンダーに戻る
                    </button>
                </div>
            </div>
        </div>
    )
}
