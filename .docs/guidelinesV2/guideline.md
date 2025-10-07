# 開発ガイドライン

このドキュメントは、プロジェクト全体で一貫性のあるコード品質を保つための開発ガイドラインです。

## 🔴 MUST - 絶対に守るべきルール

### 1. スタイリング

- ❌ **禁止**: StyleSheet.create(), インラインstyle属性
- ✅ **必須**: TailwindCssクラスのみ使用

```tsx
// ❌ 禁止
<View style={{ padding: 16 }} />

// ✅ 正しい
<View className="p-4" />
```

### 2. 条件分岐

- ❌ **禁止**: TSXファイル内での三項演算子
- ✅ **必須**: Early returnパターンまたは論理演算子

```tsx
// ❌ 禁止
{
    isLoading ? <Loading /> : <Content />
}

// ✅ 正しい
if (isLoading) return <Loading />
return <Content />
```

### 3. デバッグコード

- ❌ **禁止**: console.log, console.error等の残留
- ✅ **必須**: 本番コードにデバッグコードを含めない

### 4. インポート

- ❌ **禁止**: 相対パス (../../components)
- ✅ **必須**: 絶対パス (@/components)
- ❌ **禁止**: 未使用のインポート

### 5. 型定義

- ❌ **禁止**: any型の使用
- ✅ **必須**: 明示的な型定義

### 6. Form戦略（Model First）

- ✅ **必須**: Model firstアプローチでForm実装
- ✅ **必須**: バリデーションはModelに定義
- ✅ **必須**: リクエスト型はModelから取得
- ❌ **禁止**: コンポーネント内での独自スキーマ定義

```tsx
// ✅ 正しい: Model firstアプローチ
// models/samples/Item.ts
export const ItemSchema = z.object({
    id: z.number(),
    name: z
        .string()
        .min(1, '商品名は必須です')
        .max(100, '商品名は100文字以下で入力してください'),
    // ...その他のフィールド
})
```

### 7. SSRファースト

- ✅ **必須**: SSR前提のページから作成する
- ✅ **必須**: SSRページで動的な処理が必要な場合はcomponentに切り出しCSRで作成する

```tsx
// ✅ 正しい: SSRページコンポーネント
export default async function ProductPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    // サーバーサイドでデータフェッチ
    const product = await getProduct(id)

    return (
        <div className="p-4">
            <h1>{product.name}</h1>
            <p>{product.description}</p>
            {/* 動的な処理が必要な部分はClientComponentに分離 */}
            <ProductInteractionClient productId={product.id} />
        </div>
    )
}

// ✅ 正しい: 動的処理をCSRで分離
;('use client')
export function ProductInteractionClient({ productId }: { productId: string }) {
    const [favorite, setFavorite] = useState(false)

    return (
        <button onClick={() => setFavorite(!favorite)}>
            {favorite ? '❤️' : '🤍'} お気に入り
        </button>
    )
}
```

**SSR vs CSR 判断基準:**

- **SSR適用場面**:
    - 初期表示データが必要（商品詳細、記事内容など）
    - SEO重要コンテンツ（メタタグ、構造化データ）
    - 静的UI（ヘッダー、フッター、ナビゲーション）
    - パフォーマンス重視の初期表示

- **CSR適用場面**:
    - ユーザーインタラクション（ボタンクリック、フォーム操作）
    - リアルタイム更新（チャット、通知、ライブデータ）
    - フォーム入力・バリデーション
    - `useState`、`useEffect`等のReactフックが必要
    - ブラウザ専用API使用（localStorage、geolocation等）

#### 7.1. SSRでのエラーハンドリング

- ✅ **必須**: SSRページコンポーネントでは`try-catch`を行わない
- ✅ **必須**: エラーハンドリングはNext.jsのError Boundaryに委ねる
- ✅ **必須**: `customErrorMessage`付きでAPIを呼び出す
- ✅ **必須**: error.tsxでユーザーフレンドリーなエラー画面を提供

```tsx
// ✅ 正しい: SSRでのエラーハンドリング
import { createSupabaseClient } from '@/db/supabase'
import { supabaseApiClient } from '@/src/lib/supabase-api-client'

export default async function UserPage() {
    const supabase = createSupabaseClient()

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
        <div>
            {/* 正常時のUI */}
            <h1>ユーザー一覧</h1>
            {data.users.map((user) => (
                <div key={user.id}>{user.name}</div>
            ))}
        </div>
    )
}
```

