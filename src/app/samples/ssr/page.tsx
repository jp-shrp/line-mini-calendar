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
    // try-catchは行わず、エラー時はNext.jsのError Boundaryに委ねる
    const data = await supabaseApiClient.callEdgeFunction<UsersResponse>(
        async () => {
            return supabase.functions.invoke('samples-api/users', {
                method: 'GET',
            })
        },
        {
            customErrorMessage: 'ユーザー一覧の取得に失敗しました',
        }
    )

    return (
        <div className="container mx-auto p-8">
            <h1 className="mb-6 text-3xl font-bold">SSR Sample Page</h1>

            <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
                <h2 className="mb-2 text-lg font-semibold">📖 使用例</h2>
                <p className="text-sm text-gray-700">
                    このページはServer Component
                    (SSR)でsupabase.functions.invokeを使用してデータを取得しています。
                </p>
                <pre className="mt-3 overflow-x-auto rounded bg-gray-800 p-3 text-xs text-white">
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
                <h2 className="mb-3 text-xl font-semibold">ユーザー一覧</h2>
                <p className="mb-4 text-sm text-gray-600">
                    総件数: {data.pagination.total} 件 (ページ:{' '}
                    {data.pagination.page} / {data.pagination.totalPages})
                </p>
            </div>

            <div className="grid gap-4">
                {data.users.map((user) => (
                    <div
                        key={user.id}
                        className="rounded-lg border border-gray-200 p-4 transition-shadow hover:shadow-md">
                        <div className="flex items-start gap-4">
                            {user.profileImage ? (
                                <img
                                    src={user.profileImage}
                                    alt={user.name}
                                    className="h-16 w-16 rounded-full object-cover"
                                />
                            ) : (
                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-200">
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
                                <p className="mt-1 text-xs text-gray-400">
                                    ID: {user.id}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {data.users.length === 0 && (
                <div className="py-12 text-center text-gray-500">
                    <p>ユーザーが見つかりません</p>
                </div>
            )}
        </div>
    )
}
