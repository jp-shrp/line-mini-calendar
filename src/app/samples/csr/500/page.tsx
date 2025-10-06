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
    const { data, isLoading, error, refetch } = useSupabaseQuery<ErrorResponse>({
        queryKey: ['test-500-error'],
        functionName: 'samples-api/error-test',
        params: { errorType: '500' },
        retry: false, // エラーテスト用なのでリトライしない
    })

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
                title: err && typeof err === 'object' && 'title' in err
                    ? String(err.title)
                    : '500 Internal Server Error',
                message: err && typeof err === 'object' && 'message' in err
                    ? String(err.message)
                    : 'サーバー内部エラーが発生しました',
                rawError: err,
            })
        }
    }

    return (
        <div className="container mx-auto p-8">
            <h1 className="text-3xl font-bold mb-6">500 Error Test Page</h1>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <h2 className="text-lg font-semibold mb-2">🚨 テスト目的</h2>
                <p className="text-sm text-gray-700 mb-3">
                    このページは500エラー (Internal Server Error) が発生した際のエラーハンドリングを確認するためのテストページです。
                </p>
                <p className="text-sm text-gray-700">
                    実際にEdge Functionから500エラーが返却された際に、どのようにエラーが表示されるかを確認できます。
                </p>
            </div>

            {/* useSupabaseQuery によるエラーテスト */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">
                    1. useSupabaseQuery による500エラー
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                    React Queryのフックを使用して500エラーを発生させます。
                </p>

                <button
                    onClick={() => refetch()}
                    disabled={isLoading}
                    className="bg-red-600 text-white rounded px-4 py-2 hover:bg-red-700 disabled:bg-gray-400 mb-4"
                >
                    {isLoading ? 'リクエスト中...' : '500エラーを発生させる'}
                </button>

                {isLoading && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-800">リクエスト中...</p>
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <h3 className="font-semibold text-red-800 mb-2">
                            {error.title || 'エラー'}
                        </h3>
                        <p className="text-sm text-red-600 mb-2">
                            {error.message || 'エラーが発生しました'}
                        </p>
                        <details className="mt-2">
                            <summary className="text-xs text-red-500 cursor-pointer">
                                詳細を表示
                            </summary>
                            <pre className="mt-2 p-2 bg-red-100 rounded text-xs overflow-x-auto">
                                {JSON.stringify(error, null, 2)}
                            </pre>
                        </details>
                    </div>
                )}

                {data && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <p className="text-sm text-green-800">
                            成功 (このメッセージは表示されないはずです)
                        </p>
                        <pre className="mt-2 p-2 bg-green-100 rounded text-xs overflow-x-auto">
                            {JSON.stringify(data, null, 2)}
                        </pre>
                    </div>
                )}
            </div>

            {/* callEdgeFunction による直接呼び出しテスト */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">
                    2. callEdgeFunction による500エラー
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                    callEdgeFunctionを直接使用して500エラーを発生させます。
                </p>

                <button
                    onClick={handleDirectCall}
                    className="bg-purple-600 text-white rounded px-4 py-2 hover:bg-purple-700 mb-4"
                >
                    500エラーを直接呼び出し
                </button>

                {errorDetails && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <h3 className="font-semibold text-red-800 mb-2">
                            {errorDetails.title || 'エラー'}
                        </h3>
                        <p className="text-sm text-red-600 mb-2">
                            {errorDetails.message || 'エラーが発生しました'}
                        </p>
                        <details className="mt-2">
                            <summary className="text-xs text-red-500 cursor-pointer">
                                詳細を表示
                            </summary>
                            <pre className="mt-2 p-2 bg-red-100 rounded text-xs overflow-x-auto">
                                {JSON.stringify(errorDetails.rawError, null, 2)}
                            </pre>
                        </details>
                    </div>
                )}
            </div>

            {/* コード例 */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h2 className="text-lg font-semibold mb-2">📖 実装コード</h2>

                <div className="space-y-3">
                    <div>
                        <h3 className="text-sm font-semibold mb-1">
                            useSupabaseQuery での500エラー取得
                        </h3>
                        <pre className="p-3 bg-gray-800 text-white rounded text-xs overflow-x-auto">
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
                        <h3 className="text-sm font-semibold mb-1">
                            callEdgeFunction での500エラー取得
                        </h3>
                        <pre className="p-3 bg-gray-800 text-white rounded text-xs overflow-x-auto">
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