**Error Boundary実装 (error.tsx):**

```tsx
'use client'

interface ErrorPageProps {
    error: Error & { digest?: string }
    reset: () => void
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex min-h-[400px] flex-col items-center justify-center">
                <h1 className="text-4xl font-bold text-red-600">
                    エラーが発生しました
                </h1>
                <p className="mt-4 text-gray-600">
                    {error.message || 'データの取得に失敗しました'}
                </p>
                <button
                    onClick={reset}
                    className="mt-6 rounded-lg bg-blue-600 px-6 py-3 text-white">
                    再試行
                </button>
            </div>
        </div>
    )
}
```

**SSRエラーハンドリングの流れ:**

1. **API呼び出し**: `customErrorMessage`付きで`callEdgeFunction`を呼び出し
2. **エラー発生**: エラー時は`Error(customErrorMessage)`がthrowされる
3. **Error Boundary**: Next.jsが自動でerror.tsxにルーティング
4. **エラー表示**: error.tsxでユーザーフレンドリーな画面を表示

**customErrorMessageのメリット:**

- Server Componentでのtry-catchが不要
- Next.jsの標準的なエラーハンドリングに統一
- コードがシンプルで読みやすい
- エラー画面の一元管理が可能

### 8. エラーハンドリング戦略

- ✅ **必須**: エラーハンドリングの一貫性を保つ
- ✅ **必須**: `QueryStateHandler`コンポーネントを活用
- ✅ **必須**: `useSupabaseQuery`フックで自動エラーハンドリング
- ✅ **必須**: `StandardApiError`型を使用

#### 8.1. エラーハンドリングの基本フロー

```tsx
// ✅ 正しい: QueryStateHandlerを使用したエラーハンドリング
'use client'
import { QueryStateHandler } from '@/src/components/QueryStateHandler'
import { useSupabaseQuery } from '@/src/hooks/useSupabaseQuery'

export function UserList() {
    const { data, isLoading, error } = useSupabaseQuery({
        queryKey: ['users'],
        functionName: 'samples-api/users',
    })

    return (
        <QueryStateHandler
            data={data}
            isLoading={isLoading}
            error={error}
            useGlobalLoading={true}
            loadingMessage="ユーザーを読み込んでいます..."
            notFoundMessage="ユーザーが見つかりません">
            {(users) => (
                <div>
                    {users?.map((user) => (
                        <div key={user.id}>{user.name}</div>
                    ))}
                </div>
            )}
        </QueryStateHandler>
    )
}
```

#### 8.2. エラー種別ごとの処理

**自動処理されるエラー（QueryStateHandler内）:**

- **404エラー**: throwして上位のerror.tsxで処理（NotFoundページ表示）
- **422エラー**: throwして上位のerror.tsxで処理（バリデーションエラー表示）
- **その他のエラー**: モーダル表示（自動）

```tsx
// ✅ 正しい: エラーの自動処理
const { data, isLoading, error } = useSupabaseQuery({
    queryKey: ['user', userId],
    functionName: 'samples-api/users',
    params: { id: userId },
    // suppressErrorModal: false（デフォルト）
    // → エラー時は自動でモーダル表示
})
```

#### 8.3. エラーモーダルを表示しない場合

```tsx
// ✅ 正しい: エラーをコンポーネント内で処理する場合
const { data, isLoading, error } = useSupabaseQuery({
    queryKey: ['user', userId],
    functionName: 'samples-api/users',
    suppressErrorModal: true, // モーダル表示を抑制
})

return (
    <QueryStateHandler
        data={data}
        isLoading={isLoading}
        error={error}
        suppressErrorThrow={true} // エラーをthrowせず、errorComponentを表示
        errorComponent={
            <div className="text-red-600">ユーザーの読み込みに失敗しました</div>
        }>
        {(user) => <div>{user.name}</div>}
    </QueryStateHandler>
)
```

#### 8.4. ローディング状態の管理

