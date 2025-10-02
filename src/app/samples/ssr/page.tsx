import { createSupabaseClient } from '@/db/supabase'
import { supabaseApiClient } from '@/src/lib/supabase-api-client'

/**
 * SSRサンプルページ
 * Server Componentでsupabase.functions.invokeを使用してデータを取得する例
 */

interface User {
    id: string
    email: string
    name: string
    profileImage?: string
    createdAt: string
    updatedAt: string
}

interface UsersResponse {
    users: User[]
    pagination: {
        page: number
        limit: number
        total: number
        totalPages: number
    }
}

export default async function SSRSamplePage() {
    const supabase = createSupabaseClient()

    // SSRでcallEdgeFunctionを使用してデータを取得
    const data = await supabaseApiClient.callEdgeFunction<UsersResponse>(
        async () => {
            return supabase.functions.invoke('samples-api/users', {
                method: 'GET',
            })
        },
        {
            error: {
                title: 'ユーザー取得エラー',
                message: 'ユーザー一覧の取得に失敗しました',
            },
        }
    )

    return (
        <div className="container mx-auto p-8">
            <h1 className="text-3xl font-bold mb-6">SSR Sample Page</h1>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h2 className="text-lg font-semibold mb-2">📖 使用例</h2>
                <p className="text-sm text-gray-700">
                    このページはServer Component
                    (SSR)でsupabase.functions.invokeを使用してデータを取得しています。
                </p>
                <pre className="mt-3 p-3 bg-gray-800 text-white rounded text-xs overflow-x-auto">
                    {`const data = await supabaseApiClient.callEdgeFunction<UsersResponse>(
  async () => {
    return supabase.functions.invoke('samples-api/users', {
      method: 'GET',
    })
  },
  {
    error: {
      title: 'ユーザー取得エラー',
      message: 'ユーザー一覧の取得に失敗しました',
    },
  }
)`}
                </pre>
            </div>

            <div className="mb-4">
                <h2 className="text-xl font-semibold mb-3">ユーザー一覧</h2>
                <p className="text-sm text-gray-600 mb-4">
                    総件数: {data.pagination.total} 件 (ページ:{' '}
                    {data.pagination.page} / {data.pagination.totalPages})
                </p>
            </div>

            <div className="grid gap-4">
                {data.users.map((user) => (
                    <div
                        key={user.id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-start gap-4">
                            {user.profileImage ? (
                                <img
                                    src={user.profileImage}
                                    alt={user.name}
                                    className="w-16 h-16 rounded-full object-cover"
                                />
                            ) : (
                                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                                    <span className="text-2xl text-gray-500">
                                        {user.name.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                            )}
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold">
                                    {user.name}
                                </h3>
                                <p className="text-sm text-gray-600">
                                    {user.email}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                    ID: {user.id}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {data.users.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                    <p>ユーザーが見つかりません</p>
                </div>
            )}
        </div>
    )
}
