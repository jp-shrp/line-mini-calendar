'use client'

import { createSupabaseClient } from '@/db/supabase'
import { supabaseApiClient } from '@/src/lib/supabase-api-client'
import { useSupabaseQuery } from '@/src/hooks/useSupabaseQuery'
import { useState } from 'react'

/**
 * 500エラーテストページ
 * Client Component + React Queryで500エラーレスポンスを確認する例
 */

interface ErrorResponse {
    error: string
    message?: string
}

export default function CSR500ErrorPage() {
    const [errorDetails, setErrorDetails] = useState<{
        title?: string
        message?: string
        rawError?: unknown
    } | null>(null)

    // useSupabaseQueryを使用して500エラーを発生させる
    const { data, isLoading, error, refetch } = useSupabaseQuery<ErrorResponse>(
        {
            queryKey: ['test-500-error'],
            functionName: 'samples-api/error-test',
            params: { errorType: '500' },
            retry: false, // エラーテスト用なのでリトライしない
        }
    )

    // callEdgeFunctionを直接使用して500エラーを発生させる
    const handleDirectCall = async () => {
        const supabase = createSupabaseClient()
        setErrorDetails(null)

        try {
            await supabaseApiClient.callEdgeFunction<ErrorResponse>(
                async () => {
                    return supabase.functions.invoke('samples-api/error-test', {
                        method: 'POST',
                        body: { errorType: '500' },
                    })
                },
                {
                    error: {
                        title: '500エラーテスト',
                        message: 'サーバーエラーが発生しました',
                    },
                }
            )
        } catch (err) {
            console.error('500 Error caught:', err)
            setErrorDetails({
                title:
                    err && typeof err === 'object' && 'title' in err
                        ? String(err.title)
                        : '500 Internal Server Error',
                message:
                    err && typeof err === 'object' && 'message' in err
                        ? String(err.message)
                        : 'サーバー内部エラーが発生しました',
                rawError: err,
            })
        }
    }

    return (
        <div className="container mx-auto p-8">
            <h1 className="mb-6 text-3xl font-bold">500 Error Test Page</h1>

            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
                <h2 className="mb-2 text-lg font-semibold">🚨 テスト目的</h2>
                <p className="mb-3 text-sm text-gray-700">
                    このページは500エラー (Internal Server Error)
                    が発生した際のエラーハンドリングを確認するためのテストページです。
                </p>
                <p className="text-sm text-gray-700">
                    実際にEdge
                    Functionから500エラーが返却された際に、どのようにエラーが表示されるかを確認できます。
                </p>
            </div>

            {/* useSupabaseQuery によるエラーテスト */}
            <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6">
                <h2 className="mb-4 text-xl font-semibold">
                    1. useSupabaseQuery による500エラー
                </h2>
                <p className="mb-4 text-sm text-gray-600">
                    React Queryのフックを使用して500エラーを発生させます。
                </p>

                <button
                    onClick={() => refetch()}
                    disabled={isLoading}
                    className="mb-4 rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:bg-gray-400">
                    {isLoading ? 'リクエスト中...' : '500エラーを発生させる'}
                </button>

                {isLoading && (
                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                        <p className="text-sm text-blue-800">リクエスト中...</p>
                    </div>
                )}

                {error && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                        <h3 className="mb-2 font-semibold text-red-800">
                            {error.title || 'エラー'}
                        </h3>
                        <p className="mb-2 text-sm text-red-600">
                            {error.message || 'エラーが発生しました'}
                        </p>
                        <details className="mt-2">
                            <summary className="cursor-pointer text-xs text-red-500">
                                詳細を表示
                            </summary>
                            <pre className="mt-2 overflow-x-auto rounded bg-red-100 p-2 text-xs">
                                {JSON.stringify(error, null, 2)}
                            </pre>
                        </details>
                    </div>
                )}

                {data && (
                    <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                        <p className="text-sm text-green-800">
                            成功 (このメッセージは表示されないはずです)
                        </p>
                        <pre className="mt-2 overflow-x-auto rounded bg-green-100 p-2 text-xs">
                            {JSON.stringify(data, null, 2)}
                        </pre>
                    </div>
                )}
            </div>

            {/* callEdgeFunction による直接呼び出しテスト */}
            <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6">
                <h2 className="mb-4 text-xl font-semibold">
                    2. callEdgeFunction による500エラー
                </h2>
                <p className="mb-4 text-sm text-gray-600">
                    callEdgeFunctionを直接使用して500エラーを発生させます。
                </p>

                <button
                    onClick={handleDirectCall}
                    className="mb-4 rounded bg-purple-600 px-4 py-2 text-white hover:bg-purple-700">
                    500エラーを直接呼び出し
                </button>

                {errorDetails && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                        <h3 className="mb-2 font-semibold text-red-800">
                            {errorDetails.title || 'エラー'}
                        </h3>
                        <p className="mb-2 text-sm text-red-600">
                            {errorDetails.message || 'エラーが発生しました'}
                        </p>
                        <details className="mt-2">
                            <summary className="cursor-pointer text-xs text-red-500">
                                詳細を表示
                            </summary>
                            <pre className="mt-2 overflow-x-auto rounded bg-red-100 p-2 text-xs">
                                {JSON.stringify(errorDetails.rawError, null, 2)}
                            </pre>
                        </details>
                    </div>
                )}
            </div>

            {/* コード例 */}
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <h2 className="mb-2 text-lg font-semibold">📖 実装コード</h2>

                <div className="space-y-3">
                    <div>
                        <h3 className="mb-1 text-sm font-semibold">
                            useSupabaseQuery での500エラー取得
                        </h3>
                        <pre className="overflow-x-auto rounded bg-gray-800 p-3 text-xs text-white">
                            {`const { error } = useSupabaseQuery<ErrorResponse>({
  queryKey: ['test-500-error'],
  functionName: 'samples-api/error-test',
  params: { errorType: '500' },
  retry: false,
})

// error.title, error.message でエラー情報にアクセス`}
                        </pre>
                    </div>

                    <div>
                        <h3 className="mb-1 text-sm font-semibold">
                            callEdgeFunction での500エラー取得
                        </h3>
                        <pre className="overflow-x-auto rounded bg-gray-800 p-3 text-xs text-white">
                            {`try {
  await supabaseApiClient.callEdgeFunction(
    async () => {
      return supabase.functions.invoke('samples-api/error-test', {
        method: 'POST',
        body: { errorType: '500' },
      })
    },
    {
      error: {
        title: '500エラーテスト',
        message: 'サーバーエラーが発生しました',
      },
    }
  )
} catch (err) {
  // err.title, err.message でエラー情報にアクセス
}`}
                        </pre>
                    </div>
                </div>
            </div>
        </div>
    )
}