```tsx
// ✅ 正しい: グローバルローディングとの連携
<QueryStateHandler
    data={data}
    isLoading={isLoading}
    error={error}
    useGlobalLoading={true} // グローバルローディングと連携
    loadingMessage="データを読み込んでいます..." // カスタムメッセージ
>
    {(data) => <Content data={data} />}
</QueryStateHandler>

// ✅ 正しい: カスタムローディングUI
<QueryStateHandler
    data={data}
    isLoading={isLoading}
    error={error}
    loadingComponent={
        <div className="flex items-center justify-center">
            <CustomSpinner />
        </div>
    }
>
    {(data) => <Content data={data} />}
</QueryStateHandler>
```

#### 8.5. 新規作成モード

```tsx
// ✅ 正しい: 新規作成時はローディング・NotFoundをスキップ
<QueryStateHandler
    data={data}
    isLoading={isLoading}
    error={error}
    isNewMode={isNew} // 新規作成時はtrue
>
    {(data) => <UserForm initialData={data} />}
</QueryStateHandler>
```

#### 8.6. StandardApiError型

```tsx
// ✅ 正しい: StandardApiError型の定義
export interface StandardApiError {
    status: number
    title: string
    message: string
    errors?: Record<string, string[]>
}

// Edge Functionからのレスポンス例
{
    status: 422,
    title: 'Validation Error',
    message: '入力内容に誤りがあります',
    errors: {
        name: ['名前は必須です'],
        email: ['メールアドレスの形式が正しくありません']
    }
}
```

### 9. ディレクトリ構成

- ✅ **必須**: 以下の標準ディレクトリ構成に従う

```
feature-name/
├── page.tsx          # Next.js App Router Page Component
├── error.tsx         # Error Boundary (必要に応じて)
├── components/       # UI Components
│   ├── FeatureClient.tsx    # Client Component (useHookを呼び出し)
│   ├── MainView.tsx         # Presentational Component
│   └── SubComponent.tsx     # 機能固有のコンポーネント
├── hooks/           # Custom Hooks
│   └── useFeature.ts       # Business Logic Hook
├── api/             # API関連
│   ├── query-key.ts        # React Query Keys
│   └── feature-query.ts    # Query Functions
└── [id]/            # 動的ルート (必要に応じて)
    ├── page.tsx
    ├── components/
    ├── hooks/
    └── api/
```

**命名規則:**

- **Client Component**: `FeatureClient.tsx` (useHookを呼び出し、MainViewにpropsを渡す)
- **Hook**: `useFeature.ts` (APIクエリーフックを呼び出し、ビジネスロジックを処理)
- **Query**: `useFeatureQuery.ts` (React Queryを使用したAPI呼び出し)
- **Query Key**: クエリキーは階層構造で定義

**Modelディレクトリ構成:**

```
src/models/
├── entities/ # DBのsourceに存在しないエンティティモデル
│   ├── Paginate.ts # ページネーション用エンティティ
│   └── Cart.ts # カート機能用エンティティ
└── *.ts # DBのsourceに対応するモデル (Product.ts, User.ts等)
```

**Model配置ルール:**

- ✅ **必須**: DBのテーブルに対応するモデルは`src/models/`直下に配置
- ✅ **必須**: DBのsourceに存在しないエンティティモデルは`src/models/entities/`に配置

### 10. Hook+View分離パターン（MUST）

- ❌ **禁止**: ビジネスロジックとViewを同一コンポーネント内に混在させること
- ✅ **必須**: すべてのClient Componentでhook+viewパターンを適用すること
- ✅ **必須**: `ReturnType<typeof useCustomHook>`で型を自動推論すること
- ✅ **必須**: 許容や例外は認めない。コードの統一性を最優先すること

**重要**: 「シンプルだから」「計算ロジックが少ないから」といった理由で例外を認めない。
すべてのコンポーネントで統一されたパターンを適用することで、コードベース全体の保守性と可読性を保つ。

**パターンA: 1ファイル内でhookとviewを分離（小〜中規模コンポーネント推奨）**

```tsx
// components/UserList.tsx
import { useOnLoading } from '@/contexts/OnLoadingContext'

const useUserList = () => {
    const [users, setUsers] = useState<User[]>([])
    const { onLoad } = useOnLoading()

    const fetchUsers = async () => {
        await onLoad(async () => {
            // fetch logic
        })
    }

    return {
        users,
        fetchUsers,
    }
}

const MainView: FC<ReturnType<typeof useUserList>> = ({
    users,
    fetchUsers,
}) => {
    return (
        <View className="flex-1 p-4">
            {users.map((user) => (
                <Text key={user.id}>{user.name}</Text>
            ))}
        </View>
    )
}

export const UserList = () => {
    const hookItems = useUserList()
    return <MainView {...hookItems} />
}
```

