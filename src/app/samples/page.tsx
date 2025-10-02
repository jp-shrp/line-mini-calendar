import Link from 'next/link'

/**
 * サンプルインデックスページ
 * SSR/CSRのサンプルへのナビゲーション
 */

export default function SamplesIndexPage() {
    return (
        <div className="container mx-auto p-8">
            <h1 className="text-4xl font-bold mb-8">
                Supabase Edge Functions サンプル
            </h1>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
                <h2 className="text-xl font-semibold mb-3">📚 概要</h2>
                <p className="text-gray-700 mb-3">
                    このプロジェクトでは、Supabase Edge Functions + Next.js +
                    React Queryの構成で、
                    <code className="bg-gray-200 px-2 py-1 rounded text-sm">
                        callEdgeFunction
                    </code>
                    を使用してAPIを呼び出します。
                </p>
                <p className="text-gray-700">
                    以下のサンプルでは、SSR (Server Side Rendering) と CSR
                    (Client Side Rendering)
                    それぞれの実装例を確認できます。
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* SSR サンプル */}
                <Link href="/samples/ssr">
                    <div className="border-2 border-blue-200 rounded-lg p-6 hover:border-blue-400 hover:shadow-lg transition-all cursor-pointer">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <span className="text-2xl">🖥️</span>
                            </div>
                            <h2 className="text-2xl font-bold text-blue-700">
                                SSR サンプル
                            </h2>
                        </div>
                        <p className="text-gray-600 mb-4">
                            Server Component
                            でデータを取得する例です。ページ表示時にサーバー側でデータを取得します。
                        </p>
                        <div className="bg-gray-50 p-3 rounded">
                            <h3 className="text-sm font-semibold mb-2">
                                主な特徴:
                            </h3>
                            <ul className="text-sm text-gray-700 space-y-1">
                                <li>• サーバーサイドでデータ取得</li>
                                <li>• SEO対応に最適</li>
                                <li>• 初期表示が高速</li>
                                <li>
                                    •{' '}
                                    <code className="bg-gray-200 px-1 rounded text-xs">
                                        async/await
                                    </code>{' '}
                                    で直接取得
                                </li>
                            </ul>
                        </div>
                        <div className="mt-4 text-blue-600 font-semibold text-sm">
                            サンプルを見る →
                        </div>
                    </div>
                </Link>

                {/* CSR サンプル */}
                <Link href="/samples/csr">
                    <div className="border-2 border-green-200 rounded-lg p-6 hover:border-green-400 hover:shadow-lg transition-all cursor-pointer">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <span className="text-2xl">⚛️</span>
                            </div>
                            <h2 className="text-2xl font-bold text-green-700">
                                CSR サンプル
                            </h2>
                        </div>
                        <p className="text-gray-600 mb-4">
                            Client Component + React Query
                            でデータを取得・更新する例です。リアルタイムなUI更新が可能です。
                        </p>
                        <div className="bg-gray-50 p-3 rounded">
                            <h3 className="text-sm font-semibold mb-2">
                                主な特徴:
                            </h3>
                            <ul className="text-sm text-gray-700 space-y-1">
                                <li>• クライアントサイドでデータ取得</li>
                                <li>• インタラクティブなUI</li>
                                <li>• キャッシュ管理が容易</li>
                                <li>
                                    •{' '}
                                    <code className="bg-gray-200 px-1 rounded text-xs">
                                        useSupabaseQuery/Mutation
                                    </code>
                                </li>
                            </ul>
                        </div>
                        <div className="mt-4 text-green-600 font-semibold text-sm">
                            サンプルを見る →
                        </div>
                    </div>
                </Link>
            </div>

            {/* 実装パターン */}
            <div className="mt-10 bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">🔧 実装パターン</h2>

                <div className="space-y-4">
                    <div>
                        <h3 className="font-semibold text-lg mb-2">
                            1. callEdgeFunction の基本形
                        </h3>
                        <pre className="bg-gray-800 text-white p-4 rounded text-sm overflow-x-auto">
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
                        <h3 className="font-semibold text-lg mb-2">
                            2. React Query との組み合わせ (推奨)
                        </h3>
                        <pre className="bg-gray-800 text-white p-4 rounded text-sm overflow-x-auto">
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
