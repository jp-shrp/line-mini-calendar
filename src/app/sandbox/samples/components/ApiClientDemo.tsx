'use client'

import {
    UniversalApiClient,
    useApiMutation,
    useApiQuery,
} from '@/lib/universal-api-client'
import { useState } from 'react'

// Mock server用のクライアント設定
const mockApiClient = new UniversalApiClient({
    baseUrl: 'http://localhost:3001',
    defaultHeaders: {
        'Content-Type': 'application/json',
    },
    timeout: 5000,
})

type User = {
    id: number
    name: string
    email: string
    createdAt: string
}

type UsersResponse = {
    users: User[]
    total: number
}

type LoginRequest = {
    email: string
    password: string
}

type LoginResponse = {
    token: string
    user: User
}

export default function ApiClientDemo() {
    const [selectedUserId, setSelectedUserId] = useState<number>(0)
    const [authToken, setAuthToken] = useState<string>('')
    const [directApiResult, setDirectApiResult] = useState<any>(null)

    // useApiQueryの例 - 全ユーザー取得
    const {
        data: usersData,
        isLoading: usersLoading,
        error: usersError,
        refetch: refetchUsers,
    } = useApiQuery<UsersResponse>({
        queryKey: ['users'],
        url: 'http://localhost:3001/api/users',
    })

    // useApiQueryの例 - 特定ユーザー取得（条件付き）
    const {
        data: selectedUser,
        isLoading: userLoading,
        error: userError,
    } = useApiQuery<User>({
        queryKey: ['user', selectedUserId],
        url: `http://localhost:3001/api/users/${selectedUserId}`,
        enabled: !!selectedUserId,
    })

    // useApiMutationの例 - ユーザー作成
    const createUserMutation = useApiMutation<
        User,
        Pick<User, 'name' | 'email'>
    >({
        method: 'POST',
        url: 'http://localhost:3001/api/users',
        onSuccess: () => {
            refetchUsers()
        },
    })

    // useApiMutationの例 - ログイン
    const loginMutation = useApiMutation<LoginResponse, LoginRequest>({
        method: 'POST',
        url: 'http://localhost:3001/api/auth/login',
        onSuccess: (data) => {
            setAuthToken(data.token)
        },
    })

    // useApiMutationの例 - フォーム用ユーザー作成
    const formUserMutation = useApiMutation<User, Pick<User, 'name' | 'email'>>(
        {
            method: 'POST',
            url: 'http://localhost:3001/api/users',
            onSuccess: () => {
                refetchUsers()
            },
        }
    )

    // 認証済みAPIクエリの例
    const {
        data: currentUser,
        isLoading: currentUserLoading,
        error: currentUserError,
    } = useApiQuery<User>({
        queryKey: ['me'],
        url: 'http://localhost:3001/api/auth/me',
        options: {
            headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
        },
        enabled: !!authToken,
    })

    return (
        <div className="space-y-8">
            {/* useApiQuery - 全ユーザー取得 */}
            <section className="rounded-lg border p-4">
                <h2 className="mb-4 text-xl font-semibold">
                    useApiQuery - 全ユーザー取得
                </h2>
                <button
                    onClick={() => refetchUsers()}
                    className="mb-4 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600">
                    再取得
                </button>

                {usersLoading && <p>読み込み中...</p>}
                {usersError && (
                    <p className="text-red-500">エラー: {usersError.message}</p>
                )}
                {usersData && (
                    <div>
                        <p className="mb-2 text-sm text-gray-600">
                            合計: {usersData.total}人
                        </p>
                        <div className="space-y-2">
                            {usersData.users.map((user) => (
                                <div
                                    key={user.id}
                                    className="cursor-pointer rounded border p-2 hover:bg-gray-50"
                                    onClick={() => setSelectedUserId(user.id)}>
                                    <p>
                                        <strong>{user.name}</strong>
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        {user.email}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        作成日:{' '}
                                        {new Date(
                                            user.createdAt
                                        ).toLocaleString()}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </section>

            {/* useApiQuery - 特定ユーザー取得 */}
            <section className="rounded-lg border p-4">
                <h2 className="mb-4 text-xl font-semibold">
                    useApiQuery - 特定ユーザー取得
                </h2>
                <p className="mb-2">上記のユーザーをクリックして詳細を表示</p>
                {selectedUserId && (
                    <>
                        {userLoading && <p>読み込み中...</p>}
                        {userError && (
                            <p className="text-red-500">
                                エラー: {userError.message}
                            </p>
                        )}
                        {selectedUser && (
                            <div className="rounded bg-gray-50 p-4">
                                <h3 className="font-semibold">
                                    選択されたユーザー
                                </h3>
                                <p>ID: {selectedUser.id}</p>
                                <p>名前: {selectedUser.name}</p>
                                <p>メール: {selectedUser.email}</p>
                                <p>
                                    作成日:{' '}
                                    {new Date(
                                        selectedUser.createdAt
                                    ).toLocaleString()}
                                </p>
                            </div>
                        )}
                    </>
                )}
            </section>

            {/* useApiMutation - ユーザー作成 */}
            <section className="rounded-lg border p-4">
                <h2 className="mb-4 text-xl font-semibold">
                    useApiMutation - ユーザー作成
                </h2>
                <div className="space-y-2">
                    <input
                        type="text"
                        placeholder="名前"
                        className="w-full rounded border p-2"
                        id="mutation-name"
                    />
                    <input
                        type="email"
                        placeholder="メールアドレス"
                        className="w-full rounded border p-2"
                        id="mutation-email"
                    />
                    <button
                        onClick={() => {
                            const name = (
                                document.getElementById(
                                    'mutation-name'
                                ) as HTMLInputElement
                            ).value
                            const email = (
                                document.getElementById(
                                    'mutation-email'
                                ) as HTMLInputElement
                            ).value
                            if (name && email) {
                                createUserMutation.mutate({ name, email })
                            }
                        }}
                        disabled={createUserMutation.isPending}
                        className="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600 disabled:opacity-50">
                        {createUserMutation.isPending
                            ? '作成中...'
                            : 'ユーザー作成'}
                    </button>
                    {createUserMutation.error && (
                        <p className="text-red-500">
                            エラー: {createUserMutation.error.message}
                        </p>
                    )}
                    {createUserMutation.isSuccess && (
                        <p className="text-green-500">
                            ユーザーが作成されました！
                        </p>
                    )}
                </div>
            </section>

            {/* useApiMutation - フォーム風ユーザー作成 */}
            <section className="rounded-lg border p-4">
                <h2 className="mb-4 text-xl font-semibold">
                    useApiMutation - フォーム風ユーザー作成
                </h2>
                <div className="space-y-4">
                    <input
                        type="text"
                        placeholder="名前"
                        className="w-full rounded border p-2"
                        id="form-name"
                    />
                    <input
                        type="email"
                        placeholder="メールアドレス"
                        className="w-full rounded border p-2"
                        id="form-email"
                    />
                    <button
                        onClick={() => {
                            const name = (
                                document.getElementById(
                                    'form-name'
                                ) as HTMLInputElement
                            ).value
                            const email = (
                                document.getElementById(
                                    'form-email'
                                ) as HTMLInputElement
                            ).value
                            if (name && email) {
                                formUserMutation.mutate({ name, email })
                            }
                        }}
                        disabled={formUserMutation.isPending}
                        className="rounded bg-purple-500 px-4 py-2 text-white hover:bg-purple-600 disabled:opacity-50">
                        {formUserMutation.isPending
                            ? '送信中...'
                            : 'フォーム送信'}
                    </button>
                    {formUserMutation.error && (
                        <p className="text-red-500">
                            エラー: {formUserMutation.error.message}
                        </p>
                    )}
                    {formUserMutation.isSuccess && (
                        <p className="text-green-500">
                            フォームから送信されました！
                        </p>
                    )}
                </div>
            </section>

            {/* 認証の例 */}
            <section className="rounded-lg border p-4">
                <h2 className="mb-4 text-xl font-semibold">認証の例</h2>
                <div className="space-y-4">
                    <div>
                        <h3 className="mb-2 font-semibold">
                            ログイン（テストアカウント）
                        </h3>
                        <button
                            onClick={() => {
                                loginMutation.mutate({
                                    email: 'test@example.com',
                                    password: 'password',
                                })
                            }}
                            disabled={loginMutation.isPending}
                            className="rounded bg-indigo-500 px-4 py-2 text-white hover:bg-indigo-600 disabled:opacity-50">
                            {loginMutation.isPending
                                ? 'ログイン中...'
                                : 'テストログイン'}
                        </button>
                        {loginMutation.error && (
                            <p className="text-red-500">
                                エラー: {loginMutation.error.message}
                            </p>
                        )}
                        {authToken && (
                            <p className="text-green-500">
                                ログイン成功！トークン:{' '}
                                {authToken.substring(0, 20)}...
                            </p>
                        )}
                    </div>

                    {authToken && (
                        <div>
                            <h3 className="mb-2 font-semibold">
                                認証済みユーザー情報取得
                            </h3>
                            {currentUserLoading && <p>読み込み中...</p>}
                            {currentUserError && (
                                <p className="text-red-500">
                                    エラー: {currentUserError.message}
                                </p>
                            )}
                            {currentUser && (
                                <div className="rounded bg-gray-50 p-4">
                                    <p>ID: {currentUser.id}</p>
                                    <p>名前: {currentUser.name}</p>
                                    <p>メール: {currentUser.email}</p>
                                    <p>
                                        作成日:{' '}
                                        {new Date(
                                            currentUser.createdAt
                                        ).toLocaleString()}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </section>

            {/* UniversalApiClient直接使用の例 */}
            <section className="rounded-lg border p-4">
                <h2 className="mb-4 text-xl font-semibold">
                    UniversalApiClient直接使用
                </h2>
                <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                        Reactフックを使わずに、直接APIクライアントを使用する例です。
                    </p>
                    <button
                        onClick={async () => {
                            try {
                                const result =
                                    await mockApiClient.get<UsersResponse>(
                                        '/api/users'
                                    )
                                setDirectApiResult(result)
                            } catch (error) {
                                setDirectApiResult({
                                    error: (error as Error).message,
                                })
                            }
                        }}
                        className="rounded bg-orange-500 px-4 py-2 text-white hover:bg-orange-600">
                        直接APIを呼び出す
                    </button>
                    {directApiResult && (
                        <div className="rounded bg-gray-50 p-4">
                            <h3 className="mb-2 font-semibold">レスポンス:</h3>
                            <pre className="overflow-auto text-sm">
                                {JSON.stringify(directApiResult, null, 2)}
                            </pre>
                        </div>
                    )}
                </div>
            </section>
        </div>
    )
}