**パターンB: hookとviewを完全に分離**

```tsx
// hooks/useUserDetail.ts
import { useOnLoading } from '@/contexts/OnLoadingContext'

export const useUserDetail = (userId: string) => {
    const [user, setUser] = useState<User | null>(null)
    const { onLoad } = useOnLoading()

    const fetchUser = async () => {
        await onLoad(async () => {
            // fetch logic
        })
    }

    return {
        user,
        fetchUser,
    }
}

// components/UserDetail.tsx
import { useUserDetail } from './hooks/useUserDetail'

const MainView: FC<ReturnType<typeof useUserDetail>> = ({
    user,
    fetchUser,
}) => {
    if (!user) return <Text>User not found</Text>

    return (
        <View className="flex-1 p-4">
            <Text className="text-xl font-bold">{user.name}</Text>
            <Text className="text-gray-600">{user.email}</Text>
        </View>
    )
}

export const UserDetail = ({ userId }: { userId: string }) => {
    const hookItems = useUserDetail(userId)
    return <MainView {...hookItems} />
}
```

### 11. React Query統合パターン（MUST）

- ✅ **必須**: Query Keysは必ず分離して定義すること
- ✅ **必須**: `useSupabaseQuery`と`useSupabaseMutation`を使用すること
- ✅ **必須**: Business Logic HookでQuery Hooksを呼び出すこと
- ❌ **禁止**: コンポーネント内で直接Query Hooksを呼び出すこと

#### 11.1. Query Keys定義（必須）

Query Keysは階層構造で定義し、キャッシュの無効化を容易にします。

```tsx
// api/query-key.ts
export const userQueryKeys = {
    all: ['users'] as const,
    items: () => [...userQueryKeys.all, 'items'] as const,
    lists: () => [...userQueryKeys.items(), 'list'] as const,
    list: (filters: Record<string, unknown>) =>
        [...userQueryKeys.lists(), { filters }] as const,
    details: () => [...userQueryKeys.items(), 'detail'] as const,
    detail: (id: string) => [...userQueryKeys.details(), id] as const,
}

// 使用例
// ['users'] - すべてのユーザー関連キャッシュを無効化
// ['users', 'items', 'list'] - リスト系のキャッシュを無効化
// ['users', 'items', 'detail', '123'] - 特定のユーザー詳細キャッシュを無効化
```

#### 11.2. Query Hook定義

`useSupabaseQuery`を使用してSupabase Edge Functionを呼び出します。

```tsx
// api/user-query.ts
import { useSupabaseQuery } from '@/src/hooks/useSupabaseQuery'
import { userQueryKeys } from './query-key'
import type { User } from '@/src/models/User'

// 基本的なQuery Hook
export const useUserListQuery = () => {
    return useSupabaseQuery<User[]>({
        queryKey: userQueryKeys.lists(),
        functionName: 'samples-api/users',
        method: 'GET',
    })
}

// パラメータ付きQuery Hook
export const useUserDetailQuery = (userId: string) => {
    return useSupabaseQuery<User>({
        queryKey: userQueryKeys.detail(userId),
        functionName: 'samples-api/users',
        method: 'GET',
        params: { id: userId },
    })
}

// エラーハンドリング付きQuery Hook
export const useUserWithErrorQuery = (errorType: '400' | '500') => {
    return useSupabaseQuery<User[]>({
        queryKey: userQueryKeys.lists(),
        functionName: `samples-api/users/${errorType}`,
        method: 'GET',
        suppressErrorModal: true, // エラーモーダルを表示しない
    })
}
```

#### 11.3. Mutation Hook定義

`useSupabaseMutation`を使用してCREATE/UPDATE/DELETE操作を行います。

