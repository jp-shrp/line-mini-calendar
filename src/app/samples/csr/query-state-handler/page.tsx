'use client'

import { QueryStateHandler } from '@/src/components/QueryStateHandler'
import { useSupabaseQuery } from '@/src/hooks/useSupabaseQuery'
import { useSupabaseMutation } from '@/src/hooks/useSupabaseMutation'
import { useState } from 'react'

/**
 * QueryStateHandler + useSupabaseQuery 連携サンプル
 *
 * このサンプルでは以下を実演します：
 * 1. useSupabaseQueryとQueryStateHandlerの基本的な連携
 * 2. グローバルローディングとの連携
 * 3. カスタムエラーハンドリング
 * 4. データなし状態のカスタマイズ
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

export default function QueryStateHandlerSamplePage() {
    const [newUserName, setNewUserName] = useState('')
    const [newUserEmail, setNewUserEmail] = useState('')

    // 基本的な使い方: useSupabaseQueryの結果をQueryStateHandlerに渡す
    const { data, isLoading, error, refetch } = useSupabaseQuery<UsersResponse>(
        {
            queryKey: ['users', 'query-state-handler-sample'],
            functionName: 'samples-api/users',
        }
    )

    // グローバルローディングを使用する例
    const {
        data: _dataWithGlobalLoading,
        isLoading: _isLoadingGlobal,
        error: _errorGlobal,
    } = useSupabaseQuery<UsersResponse>({
        queryKey: ['users', 'global-loading'],
        functionName: 'samples-api/users',
        enabled: false, // 手動で実行
    })

    // エラーモーダルを表示しない例
    const {
        data: _dataNoModal,
        isLoading: _isLoadingNoModal,
        error: _errorNoModal,
    } = useSupabaseQuery<UsersResponse>({
        queryKey: ['users', 'no-modal'],
        functionName: 'samples-api/users',
        suppressErrorModal: true, // エラーモーダルを表示しない
        enabled: false, // 手動で実行
    })

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
            <h1 className="mb-6 text-3xl font-bold">
                QueryStateHandler + useSupabaseQuery 連携サンプル
            </h1>

            {/* 使用例の説明 */}
            <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
                <h2 className="mb-2 text-lg font-semibold">
                    📖 このサンプルについて
                </h2>
                <p className="mb-3 text-sm text-gray-700">
                    <code className="rounded bg-white px-1">
                        QueryStateHandler
                    </code>
                    と
                    <code className="rounded bg-white px-1">
                        useSupabaseQuery
                    </code>
                    を組み合わせることで、以下のメリットが得られます：
                </p>
                <ul className="ml-4 list-disc space-y-1 text-sm text-gray-700">
                    <li>
                        <strong>統一的なUI状態管理</strong>:
                        ローディング、エラー、データなしの状態を一元管理
                    </li>
                    <li>
                        <strong>簡潔なコード</strong>:
                        条件分岐を減らし、宣言的にUIを記述
                    </li>
                    <li>
                        <strong>柔軟なカスタマイズ</strong>:
                        ローディングやエラー表示を簡単にカスタマイズ可能
                    </li>
                    <li>
                        <strong>グローバルローディング対応</strong>:
                        useOnLoadingとの連携も可能
                    </li>
                </ul>
            </div>

            {/* コード例 */}
            <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4">
                <h3 className="text-md mb-2 font-semibold">
                    💡 基本的な使い方
                </h3>
                <pre className="overflow-x-auto rounded bg-gray-800 p-3 text-xs text-white">
                    {`// 1. useSupabaseQueryでデータ取得
const { data, isLoading, error } = useSupabaseQuery<UsersResponse>({
  queryKey: ['users'],
  functionName: 'samples-api/users',
})

// 2. QueryStateHandlerに渡すだけ！
<QueryStateHandler
  data={data}
  isLoading={isLoading}
  error={error}
>
  {(data) => (
    // データが正常に取得できた時のUI
    <div>
      {data.users.map(user => (
        <UserCard key={user.id} user={user} />
      ))}
    </div>
  )}
</QueryStateHandler>`}
                </pre>
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

            {/* 例1: 基本的な使い方 */}
            <div className="mb-8 rounded-lg border border-gray-200 p-6">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-semibold">
                        例1: 基本的な使い方（デフォルト設定）
                    </h2>
                    <button
                        onClick={() => refetch()}
                        disabled={isLoading}
                        className="rounded bg-gray-200 px-3 py-1 text-sm hover:bg-gray-300 disabled:bg-gray-100">
                        {isLoading ? '読込中...' : '再読込'}
                    </button>
                </div>

                <QueryStateHandler
                    data={data}
                    isLoading={isLoading}
                    error={error}>
                    {(data) => (
                        <div>
                            <p className="mb-4 text-sm text-gray-600">
                                総件数: {data?.pagination.total} 件 (ページ:{' '}
                                {data?.pagination.page} /{' '}
                                {data?.pagination.totalPages})
                            </p>
                            <div className="grid gap-4">
                                {data?.users.map((user) => (
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
                                                        {user.name
                                                            .charAt(0)
                                                            .toUpperCase()}
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
                        </div>
                    )}
                </QueryStateHandler>
            </div>

            {/* 例2: カスタムローディングメッセージ */}
            <div className="mb-8 rounded-lg border border-gray-200 p-6">
                <h2 className="mb-4 text-xl font-semibold">
                    例2: カスタムローディングメッセージ
                </h2>
                <p className="mb-4 text-sm text-gray-600">
                    <code className="rounded bg-gray-100 px-1">
                        loadingMessage
                    </code>
                    プロパティでローディング中のメッセージをカスタマイズできます
                </p>

                <QueryStateHandler
                    data={data}
                    isLoading={isLoading}
                    error={error}
                    loadingMessage="ユーザー情報を取得中です...">
                    {(data) => (
                        <div className="text-center text-green-600">
                            {data?.users.length} 件のユーザーが見つかりました
                        </div>
                    )}
                </QueryStateHandler>
            </div>

            {/* 例3: エラーモーダルを表示しない例 */}
            <div className="mb-8 rounded-lg border border-yellow-200 bg-yellow-50 p-6">
                <h2 className="mb-4 text-xl font-semibold">
                    例3: suppressErrorModal (エラーモーダルを表示しない)
                </h2>
                <p className="mb-4 text-sm text-gray-700">
                    <code className="rounded bg-white px-1">
                        suppressErrorModal: true
                    </code>
                    を指定すると、エラーモーダルが表示されず、
                    <code className="rounded bg-white px-1">
                        suppressErrorThrow: true
                    </code>
                    でカスタムエラーUIを表示できます
                </p>

                <button
                    onClick={() =>
                        refetch().then(() => {
                            // エラーを発生させるために不正なクエリキーでfetch
                        })
                    }
                    className="mb-4 rounded bg-yellow-600 px-4 py-2 text-white hover:bg-yellow-700">
                    テスト読込（エラーモーダルなし）
                </button>

                <QueryStateHandler
                    data={_dataNoModal}
                    isLoading={_isLoadingNoModal}
                    error={_errorNoModal}
                    suppressErrorThrow={true}
                    errorComponent={
                        <div className="rounded-lg border border-red-300 bg-red-100 p-4">
                            <div className="text-lg font-semibold text-red-800">
                                カスタムエラー表示
                            </div>
                            <div className="text-sm text-red-600">
                                エラーが発生しましたが、モーダルは表示されません
                            </div>
                        </div>
                    }>
                    {() => (
                        <div className="text-center text-green-600">
                            正常にデータを取得できました
                        </div>
                    )}
                </QueryStateHandler>
            </div>

            {/* 例4: データなし時のカスタマイズ */}
            <div className="mb-8 rounded-lg border border-gray-200 p-6">
                <h2 className="mb-4 text-xl font-semibold">
                    例4: データなし時のカスタマイズ
                </h2>
                <p className="mb-4 text-sm text-gray-600">
                    <code className="rounded bg-gray-100 px-1">
                        notFoundComponent
                    </code>
                    や
                    <code className="rounded bg-gray-100 px-1">
                        notFoundMessage
                    </code>
                    でカスタマイズできます
                </p>

                <QueryStateHandler
                    data={undefined} // 意図的にundefinedを渡す
                    isLoading={false}
                    error={undefined}
                    notFoundComponent={
                        <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
                            <div className="mb-2 text-4xl">📭</div>
                            <div className="text-lg font-semibold text-gray-700">
                                カスタム「データなし」UI
                            </div>
                            <div className="text-sm text-gray-500">
                                独自のデザインでデータなし状態を表現できます
                            </div>
                        </div>
                    }>
                    {() => <div>このテキストは表示されません</div>}
                </QueryStateHandler>
            </div>

            {/* 使用上の注意 */}
            <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
                <h3 className="text-md mb-2 font-semibold">⚠️ 使用上の注意</h3>
                <ul className="ml-4 list-disc space-y-1 text-sm text-gray-700">
                    <li>
                        <code className="rounded bg-white px-1">
                            suppressErrorModal
                        </code>
                        を使用する場合は、必ず
                        <code className="rounded bg-white px-1">
                            suppressErrorThrow: true
                        </code>
                        も設定してください
                    </li>
                    <li>
                        グローバルローディングを使用する場合は、
                        <code className="rounded bg-white px-1">
                            useGlobalLoading: true
                        </code>
                        を設定します
                    </li>
                    <li>
                        新規作成モード（
                        <code className="rounded bg-white px-1">
                            isNewMode: true
                        </code>
                        ）では、ローディングやデータなし状態がスキップされます
                    </li>
                </ul>
            </div>
        </div>
    )
}
