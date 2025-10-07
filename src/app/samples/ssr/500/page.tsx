import { createSupabaseClient } from '@/db/supabase'
import { supabaseApiClient } from '@/src/lib/supabase-api-client'

/**
 * 500エラーテストページ
 * Server Componentで意図的に500エラーを発生させて、エラーハンドリングの動作を確認する
 */

export default async function SSR500ErrorPage() {
    const supabase = createSupabaseClient()

    // try-catchは行わず、エラー時はNext.jsのError Boundaryに委ねる
    // 意図的に500エラーを発生させるAPIを呼び出し
    await supabaseApiClient.callEdgeFunction(
        async () => {
            return supabase.functions.invoke('samples-api/test-error/500', {
                method: 'GET',
            })
        },
        {
            customErrorMessage: 'サーバーエラーのテストです',
        }
    )

    // エラーが発生しない場合（本来は発生するはず）
    return (
        <div className="container mx-auto p-8">
            <h1 className="mb-6 text-3xl font-bold">500 Error Test Page</h1>

            <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
                <h2 className="mb-2 text-lg font-semibold">📖 使用例</h2>
                <p className="text-sm text-gray-700">
                    このページはServer Component
                    (SSR)で意図的に500エラーを発生させ、Next.jsのError
                    Boundaryでエラーハンドリングの動作を確認します。
                </p>
                <pre className="mt-3 overflow-x-auto rounded bg-gray-800 p-3 text-xs text-white">
                    {`await supabaseApiClient.callEdgeFunction(
  async () => {
    return supabase.functions.invoke('samples-api/test-error/500', {
      method: 'GET',
    })
  },
  {
    customErrorMessage: 'サーバーエラーのテストです',
  }
)`}
                </pre>
            </div>

            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                <h1 className="text-2xl font-bold text-yellow-800">
                    予期しない状態
                </h1>
                <p className="mt-2 text-yellow-700">
                    エラーが発生するはずでしたが、正常に処理されました。
                </p>
            </div>
        </div>
    )
}