```tsx
// api/user-mutation.ts
import { useSupabaseMutation } from '@/src/hooks/useSupabaseMutation'
import { userQueryKeys } from './query-key'
import type { User, CreateUserRequest } from '@/src/models/User'

// ユーザー作成Mutation
export const useCreateUserMutation = () => {
    return useSupabaseMutation<User, CreateUserRequest>({
        functionName: 'samples-api/users',
        method: 'POST',
        invalidateKeys: [userQueryKeys.lists()], // 作成後にリストを再取得
        successMessage: 'ユーザーを作成しました',
    })
}

// ユーザー更新Mutation
export const useUpdateUserMutation = () => {
    return useSupabaseMutation<User, Partial<User>>({
        functionName: 'samples-api/users',
        method: 'PUT',
        invalidateKeys: [userQueryKeys.all], // すべてのユーザーキャッシュを無効化
        successMessage: 'ユーザー情報を更新しました',
    })
}

// ユーザー削除Mutation
export const useDeleteUserMutation = () => {
    return useSupabaseMutation<void, { id: string }>({
        functionName: 'samples-api/users',
        method: 'DELETE',
        invalidateKeys: [userQueryKeys.all],
        successMessage: 'ユーザーを削除しました',
    })
}
```

#### 11.4. Business Logic Hook実装パターン

Business Logic Hookは以下の要素を組み合わせて実装します：

1. **useState**: コンポーネント固有の状態管理
2. **React Query Hooks**: API呼び出しとキャッシュ管理
3. **useCallback**: ハンドラー関数の最適化
4. **ビジネスロジック関数**: UI操作に必要な処理
5. **統一された戻り値**: UI表示に必要なすべての値・関数

```tsx
// hooks/useUserList.ts
import { useState, useCallback } from 'react'
import { useUserListQuery } from '../api/user-query'
import { useDeleteUserMutation } from '../api/user-mutation'

export const useUserList = () => {
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null)

    // Query Hook
    const { data, isLoading, error, refetch } = useUserListQuery()

    // Mutation Hook
    const deleteMutation = useDeleteUserMutation()

    // ハンドラー関数
    const handleSelectUser = useCallback((userId: string) => {
        setSelectedUserId(userId)
    }, [])

    const handleDeleteUser = useCallback(
        async (userId: string) => {
            await deleteMutation.mutateAsync({ id: userId })
            setSelectedUserId(null)
        },
        [deleteMutation]
    )

    const handleRefresh = useCallback(() => {
        refetch()
    }, [refetch])

    // 統一された戻り値
    return {
        users: data || [],
        isLoading,
        error,
        selectedUserId,
        isDeleting: deleteMutation.isPending,
        handleSelectUser,
        handleDeleteUser,
        handleRefresh,
    }
}
```

#### 11.5. 統合パターンの全体像

```tsx
// ✅ 正しい: API + Hook + Component 統合

// 1. Query Keys定義 (api/query-key.ts)
export const userQueryKeys = {
    all: ['users'] as const,
    items: () => [...userQueryKeys.all, 'items'] as const,
    lists: () => [...userQueryKeys.items(), 'list'] as const,
    details: () => [...userQueryKeys.items(), 'detail'] as const,
    detail: (id: string) => [...userQueryKeys.details(), id] as const,
}

// 2. Query Hook定義 (api/user-query.ts)
export const useUserListQuery = () => {
    return useSupabaseQuery<User[]>({
        queryKey: userQueryKeys.lists(),
        functionName: 'samples-api/users',
    })
}

// 3. Business Logic Hook (hooks/useUserList.ts)
const useUserList = () => {
    const { data, isLoading, error, refetch } = useUserListQuery()

    return {
        users: data || [],
        isLoading,
        error,
        refetch,
    }
}

// 4. Client Component (components/UserListClient.tsx)
const UserListClient = () => {
    const hookData = useUserList()
    return <MainView {...hookData} />
}
```

#### 11.6. Query Options

`useSupabaseQuery`では以下のオプションが利用可能です：

```tsx
useSupabaseQuery({
    queryKey: userQueryKeys.lists(),
    functionName: 'samples-api/users',
    method: 'GET', // デフォルトはGET
    params: { limit: 10 }, // クエリパラメータ
    body: undefined, // POSTボディ（GETでは不要）
    suppressErrorModal: false, // エラーモーダルの表示制御
    enabled: true, // クエリの有効化制御
    staleTime: 5 * 60 * 1000, // 5分間はフレッシュとみなす
    gcTime: 10 * 60 * 1000, // 10分間キャッシュを保持
    retry: 1, // リトライ回数
})
```

