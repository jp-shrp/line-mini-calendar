'use client'

import { getSupabaseClient } from '@/db/supabase'
import { useLiffContext } from '@/src/contexts/LiffContext'
import { useEffect, useState } from 'react'

// グローバル変数で最後のリクエスト情報を保持
if (typeof window !== 'undefined') {
    ;(window as any).__debugLastRequest = null
}

/**
 * デバッグ情報表示コンポーネント
 * LIFF環境での認証状態を確認するために使用
 */
export default function DebugInfo() {
    const { isLiffReady, isInLineApp, isLoggedIn, profile, liff, error } =
        useLiffContext()
    const [sessionInfo, setSessionInfo] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [lastRequest, setLastRequest] = useState<any>(null)
    const [isOpen, setIsOpen] = useState(false)

    useEffect(() => {
        const supabase = getSupabaseClient()

        const loadSessionInfo = async () => {
            try {
                const {
                    data: { session },
                    error: sessionError,
                } = await supabase.auth.getSession()

                if (sessionError) {
                    setSessionInfo({ error: sessionError.message })
                } else if (session) {
                    setSessionInfo({
                        userId: session.user.id,
                        email: session.user.email,
                        hasAccessToken: !!session.access_token,
                        accessTokenLength: session.access_token?.length || 0,
                        expiresAt: session.expires_at
                            ? new Date(
                                  session.expires_at * 1000
                              ).toLocaleString()
                            : 'N/A',
                        userMetadata: session.user.user_metadata,
                    })
                } else {
                    setSessionInfo({ status: 'No session' })
                }
            } catch (err) {
                setSessionInfo({
                    error: err instanceof Error ? err.message : 'Unknown error',
                })
            } finally {
                setLoading(false)
            }
        }

        // 初回ロード
        loadSessionInfo()

        // セッション変更を監視
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setLoading(true)
            if (session) {
                setSessionInfo({
                    userId: session.user.id,
                    email: session.user.email,
                    hasAccessToken: !!session.access_token,
                    accessTokenLength: session.access_token?.length || 0,
                    expiresAt: session.expires_at
                        ? new Date(session.expires_at * 1000).toLocaleString()
                        : 'N/A',
                    userMetadata: session.user.user_metadata,
                })
            } else {
                setSessionInfo({ status: 'No session' })
            }
            setLoading(false)
        })

        // クリーンアップ
        return () => {
            subscription.unsubscribe()
        }
    }, [])

    // 最後のリクエスト情報を定期的にチェック
    useEffect(() => {
        const interval = setInterval(() => {
            if (typeof window !== 'undefined') {
                const req = (window as any).__debugLastRequest
                if (req) {
                    setLastRequest(req)
                }
            }
        }, 1000)

        return () => clearInterval(interval)
    }, [])

    return (
        <>
            {/* フローティングボタン */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed right-4 bottom-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-2xl text-white shadow-lg transition-all hover:bg-blue-700 hover:shadow-xl"
                aria-label="デバッグ情報を開く">
                🔍
            </button>

            {/* デバッグパネル */}
            {isOpen && (
                <div className="fixed right-0 bottom-0 left-0 z-40 max-h-96 overflow-y-auto border-t-2 border-blue-500 bg-white p-4 text-xs shadow-lg transition-transform">
                    <div className="mb-2 flex items-center justify-between">
                        <h3 className="text-sm font-bold text-blue-600">
                            🔍 デバッグ情報
                        </h3>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">
                                {new Date().toLocaleTimeString()}
                            </span>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-lg text-gray-500 hover:text-gray-700"
                                aria-label="閉じる">
                                ×
                            </button>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {/* LIFF情報 */}
                        <div className="rounded border border-purple-300 bg-purple-50 p-2">
                            <h4 className="mb-1 font-semibold text-purple-700">
                                LIFF状態
                            </h4>
                            <div className="space-y-1 text-gray-700">
                                <div>
                                    LIFF Ready:{' '}
                                    <span
                                        className={
                                            isLiffReady
                                                ? 'text-green-600'
                                                : 'text-red-600'
                                        }>
                                        {isLiffReady ? '✓ Yes' : '✗ No'}
                                    </span>
                                </div>
                                <div>
                                    In LINE App:{' '}
                                    <span
                                        className={
                                            isInLineApp
                                                ? 'text-green-600'
                                                : 'text-orange-600'
                                        }>
                                        {isInLineApp ? '✓ Yes' : '✗ No'}
                                    </span>
                                </div>
                                <div>
                                    LIFF Logged In:{' '}
                                    <span
                                        className={
                                            isLoggedIn
                                                ? 'text-green-600'
                                                : 'text-red-600'
                                        }>
                                        {isLoggedIn ? '✓ Yes' : '✗ No'}
                                    </span>
                                </div>
                                {profile && (
                                    <>
                                        <div>User ID: {profile.userId}</div>
                                        <div>
                                            Display Name: {profile.displayName}
                                        </div>
                                    </>
                                )}
                                {error && (
                                    <div className="text-red-600">
                                        Error: {error.message}
                                    </div>
                                )}
                                {liff && (
                                    <div>
                                        LIFF Version:{' '}
                                        {(liff as any).getVersion?.() ||
                                            'Unknown'}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Supabaseセッション情報 */}
                        <div className="rounded border border-green-300 bg-green-50 p-2">
                            <h4 className="mb-1 font-semibold text-green-700">
                                Supabaseセッション
                            </h4>
                            {loading ? (
                                <div className="text-gray-500">Loading...</div>
                            ) : (
                                <div className="space-y-1 text-gray-700">
                                    {sessionInfo?.error ? (
                                        <div className="text-red-600">
                                            Error: {sessionInfo.error}
                                        </div>
                                    ) : sessionInfo?.status === 'No session' ? (
                                        <div className="text-orange-600">
                                            ⚠️ セッションなし
                                        </div>
                                    ) : (
                                        <>
                                            <div>
                                                User ID:{' '}
                                                <span className="font-mono">
                                                    {sessionInfo?.userId}
                                                </span>
                                            </div>
                                            <div>
                                                Email: {sessionInfo?.email}
                                            </div>
                                            <div>
                                                Access Token:{' '}
                                                <span
                                                    className={
                                                        sessionInfo?.hasAccessToken
                                                            ? 'text-green-600'
                                                            : 'text-red-600'
                                                    }>
                                                    {sessionInfo?.hasAccessToken
                                                        ? `✓ Available (${sessionInfo?.accessTokenLength} chars)`
                                                        : '✗ Not available'}
                                                </span>
                                            </div>
                                            <div>
                                                Expires:{' '}
                                                {sessionInfo?.expiresAt}
                                            </div>
                                            {sessionInfo?.userMetadata && (
                                                <div className="mt-1">
                                                    <div className="font-semibold">
                                                        User Metadata:
                                                    </div>
                                                    <pre className="mt-1 max-h-20 overflow-auto rounded bg-white p-1 text-xs">
                                                        {JSON.stringify(
                                                            sessionInfo.userMetadata,
                                                            null,
                                                            2
                                                        )}
                                                    </pre>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* 環境変数 */}
                        <div className="rounded border border-blue-300 bg-blue-50 p-2">
                            <h4 className="mb-1 font-semibold text-blue-700">
                                環境設定
                            </h4>
                            <div className="space-y-1 text-gray-700">
                                <div>
                                    LIFF Enabled:{' '}
                                    {process.env.NEXT_PUBLIC_ENABLE_LIFF ||
                                        'false'}
                                </div>
                                <div>
                                    LIFF ID:{' '}
                                    {process.env.NEXT_PUBLIC_LIFF_ID ||
                                        'Not set'}
                                </div>
                                <div>
                                    Supabase URL:{' '}
                                    {process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(
                                        0,
                                        30
                                    ) + '...' || 'Not set'}
                                </div>
                            </div>
                        </div>

                        {/* 最後のリクエスト情報 */}
                        {lastRequest && (
                            <div className="rounded border border-red-300 bg-red-50 p-2">
                                <h4 className="mb-1 font-semibold text-red-700">
                                    最後のEdge Functionリクエスト
                                </h4>
                                <div className="space-y-1 text-gray-700">
                                    <div>
                                        Function:{' '}
                                        <strong>{lastRequest.function}</strong>
                                    </div>
                                    <div>Time: {lastRequest.timestamp}</div>
                                    <div>
                                        Authorization Header:{' '}
                                        <span
                                            className={
                                                lastRequest.hasAuth
                                                    ? 'text-green-600'
                                                    : 'text-red-600'
                                            }>
                                            {lastRequest.hasAuth
                                                ? `✓ Present (${lastRequest.authLength} chars)`
                                                : '✗ Missing'}
                                        </span>
                                    </div>
                                    {lastRequest.error && (
                                        <div className="text-red-600">
                                            Error: {lastRequest.error}
                                        </div>
                                    )}
                                    {lastRequest.headers && (
                                        <div className="mt-1">
                                            <div className="font-semibold">
                                                Request Headers:
                                            </div>
                                            <pre className="mt-1 max-h-20 overflow-auto rounded bg-white p-1 text-xs">
                                                {JSON.stringify(
                                                    lastRequest.headers,
                                                    null,
                                                    2
                                                )}
                                            </pre>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    )
}
