'use client'

import { useEffect } from 'react'

interface ErrorPageProps {
    error: Error & { digest?: string }
    reset: () => void
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
    useEffect(() => {
        // エラーログは削除、Error Boundaryで処理済み
    }, [error])

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex min-h-[400px] flex-col items-center justify-center space-y-6">
                <div className="text-center">
                    <h1 className="mb-4 text-4xl font-bold text-red-600">
                        エラーが発生しました
                    </h1>
                    <h2 className="mb-4 text-xl text-gray-700">
                        {error.message || '商品情報の取得に失敗しました'}
                    </h2>
                    <p className="mb-6 text-gray-600">
                        一時的な問題が発生している可能性があります。
                        しばらく時間をおいてから再度お試しください。
                    </p>
                </div>

                <div className="flex space-x-4">
                    <button
                        onClick={reset}
                        className="rounded-lg bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700">
                        再試行
                    </button>
                    <button
                        onClick={() => (window.location.href = '/sandbox')}
                        className="rounded-lg bg-gray-600 px-6 py-3 text-white transition-colors hover:bg-gray-700">
                        サンドボックスに戻る
                    </button>
                </div>

                {process.env.NODE_ENV === 'development' && (
                    <details className="mt-6 max-w-2xl rounded-lg bg-gray-100 p-4">
                        <summary className="cursor-pointer font-semibold text-gray-700">
                            エラー詳細（開発モード）
                        </summary>
                        <pre className="mt-2 text-sm whitespace-pre-wrap text-gray-600">
                            {error.message}
                        </pre>
                        {error.digest && (
                            <p className="mt-2 text-sm text-gray-500">
                                エラーID: {error.digest}
                            </p>
                        )}
                    </details>
                )}
            </div>
        </div>
    )
}