#### 11.7. Mutation Options

`useSupabaseMutation`では以下のオプションが利用可能です：

```tsx
useSupabaseMutation({
    functionName: 'samples-api/users',
    method: 'POST',
    invalidateKeys: [userQueryKeys.lists()], // 無効化するキャッシュキー
    successMessage: '作成しました', // 成功時のメッセージ
    errorMessage: '作成に失敗しました', // エラー時のメッセージ
    onSuccess: (data) => {
        // 成功時の追加処理
    },
    onError: (error) => {
        // エラー時の追加処理
    },
})
```

### 12. 共通型定義（Schema Firstアプローチ）（MUST）

- ✅ **必須**: リソース系の型は`_shared/schemas/*`から生成すること
- ✅ **必須**: バリデーションは`_shared/validations/*`に定義すること
- ✅ **必須**: Edge FunctionsとClient両方で使用する型は`_shared/types/`に配置すること
- ❌ **禁止**: 型の重複定義

#### 12.1. ディレクトリ構成

```
supabase/functions/_shared/
├── schemas/                # Drizzle ORMスキーマ定義（単一の真実の源）
│   ├── index.ts            # 全スキーマのエクスポート
│   └── users.ts            # テーブルスキーマと基本型定義
├── validations/            # Zodバリデーションスキーマ
│   ├── index.ts            # 全バリデーションのエクスポート
│   ├── createUserValidation.ts  # フォームバリデーション定義
│   └── usersValidation.ts  # API入力バリデーション定義
├── types/                  # API固有の型定義（Schemaから生成）
│   ├── common/             # 共通型
│   │   └── errors.ts       # エラー型定義
│   ├── responses.ts        # レスポンス共通型
│   ├── pagination-types.ts # ページネーション型
│   └── users-api-types.ts  # Users API固有の型定義
├── services/               # ビジネスロジック層
│   └── userService.ts      # ユーザー関連のビジネスロジック
└── middlewares/            # ミドルウェア
    └── middleware.ts       # 共通ミドルウェア
```

#### 12.2. Schema定義（Drizzle ORM）

スキーマは単一の真実の源（Single Source of Truth）として機能します。

```tsx
// supabase/functions/_shared/schemas/users.ts
import { type InferInsertModel, type InferSelectModel } from 'drizzle-orm'
import { pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'

/**
 * users テーブルのスキーマを定義します。
 * 主な仕様: ユーザー情報を管理します
 */
export const users = pgTable('users', {
    id: uuid('id').primaryKey().defaultRandom(),
    email: varchar('email', { length: 255 }).unique().notNull(),
    name: varchar('name', { length: 100 }),
    profileImage: text('profile_image'),
    auth0Id: text('auth0_id').unique(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Drizzle ORMから型を自動生成
export type SelectUser = InferSelectModel<typeof users>
export type InsertUser = InferInsertModel<typeof users>
export type UpdateUser = Partial<InsertUser>
```

#### 12.3. Validation定義（Zod）

バリデーションスキーマはフォーム入力やAPI入力の検証に使用します。

```tsx
// supabase/functions/_shared/validations/createUserValidation.ts
import { z } from 'zod'

/**
 * ユーザー作成時のバリデーションスキーマ
 *
 * @description
 * クライアント側のフォームバリデーションで使用
 * InsertUser型をベースに、必須フィールドとバリデーションルールを定義
 */
export const createUserSchema = z.object({
    email: z
        .string()
        .min(1, 'メールアドレスを入力してください')
        .email('有効なメールアドレスを入力してください')
        .max(255, 'メールアドレスは255文字以内で入力してください'),
    name: z
        .string()
        .min(1, '名前を入力してください')
        .min(2, '名前は2文字以上で入力してください')
        .max(100, '名前は100文字以内で入力してください')
        .optional()
        .transform((val) => val || undefined),
})

/**
 * ユーザー作成フォームの型定義
 */
export type CreateUserFormData = z.infer<typeof createUserSchema>

/**
 * ユーザー更新時のバリデーションスキーマ
 */
export const updateUserSchema = z.object({
    email: z
        .string()
        .email('有効なメールアドレスを入力してください')
        .max(255, 'メールアドレスは255文字以内で入力してください')
        .optional(),
    name: z
        .string()
        .min(2, '名前は2文字以上で入力してください')
        .max(100, '名前は100文字以内で入力してください')
        .optional(),
    profileImage: z.string().url('有効なURLを入力してください').optional(),
})

export type UpdateUserFormData = z.infer<typeof updateUserSchema>
```

