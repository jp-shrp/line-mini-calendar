import Link from 'next/link'

/**
 * サンプルインデックスページ
 * SSR/CSRのサンプルへのナビゲーション
 */

export default function SamplesIndexPage() {
    return (
        <div className="container mx-auto p-8">
            <h1 className="mb-8 text-4xl font-bold">
                Supabase Edge Functions サンプル
            </h1>

            <div className="mb-8 rounded-lg border border-blue-200 bg-blue-50 p-6">
                <h2 className="mb-3 text-xl font-semibold">📚 概要</h2>
                <p className="mb-3 text-gray-700">
                    このプロジェクトでは、Supabase Edge Functions + Next.js +
                    React Queryの構成で、
                    <code className="rounded bg-gray-200 px-2 py-1 text-sm">
                        callEdgeFunction
                    </code>
                    を使用してAPIを呼び出します。
                </p>
                <p className="text-gray-700">
                    以下のサンプルでは、SSR (Server Side Rendering) と CSR
                    (Client Side Rendering) それぞれの実装例を確認できます。
                </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* SSR サンプル */}
                <Link href="/samples/ssr">
                    <div className="cursor-pointer rounded-lg border-2 border-blue-200 p-6 transition-all hover:border-blue-400 hover:shadow-lg">
                        <div className="mb-3 flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                                <span className="text-2xl">🖥️</span>
                            </div>
                            <h2 className="text-2xl font-bold text-blue-700">
                                SSR サンプル
                            </h2>
                        </div>
                        <p className="mb-4 text-gray-600">
                            Server Component
                            でデータを取得する例です。ページ表示時にサーバー側でデータを取得します。
                        </p>
                        <div className="rounded bg-gray-50 p-3">
                            <h3 className="mb-2 text-sm font-semibold">
                                主な特徴:
                            </h3>
                            <ul className="space-y-1 text-sm text-gray-700">
                                <li>• サーバーサイドでデータ取得</li>
                                <li>• SEO対応に最適</li>
                                <li>• 初期表示が高速</li>
                                <li>
                                    •{' '}
                                    <code className="rounded bg-gray-200 px-1 text-xs">
                                        async/await
                                    </code>{' '}
                                    で直接取得
                                </li>
                            </ul>
                        </div>
                        <div className="mt-4 text-sm font-semibold text-blue-600">
                            サンプルを見る →
                        </div>
                    </div>
                </Link>

                {/* CSR サンプル */}
                <Link href="/samples/csr">
                    <div className="cursor-pointer rounded-lg border-2 border-green-200 p-6 transition-all hover:border-green-400 hover:shadow-lg">
                        <div className="mb-3 flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                                <span className="text-2xl">⚛️</span>
                            </div>
                            <h2 className="text-2xl font-bold text-green-700">
                                CSR サンプル
                            </h2>
                        </div>
                        <p className="mb-4 text-gray-600">
                            Client Component + React Query
                            でデータを取得・更新する例です。リアルタイムなUI更新が可能です。
                        </p>
                        <div className="rounded bg-gray-50 p-3">
                            <h3 className="mb-2 text-sm font-semibold">
                                主な特徴:
                            </h3>
                            <ul className="space-y-1 text-sm text-gray-700">
                                <li>• クライアントサイドでデータ取得</li>
                                <li>• インタラクティブなUI</li>
                                <li>• キャッシュ管理が容易</li>
                                <li>
                                    •{' '}
                                    <code className="rounded bg-gray-200 px-1 text-xs">
                                        useSupabaseQuery/Mutation
                                    </code>
                                </li>
                            </ul>
                        </div>
                        <div className="mt-4 text-sm font-semibold text-green-600">
                            サンプルを見る →
                        </div>
                    </div>
                </Link>
            </div>

            {/* 実装パターン */}
            <div className="mt-10 rounded-lg border border-gray-200 bg-gray-50 p-6">
                <h2 className="mb-4 text-xl font-semibold">🔧 実装パターン</h2>

                <div className="space-y-4">
                    <div>
                        <h3 className="mb-2 text-lg font-semibold">
                            1. callEdgeFunction の基本形
                        </h3>
                        <pre className="overflow-x-auto rounded bg-gray-800 p-4 text-sm text-white">
                            {`const result = await supabaseApiClient.callEdgeFunction<ResponseType>(
  async () => {
    return supabase.functions.invoke('function-name', {
      method: 'POST',
      body: data,
    })
  },
  {
    error: {
      title: 'エラータイトル',
      message: 'エラーメッセージ',
    },
  }
)`}
                        </pre>
                    </div>

                    <div>
                        <h3 className="mb-2 text-lg font-semibold">
                            2. React Query との組み合わせ (推奨)
                        </h3>
                        <pre className="overflow-x-auto rounded bg-gray-800 p-4 text-sm text-white">
                            {`// GET: useSupabaseQuery
const { data } = useSupabaseQuery({
  queryKey: ['users'],
  functionName: 'samples-api/users',
})

// POST/PUT/DELETE: useSupabaseMutation
const mutation = useSupabaseMutation({
  functionName: 'samples-api/users',
  method: 'POST',
  invalidateQueries: ['users'],
})`}
                        </pre>
                    </div>
                </div>
            </div>
        </div>
    )
}
