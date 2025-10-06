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
    // 注意: 直接呼び出しの場合はtry-catchが必要です
    // useSupabaseQuery/Mutationを使用すれば自動的にエラーがモーダル表示されます
    const handleDirectCall = async () => {
        const supabase = createSupabaseClient()

        try {
            const result =
                await supabaseApiClient.callEdgeFunction<UsersResponse>(
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
            // エラーは既にcallEdgeFunctionでStandardApiError形式に変換されている
            // 必要に応じて追加のエラー処理を行う
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
            <h1 className="mb-6 text-3xl font-bold">CSR Sample Page</h1>

            <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4">
                <h2 className="mb-2 text-lg font-semibold">📖 使用例</h2>
                <p className="mb-3 text-sm text-gray-700">
                    このページはClient Component (CSR) + React
                    Queryでデータを取得・更新しています。
                </p>

                <div className="space-y-3">
                    <div>
                        <h3 className="mb-1 text-sm font-semibold">
                            1. useSupabaseQuery (GET)
                        </h3>
                        <pre className="overflow-x-auto rounded bg-gray-800 p-3 text-xs text-white">
                            {`const { data } = useSupabaseQuery<UsersResponse>({
  queryKey: ['users'],
  functionName: 'samples-api/users',
})`}
                        </pre>
                    </div>

                    <div>
                        <h3 className="mb-1 text-sm font-semibold">
                            2. useSupabaseMutation (POST)
                        </h3>
                        <pre className="overflow-x-auto rounded bg-gray-800 p-3 text-xs text-white">
                            {`const mutation = useSupabaseMutation({
  functionName: 'samples-api/users',
  method: 'POST',
  invalidateQueries: ['users'],
})

mutation.mutate({ name: '太郎', email: 'taro@example.com' })`}
                        </pre>
                    </div>

                    <div>
                        <h3 className="mb-1 text-sm font-semibold">
                            3. callEdgeFunction (直接呼び出し)
                        </h3>
                        <pre className="overflow-x-auto rounded bg-gray-800 p-3 text-xs text-white">
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
            <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6">
                <h2 className="mb-4 text-xl font-semibold">新規ユーザー作成</h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <input
                        type="text"
                        value={newUserName}
                        onChange={(e) => setNewUserName(e.target.value)}
                        placeholder="名前"
                        className="rounded border border-gray-300 px-3 py-2"
                    />
                    <input
                        type="email"
                        value={newUserEmail}
                        onChange={(e) => setNewUserEmail(e.target.value)}
                        placeholder="メールアドレス"
                        className="rounded border border-gray-300 px-3 py-2"
                    />
                    <button
                        onClick={handleCreateUser}
                        disabled={createUserMutation.isPending}
                        className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:bg-gray-400">
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
                    className="rounded bg-purple-600 px-4 py-2 text-white hover:bg-purple-700">
                    callEdgeFunction で直接呼び出し
                </button>
            </div>

            {/* ユーザー一覧 */}
            <div className="mb-4">
                <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-xl font-semibold">ユーザー一覧</h2>
                    <button
                        onClick={() => refetch()}
                        disabled={isLoading}
                        className="rounded bg-gray-200 px-3 py-1 text-sm hover:bg-gray-300 disabled:bg-gray-100">
                        {isLoading ? '読込中...' : '再読込'}
                    </button>
                </div>

                {data && (
                    <p className="mb-4 text-sm text-gray-600">
                        総件数: {data.pagination.total} 件 (ページ:{' '}
                        {data.pagination.page} / {data.pagination.totalPages})
                    </p>
                )}
            </div>

            {isLoading && (
                <div className="py-12 text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
                    <p className="mt-2 text-gray-600">読み込み中...</p>
                </div>
            )}

            {error && (
                <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
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
            )}

            {data && data.users.length === 0 && (
                <div className="py-12 text-center text-gray-500">
                    <p>ユーザーが見つかりません</p>
                </div>
            )}
        </div>
    )
}