#### 12.4. API型定義（Schema First）

API固有の型はSchemaから生成された型をベースに拡張します。

```tsx
// supabase/functions/_shared/types/users-api-types.ts

/**
 * Users API関連の型定義
 * クライアント側とEdge Functions側で共通利用
 * Schema firstアプローチで型を生成
 */

import type { InsertUser, SelectUser, UpdateUser } from '_shared/schemas/users'

// Schemaから生成された型を再エクスポート
export type User = SelectUser

// API固有のレスポンス型定義
export interface UsersListResponse {
    users: User[]
    total: number
    page: number
    pageSize: number
}

export interface UserDetailResponse {
    user: User
}

// API固有の入力型定義（Schemaの型をベースに拡張）
export type CreateUserInput = Omit<InsertUser, 'id' | 'createdAt' | 'updatedAt'>
export type UpdateUserInput = UpdateUser
```

#### 12.5. 型のフロー

```
┌─────────────────────────────────────────────────┐
│ 1. Schema定義 (Single Source of Truth)         │
│ supabase/functions/_shared/schemas/users.ts     │
│ - Drizzle ORMスキーマ                           │
│ - SelectUser, InsertUser, UpdateUser型生成      │
└─────────────────┬───────────────────────────────┘
                  │
                  ├──────────────────────────────────┐
                  │                                  │
         ┌────────▼────────┐              ┌─────────▼────────┐
         │ 2. Validation   │              │ 3. API Types     │
         │ _shared/        │              │ _shared/types/   │
         │ validations/    │              │ *-api-types.ts   │
         │ - Zodスキーマ   │              │ - Request型      │
         │ - Form型        │              │ - Response型     │
         └────────┬────────┘              └─────────┬────────┘
                  │                                  │
                  └──────────────┬───────────────────┘
                                 │
                  ┌──────────────▼──────────────────┐
                  │ 4. Client & Edge Functions      │
                  │ - フォームバリデーション         │
                  │ - API呼び出し                   │
                  │ - レスポンス処理                │
                  └─────────────────────────────────┘
```

#### 12.6. importパスの規則

- ✅ **必須**: `_shared/`で始まるaliasを使用すること
- ✅ **必須**: 相対パスではなく絶対パスを使用すること

```tsx
// ✅ 正しい: aliasを使用
import type { User } from '_shared/types/users-api-types'
import { createUserSchema } from '_shared/validations/createUserValidation'
import { users } from '_shared/schemas/users'

// ❌ 禁止: 相対パス
import type { User } from '../../_shared/types/users-api-types'
```

#### 12.7. 型定義のベストプラクティス

**Schema First原則:**

1. **Schema定義**: Drizzle ORMでテーブルスキーマを定義
2. **型生成**: `InferSelectModel`と`InferInsertModel`で基本型を生成
3. **型拡張**: API固有の型は基本型をベースに`Omit`や`Pick`で拡張
4. **バリデーション**: Zodスキーマは基本型の制約を考慮して定義

**型の命名規則:**

```tsx
// Schema由来の型
export type SelectUser = InferSelectModel<typeof users> // DB読み取り型
export type InsertUser = InferInsertModel<typeof users> // DB挿入型
export type UpdateUser = Partial<InsertUser> // DB更新型

// API固有の型
export type User = SelectUser // クライアント向け公開型
export type CreateUserInput = Omit<InsertUser, 'id' | 'createdAt' | 'updatedAt'>
export type UpdateUserInput = UpdateUser

// Validation由来の型
export type CreateUserFormData = z.infer<typeof createUserSchema>
export type UpdateUserFormData = z.infer<typeof updateUserSchema>
```

**型の再利用:**

```tsx
// ✅ 正しい: 型を再利用
import type { User } from '_shared/types/users-api-types'

interface UserListProps {
    users: User[]
}

// ❌ 禁止: 型を重複定義
interface UserListProps {
    users: {
        id: string
        email: string
        name: string
        // ...
    }[]
}
```
