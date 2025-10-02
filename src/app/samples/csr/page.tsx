'use client'

import { createSupabaseClient } from '@/db/supabase'
import { supabaseApiClient } from '@/src/lib/supabase-api-client'
import { useSupabaseQuery } from '@/src/hooks/useSupabaseQuery'
import { useSupabaseMutation } from '@/src/hooks/useSupabaseMutation'
import { useState } from 'react'

/**
 * CSRサンプルページ
 * Client Component + React Queryでsupabase.functions.invokeを使用する例
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

export default function CSRSamplePage() {
    const [newUserName, setNewUserName] = useState('')
    const [newUserEmail, setNewUserEmail] = useState('')

    // useSupabaseQueryを使用してデータを取得
    const { data, isLoading, error, refetch } = useSupabaseQuery<UsersResponse>(
        {
            queryKey: ['users'],
            functionName: 'samples-api/users',
        }
    )

    // useSupabaseMutationを使用してデータを作成
    const createUserMutation = useSupabaseMutation<
        { user: User },
        { name: string; email: string }
    >({
        functionName: 'samples-api/users',
        method: 'POST',
        invalidateQueries: ['users'],
        onSuccess: () => {
            setNewUserName('')
            setNewUserEmail('')
        },
    })

    // callEdgeFunctionを直接使用する例
    const handleDirectCall = async () => {
        const supabase = createSupabaseClient()

        try {
            const result = await supabaseApiClient.callEdgeFunction<UsersResponse>(
                async () => {
                    return supabase.functions.invoke('samples-api/users', {
                        method: 'GET',
                    })
                },
                {
                    error: {
                        title: 'データ取得エラー',
                        message: 'データの取得に失敗しました',
                    },
                }
            )
            console.log('Direct call result:', result)
            alert(`ユーザー数: ${result.users.length}件`)
        } catch (err) {
            console.error('Direct call error:', err)
        }
    }

    const handleCreateUser = () => {
        if (!newUserName || !newUserEmail) {
            alert('名前とメールアドレスを入力してください')
            return
        }

        createUserMutation.mutate({
            name: newUserName,
            email: newUserEmail,
        })
    }

    return (
        <div className="container mx-auto p-8">
            <h1 className="text-3xl font-bold mb-6">CSR Sample Page</h1>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <h2 className="text-lg font-semibold mb-2">📖 使用例</h2>
                <p className="text-sm text-gray-700 mb-3">
                    このページはClient Component (CSR) + React
                    Queryでデータを取得・更新しています。
                </p>

                <div className="space-y-3">
                    <div>
                        <h3 className="text-sm font-semibold mb-1">
                            1. useSupabaseQuery (GET)
                        </h3>
                        <pre className="p-3 bg-gray-800 text-white rounded text-xs overflow-x-auto">
                            {`const { data } = useSupabaseQuery<UsersResponse>({
  queryKey: ['users'],
  functionName: 'samples-api/users',
})`}
                        </pre>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold mb-1">
                            2. useSupabaseMutation (POST)
                        </h3>
                        <pre className="p-3 bg-gray-800 text-white rounded text-xs overflow-x-auto">
                            {`const mutation = useSupabaseMutation({
  functionName: 'samples-api/users',
  method: 'POST',
  invalidateQueries: ['users'],
})

mutation.mutate({ name: '太郎', email: 'taro@example.com' })`}
                        </pre>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold mb-1">
                            3. callEdgeFunction (直接呼び出し)
                        </h3>
                        <pre className="p-3 bg-gray-800 text-white rounded text-xs overflow-x-auto">
                            {`const result = await supabaseApiClient.callEdgeFunction(
  async () => {
    return supabase.functions.invoke('samples-api/users', {
      method: 'GET',
    })
  },
  { error: { title: 'エラー', message: '失敗しました' } }
)`}
                        </pre>
                    </div>
                </div>
            </div>

            {/* 新規ユーザー作成フォーム */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">
                    新規ユーザー作成
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input
                        type="text"
                        value={newUserName}
                        onChange={(e) => setNewUserName(e.target.value)}
                        placeholder="名前"
                        className="border border-gray-300 rounded px-3 py-2"
                    />
                    <input
                        type="email"
                        value={newUserEmail}
                        onChange={(e) => setNewUserEmail(e.target.value)}
                        placeholder="メールアドレス"
                        className="border border-gray-300 rounded px-3 py-2"
                    />
                    <button
                        onClick={handleCreateUser}
                        disabled={createUserMutation.isPending}
                        className="bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700 disabled:bg-gray-400"
                    >
                        {createUserMutation.isPending
                            ? '作成中...'
                            : 'ユーザー作成'}
                    </button>
                </div>
            </div>

            {/* Direct Call ボタン */}
            <div className="mb-6">
                <button
                    onClick={handleDirectCall}
                    className="bg-purple-600 text-white rounded px-4 py-2 hover:bg-purple-700"
                >
                    callEdgeFunction で直接呼び出し
                </button>
            </div>

            {/* ユーザー一覧 */}
            <div className="mb-4">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-xl font-semibold">ユーザー一覧</h2>
                    <button
                        onClick={() => refetch()}
                        disabled={isLoading}
                        className="text-sm bg-gray-200 px-3 py-1 rounded hover:bg-gray-300 disabled:bg-gray-100"
                    >
                        {isLoading ? '読込中...' : '再読込'}
                    </button>
                </div>

                {data && (
                    <p className="text-sm text-gray-600 mb-4">
                        総件数: {data.pagination.total} 件 (ページ:{' '}
                        {data.pagination.page} / {data.pagination.totalPages})
                    </p>
                )}
            </div>

            {isLoading && (
                <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="mt-2 text-gray-600">読み込み中...</p>
                </div>
            )}

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <h3 className="font-semibold text-red-800">
                        {error.title}
                    </h3>
                    <p className="text-sm text-red-600">{error.message}</p>
                </div>
            )}

            {data && (
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
            )}

            {data && data.users.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                    <p>ユーザーが見つかりません</p>
                </div>
            )}
        </div>
    )
}
