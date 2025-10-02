import { createSupabaseClient } from '@/db/supabase'
import { supabaseApiClient } from '@/src/lib/supabase-api-client'

/**
 * 500エラーテストページ
 * Server Componentで意図的に500エラーを発生させて、エラーハンドリングの動作を確認する
 */

export default async function SSR500ErrorPage() {
    const supabase = createSupabaseClient()

    try {
        // 意図的に500エラーを発生させるAPIを呼び出し
        await supabaseApiClient.callEdgeFunction(
            async () => {
                return supabase.functions.invoke('samples-api/test-error/500', {
                    method: 'GET',
                })
            },
            {
                error: {
                    title: '500エラーテスト',
                    message: 'サーバーエラーのテストです',
                },
            }
        )

        // エラーが発生しない場合（本来は発生するはず）
        return (
            <div className="container mx-auto p-8">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h1 className="text-2xl font-bold text-yellow-800">
                        予期しない状態
                    </h1>
                    <p className="text-yellow-700 mt-2">
                        エラーが発生するはずでしたが、正常に処理されました。
                    </p>
                </div>
            </div>
        )
    } catch (error: any) {
        // エラーが発生した場合の表示
        return (
            <div className="container mx-auto p-8">
                <h1 className="text-3xl font-bold mb-6">500 Error Test Page</h1>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <h2 className="text-lg font-semibold mb-2">📖 使用例</h2>
                    <p className="text-sm text-gray-700">
                        このページはServer Component
                        (SSR)で意図的に500エラーを発生させ、エラーハンドリングの動作を確認します。
                    </p>
                    <pre className="mt-3 p-3 bg-gray-800 text-white rounded text-xs overflow-x-auto">
                        {`try {
  await supabaseApiClient.callEdgeFunction(
    async () => {
      return supabase.functions.invoke('samples-api/test-error/500', {
        method: 'GET',
      })
    },
    {
      error: {
        title: '500エラーテスト',
        message: 'サーバーエラーのテストです',
      },
    }
  )
} catch (error) {
  // エラーハンドリング
}`}
                    </pre>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                            <svg
                                className="w-6 h-6 text-red-600"
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                            </svg>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-red-800 mb-2">
                                {error.title || 'システムエラー'}
                            </h3>
                            <p className="text-red-700 mb-4">
                                {error.message ||
                                    'システムで問題が発生しました'}
                            </p>
                            <div className="bg-white rounded p-4 mt-4">
                                <h4 className="text-sm font-semibold text-gray-700 mb-2">
                                    エラー詳細:
                                </h4>
                                <dl className="space-y-2 text-sm">
                                    <div>
                                        <dt className="font-semibold text-gray-600">
                                            ステータスコード:
                                        </dt>
                                        <dd className="text-gray-800 ml-4">
                                            {error.status || 'N/A'}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="font-semibold text-gray-600">
                                            エラーコード:
                                        </dt>
                                        <dd className="text-gray-800 ml-4">
                                            {error.code || 'N/A'}
                                        </dd>
                                    </div>
                                    {error.details && (
                                        <div>
                                            <dt className="font-semibold text-gray-600">
                                                追加情報:
                                            </dt>
                                            <dd className="text-gray-800 ml-4">
                                                <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-x-auto">
                                                    {JSON.stringify(
                                                        error.details,
                                                        null,
                                                        2
                                                    )}
                                                </pre>
                                            </dd>
                                        </div>
                                    )}
                                </dl>
                            </div>
                            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                                <p className="text-sm text-yellow-800">
                                    <strong>注意:</strong>{' '}
                                    これはテスト用のエラーです。実際の500エラーでは、ユーザーにはより親切なメッセージが表示されます。
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-6">
                    <a
                        href="/samples/ssr"
                        className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                        ← SSRサンプルページに戻る
                    </a>
                </div>
            </div>
        )
    }
}
