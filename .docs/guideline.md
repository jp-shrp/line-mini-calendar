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

### 6. Model戦略（@team-decorate/alcts）

- ✅ **必須**: `@team-decorate/alcts`を使用してModelクラスを実装
- ✅ **必須**: Modelクラスは`_shared/schemas`の型を`implements`すること
- ✅ **必須**: `fillable`配列でマッピング可能なプロパティを定義
- ✅ **必須**: フロントエンドでのデータマッピングはModelクラス経由で実行
- ❌ **禁止**: スキーマ型を直接使用してデータ操作すること

```tsx
// ✅ 正しい: @team-decorate/alctsを使用したModel定義
// src/models/samples/event.ts
import { IIndexable, Model } from '@team-decorate/alcts'
import { SelectEvent } from '_shared/schemas/events'

const fillable: (keyof SelectEvent)[] = [
    'id',
    'title',
    'description',
    'startDatetime',
    'endDatetime',
    // ...その他のフィールド
]

export class Event extends Model implements SelectEvent {
    id = ''
    title = ''
    description: string | null = null
    // ...その他のプロパティ

    constructor(data?: IIndexable) {
        super()
        this.convert = false
        this.fillable = fillable
        if (data) {
            this.data = data
        }
    }
}

// 使用例
const event = new Event(apiResponse)
console.log(event.title) // マッピングされたデータにアクセス
```

**Modelの役割:**

- **データマッピング**: API レスポンスをフロントエンド用のデータ構造に変換
- **型安全性**: スキーマ型を`implements`することで型の一貫性を保証
- **fillable制御**: マッピング可能なプロパティを明示的に管理

### 7. Form戦略（Schema First）

- ✅ **必須**: Schema firstアプローチでForm実装
- ✅ **必須**: スキーマは`_shared/schemas`に定義（Drizzle ORM）
- ✅ **必須**: バリデーションは`_shared/validations`に定義（Zod）
- ✅ **必須**: リクエスト型は`_shared/types`から取得
- ❌ **禁止**: コンポーネント内での独自スキーマ定義

```tsx
// ✅ 正しい: Schema firstアプローチ

// 1. スキーマ定義（Drizzle ORM）
// supabase/functions/_shared/schemas/events.ts
export const events = pgTable('events', {
    id: uuid('id').primaryKey().defaultRandom(),
    title: varchar('title', { length: 100 }).notNull(),
    description: text('description'),
    // ...その他のフィールド
})

export type SelectEvent = InferSelectModel<typeof events>
export type InsertEvent = InferInsertModel<typeof events>

// 2. バリデーション定義（Zod）
// supabase/functions/_shared/validations/eventsValidation.ts
export const createEventSchema = z.object({
    title: z
        .string()
        .min(1, 'タイトルは必須です')
        .max(100, 'タイトルは100文字以下で入力してください'),
    description: z.string().optional(),
    // ...その他のバリデーション
})

export type CreateEventFormData = z.infer<typeof createEventSchema>

// 3. フロントエンドのModel定義（@team-decorate/alcts）
// src/models/samples/event.ts
export class Event extends Model implements SelectEvent {
    id = ''
    title = ''
    description: string | null = null
    // ...その他のプロパティ

    constructor(data?: IIndexable) {
        super()
        this.convert = false
        this.fillable = fillable
        if (data) {
            this.data = data
        }
    }
}
```

### 8. SSRファースト

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

### 9. エラーハンドリング戦略

- ✅ **必須**: エラーハンドリングの一貫性を保つ
- ✅ **必須**: SSRとCSRで適切なエラーハンドリングパターンを使い分ける
- ✅ **必須**: `StandardApiError`型を使用

#### 9.1. SSRでのエラーハンドリング

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

#### 9.2. CSRでのエラーハンドリング

- ✅ **必須**: `QueryStateHandler`コンポーネントを活用
- ✅ **必須**: `useSupabaseQuery`フックで自動エラーハンドリング

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

#### 9.3. エラーモーダルを表示しない場合

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

#### 9.4. ローディング状態の管理

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

#### 9.5. 新規作成モード

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

#### 9.6. StandardApiError型

```tsx
// ✅ 正しい: StandardApiError型の定義
// middleware.tsのApiErrorクラスのtoStandardError()メソッドが返す型
export interface StandardApiError {
    title: string // エラータイトル
    message: string // エラーメッセージ（ユーザー向け）
    code: string // エラーコード（例: VALIDATION_ERROR, NOT_FOUND）
    status: number // HTTPステータスコード
    details?: any // 追加の詳細情報（バリデーションエラーの場合はフィールドごとのエラー等）
}

// Edge Functionからのレスポンス例（バリデーションエラー）
{
    title: 'バリデーションエラー',
    message: '入力内容に不備があります。内容をご確認ください。',
    code: 'VALIDATION_ERROR',
    status: 422,
    details: [
        {
            field: 'name',
            message: '名前は必須です'
        },
        {
            field: 'email',
            message: 'メールアドレスの形式が正しくありません'
        }
    ]
}

// Edge Functionからのレスポンス例（404エラー）
{
    title: 'リソースが見つかりません',
    message: '指定されたユーザーが見つかりませんでした',
    code: 'NOT_FOUND',
    status: 404
}
```

### 10. ディレクトリ構成

- ✅ **必須**: 以下の標準ディレクトリ構成に従う

#### 10.1. フロントエンド（Next.js App Router）

```
app/
└── feature-name/
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

src/models/
├── entities/ # DBのsourceに存在しないエンティティモデル
│   ├── Paginate.ts # ページネーション用エンティティ
│   └── Cart.ts # カート機能用エンティティ
└── *.ts # DBのsourceに対応するモデル (Product.ts, User.ts等)
```

#### 10.2. バックエンド（Supabase Edge Functions）

```
supabase/functions/
├── _shared/
│   ├── types/           # 型定義（クライアントと共有）
│   │   ├── common/      # 共通型
│   │   │   └── errors.ts       # エラー型定義
│   │   ├── responses.ts        # レスポンス共通型
│   │   ├── pagination-types.ts # ページネーション型
│   │   └── users-api-types.ts  # Users API固有の型定義
│   ├── schemas/         # Drizzle ORMスキーマ定義（単一の真実の源）
│   │   ├── index.ts     # 全スキーマのエクスポート
│   │   └── users.ts     # テーブルスキーマと基本型定義
│   ├── validations/     # Zodバリデーションスキーマ
│   │   ├── index.ts     # 全バリデーションのエクスポート
│   │   ├── createUserValidation.ts  # フォームバリデーション定義
│   │   └── usersValidation.ts       # API入力バリデーション定義
│   ├── services/        # ビジネスロジック層（単一責任）
│   │   └── userService.ts      # ユーザー関連のビジネスロジック
│   ├── middlewares/     # ミドルウェア
│   │   └── middleware.ts       # 共通ミドルウェア
│   └── utils/           # ユーティリティ
├── users-api/           # ユーザー関連API
│   ├── index.ts         # ルート定義（メインエンドポイント）
│   ├── profile-api.ts   # プロフィール関連API
│   └── settings-api.ts  # 設定関連API
├── products-api/        # 商品関連API
│   ├── index.ts         # ルート定義
│   ├── list-api.ts      # 一覧関連API
│   └── detail-api.ts    # 詳細関連API
└── notifications-api/   # 通知管理API（独立）
    └── index.ts
```

#### 10.3. 命名規則

**フロントエンド:**

- **Client Component**: `FeatureClient.tsx` (useHookを呼び出し、MainViewにpropsを渡す)
- **Hook**: `useFeature.ts` (APIクエリーフックを呼び出し、ビジネスロジックを処理)
- **Query**: `useFeatureQuery.ts` (React Queryを使用したAPI呼び出し)
- **Query Key**: クエリキーは階層構造で定義

**バックエンド:**

- **リソース名**: 複数形、単語区切りはハイフン（-）（例: users-api, products-api）
- **テーブル名**: 複数形、snake_case（例: users, order_items）
- **カラム名**: snake_case（例: created_at, is_active）
- **外部キー**: {テーブル名単数形}\_id（例: user_id, product_id）

#### 10.4. Model配置ルール

- ✅ **必須**: DBのテーブルに対応するモデルは`src/models/`直下に配置
- ✅ **必須**: DBのsourceに存在しないエンティティモデルは`src/models/entities/`に配置

### 11. Hook+View分離パターン（MUST）

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

### 12. React Query統合パターン（MUST）

- ✅ **必須**: Query Keysは必ず分離して定義すること
- ✅ **必須**: `useSupabaseQuery`と`useSupabaseMutation`を使用すること
- ✅ **必須**: Business Logic HookでQuery Hooksを呼び出すこと
- ❌ **禁止**: コンポーネント内で直接Query Hooksを呼び出すこと

#### 12.1. Query Keys定義（必須）

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

#### 12.2. Query Hook定義

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

#### 12.3. Mutation Hook定義

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

#### 12.4. Business Logic Hook実装パターン

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

#### 12.5. 統合パターンの全体像

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

#### 12.6. Query Options

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

#### 12.7. Mutation Options

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

### 13. 共通型定義（Schema Firstアプローチ）（MUST）

- ✅ **必須**: リソース系の型は`_shared/schemas/*`から生成すること
- ✅ **必須**: バリデーションは`_shared/validations/*`に定義すること
- ✅ **必須**: Edge FunctionsとClient両方で使用する型は`_shared/types/`に配置すること
- ❌ **禁止**: 型の重複定義
- 📌 **参照**: ディレクトリ構成の詳細は[10.2. バックエンド（Supabase Edge Functions）](#102-バックエンドsupabase-edge-functions)を参照

#### 13.1. Schema定義（Drizzle ORM）

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

#### 13.2. Validation定義（Zod）

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

#### 13.3. API型定義（Schema First）

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

#### 13.4. 型のフロー

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

#### 13.5. importパスの規則

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

#### 13.6. 型定義のベストプラクティス

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

## 14. API設計パターン（MUST）

### 14.1. Middleware設計パターン

- ✅ **必須**: `initApi`と`apiHandler`パターンを使用すること
- ✅ **必須**: try-catchは極力使用しない設計
- ✅ **必須**: 統一されたエラー形式で返却
- ✅ **必須**: グローバルミドルウェアによる共通処理の自動化

#### 14.1.1. initApi関数とapiHandlerパターン

```typescript
// _shared/middlewares/middleware.ts から提供される機能

/**
 * API初期化関数
 * - グローバルミドルウェアの自動適用
 * - ヘルスチェックエンドポイントの自動追加
 * - CORSとエラーハンドリングの統一設定
 */
export const initApi = <E extends Env = Env>(basePath: string) => {
    const app = new Hono<E>().basePath(basePath)

    // 共通ミドルウェアの適用
    app.use('*', corsMiddleware)
    app.options('*', optionsHandler)
    app.use('*', errorMiddleware) // グローバルエラーキャッチ

    // ヘルスチェックエンドポイント
    app.get('/health', (c) => {
        return c.json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            service: basePath.replace('/', ''),
        })
    })

    return app
}

/**
 * APIハンドラーラッパー
 * - try-catchロジックを内包
 * - 統一されたエラーレスポンス
 * - 詳細なエラーログ出力
 */
export const apiHandler = <T>(handler: (c: Context) => Promise<T>) => {
    return async (c: Context) => {
        try {
            return await handler(c)
        } catch (error: unknown) {
            // エラー処理は内部で統一的に実行
            // Zod, ApiError, HTTPException, その他エラーを自動判別
        }
    }
}

/**
 * バリデーション付きAPIハンドラー
 * - Zodスキーマによる自動バリデーション
 * - バリデーション済みデータの型安全な受け渡し
 * - エラーハンドリングの統一化
 */
export const validatedApiHandler = <T>(
    schema: any,
    handler: (c: Context, validatedData: T) => Promise<Response>
) => {
    // 内部でバリデーションとエラーハンドリングを実行
}
```

#### 14.1.2. メインエントリポイント実装例

```typescript
// users-api/index.ts
import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { initApi, apiHandler } from '../_shared/middleware.ts'

// 型拡張 - Honoのコンテキストにユーザー情報を追加
export type Variables = {
    user: any
    supabase: any
}

// サブAPIのインポート
import rewardsApi from './rewards-api.ts'
import membersApi from './members-api.ts'

// 共通初期化関数を使ってAPIアプリケーションを初期化
const app = initApi<{ Variables: Variables }>('/users-api')

// ルート定義
app.get(
    '/',
    apiHandler(async (c) => {
        return c.json({ message: 'Users API is running' })
    })
)

// サブAPIをルーティング
app.route('/rewards', rewardsApi)
app.route('/members', membersApi)

Deno.serve(app.fetch)
```

#### 14.1.3. サブAPI実装例

```typescript
// users-api/rewards-api.ts
import { authMiddleware, apiHandler } from '../_shared/middleware.ts'
import type { Variables } from './index.ts'
import { Hono } from 'https://jsr.io/@hono/hono/4.7.6/src/index.ts'
import {
    getRewardsForUser,
    getRewardById,
} from '../_shared/services/rewardService.ts'
import { getPaginationInfoFromRequest } from '_shared/paginationUtility'
import type { SelectUser } from '_shared/schemas'

const rewardsApi = new Hono<{ Variables: Variables }>()

/**
 * ユーザー向けリワード一覧取得API
 */
rewardsApi.get(
    '/shops/:shopId',
    authMiddleware,
    apiHandler(async (c) => {
        const user = c.get('user') as SelectUser
        const shopId = c.req.param('shopId')
        const pagination = getPaginationInfoFromRequest(c)
        const filter = c.req.query('filter')

        const result = await getRewardsForUser(user?.id, shopId, {
            pagination,
            filter: filter as RewardFilterType,
        })

        return c.json(result)
    })
)

export default rewardsApi
```

### 14.2. Supabase Edge Functions/API設計原則

- ✅ **必須**: APIは `supabase/functions/{resource}-api` として実装
- ✅ **必須**: RESTful設計を基本とし、リソース単位でエンドポイントを分割
- ✅ **必須**: サーバー側で認証・バリデーション・エラー処理を徹底
- ✅ **必須**: レスポンスは必ずJSON形式、型定義を厳守
- ✅ **必須**: ビジネスロジックはサービス層（`_shared/services/`）に分離
- 📌 **参照**: ディレクトリ構成の詳細は[10.2. バックエンド（Supabase Edge Functions）](#102-バックエンドsupabase-edge-functions)を参照

### 14.3. サービス層（`_shared/services/`）の設計

- ✅ **必須**: 1つのサービスクラスは1つのビジネスドメインのみを担当
- ✅ **必須**: データベースアクセス・トランザクション管理・ビジネスルールを担当
- ✅ **必須**: API間で共通利用できるサービス関数を提供

```typescript
// ✅ 正しい: 各ドメインごとにサービスを分割
// _shared/services/UserService.ts
export class UserService {
    async getUserProfile(userId: string) {
        const user = await db.select().from(users).where(eq(users.id, userId))
        return user[0]
    }

    async updateUserProfile(userId: string, data: UpdateUserData) {
        return await db
            .update(users)
            .set(data)
            .where(eq(users.id, userId))
            .returning()
    }
}

// _shared/services/ProductService.ts
export class ProductService {
    async getProducts(filters?: ProductFilters) {
        // 商品取得ロジック
    }

    async getProductById(id: string) {
        // 商品詳細取得ロジック
    }
}
```

### 14.4. エンドポイント命名規則・resource分離

- ✅ **必須**: 1つのエンドポイントファイルは1つのリソース管理のみを担当
- ✅ **必須**: リソース名は複数形、単語区切りはハイフン（-）
- ✅ **必須**: パスパラメータは :paramName 形式
- ✅ **必須**: エンドポイントファイルはルーティング・認証・レスポンス処理のみを担当
- ✅ **必須**: 具体的な処理は対応するサービス層に委譲

### 14.5. レスポンス形式の統一

- ✅ **必須**: APIの成功レスポンスは `SuccessResponse` クラスを使用して統一

```typescript
// _shared/types/responses.ts
export class SuccessResponse<T = unknown> {
    constructor(options: { data: T; message?: string })
}

// 使用例
return new SuccessResponse({
    data: users,
    message: 'ユーザー一覧を取得しました',
})

// 実際のレスポンスJSON
{
    "success": true,
    "data": [...],
    "message": "ユーザー一覧を取得しました"
}
```

### 14.6. `_shared` ディレクトリ管理ルール

- ✅ **必須**: `_shared`ディレクトリに新しいファイルを追加した場合は、必ず以下のファイルを更新する

**重要**: Supabaseのバージョンアップにより、`supabase/functions/import_map.json`は廃止され、`supabase/functions/deno.json`に設定が移行されました。

1. **`supabase/functions/deno.json`** - Supabase Functions内での import パス解決用
2. **`deno.json`** (プロジェクトルート) - プロジェクトルートでの Deno 実行時の import パス解決用

```json
// supabase/functions/deno.json
{
    "imports": {
        "_shared/validations/newValidation": "./_shared/validations/newValidation.ts"
    }
}

// deno.json (プロジェクトルート)
{
    "imports": {
        "_shared/validations/newValidation": "./supabase/functions/_shared/validations/newValidation.ts"
    }
}
```

## 15. データベース設計とマイグレーション（MUST）

### 15.1. データベースマイグレーションの流れ

#### 15.1.1. 基本的なマイグレーション作成手順

1. **スキーマの定義**
    - `supabase/functions/_shared/schemas`ディレクトリにスキーマファイルを作成または編集
    - Drizzle ORMのスキーマ定義を使用

2. **マイグレーションファイルの生成**

    ```bash
    # マイグレーション生成コマンド（要設定）
    npm run db:generate {migration_name}
    ```

    - `migration_name`は分かりやすい名前を付ける（例: add_users_table, update_posts_schema）
    - このコマンドでDrizzleが自動的にSQLマイグレーションファイルを生成

3. **マイグレーションの実行**

    ```bash
    npm run db:migrate
    ```

    - 未適用のマイグレーションを自動的に適用
    - データベースの状態を最新に更新

#### 15.1.2. マイグレーションのベストプラクティス

- ✅ **必須**: スキーマファースト - 常にスキーマ定義を更新してからマイグレーションを生成
- ✅ **必須**: 命名規則 - マイグレーション名は「動作\_対象\_詳細」の形式を推奨
- ✅ **必須**: レビュー必須 - 生成されたSQLファイルを必ず確認してから実行
- ✅ **必須**: バックアップ - 本番環境では必ずバックアップを取ってから実行

### 15.2. データベース設計のベストプラクティス

- 📌 **参照**: スキーマ定義の詳細は[13.1. Schema定義（Drizzle ORM）](#131-schema定義drizzle-orm)を参照
- 📌 **参照**: 命名規則は[10.3. 命名規則](#103-命名規則)を参照

#### 15.2.1. インデックス設計

- ✅ **必須**: 頻繁に検索される外部キーには必ずインデックスを作成
- ✅ **必須**: 複合インデックスはクエリパターンに合わせて設計
- ✅ **必須**: ユニーク制約が必要な場合はユニークインデックスを使用

#### 15.2.2. パフォーマンス最適化

- ✅ **必須**: N+1問題を避けるためJOINを適切に使用
- ✅ **必須**: 大量データの場合はページネーションを実装
- ✅ **必須**: 集計処理は可能な限りデータベース側で実行

#### 15.2.3. セキュリティ

- ✅ **必須**: SQLインジェクション対策としてパラメータ化クエリを使用
- ✅ **必須**: 機密データは暗号化して保存
- ✅ **必須**: アクセス権限を適切に設定

### 15.3. 新規スキーマ作成時の完全ガイド

#### 15.3.1. 新規スキーマ作成の正しい手順（重要）

新規スキーマを定義した際に`yarn make:migration`や`yarn make:migration:custom`でマイグレーションが作成されないことが多々あります。**以下の手順を必ず守ってください。**

**ステップ1: スキーマファイルの作成**

```typescript
// supabase/functions/_shared/schemas/newTable.ts
import { type InferInsertModel, type InferSelectModel } from 'drizzle-orm'
import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core'

/**
 * 新しいテーブルのスキーマ定義
 */
export const newTable = pgTable('new_table', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 100 }).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// ✅ 必須: 型定義のエクスポート
export type SelectNewTable = InferSelectModel<typeof newTable>
export type InsertNewTable = InferInsertModel<typeof newTable>
export type UpdateNewTable = Partial<InsertNewTable>
```

**ステップ2: index.tsへの追加（最重要）**

```typescript
// supabase/functions/_shared/schemas/index.ts
export * from '_shared/schemas/users'
export * from '_shared/schemas/events'
// ✅ 必須: 新規スキーマを追加
export * from '_shared/schemas/newTable' // ← これを忘れずに追加！
```

**⚠️ 注意: この手順を忘れると、drizzle-kitがスキーマを認識せず、マイグレーションが生成されません！**

**ステップ3: マイグレーション生成前のチェック**

```bash
# 1. TypeScriptの型チェック（構文エラーがないか確認）
yarn type-check

# 2. Denoの型チェック（Supabase Functions内の構文チェック）
yarn deno:type-check
```

**ステップ4: マイグレーション生成**

```bash
# 標準マイグレーション生成（推奨）
yarn make:migration create_new_table

# カスタムマイグレーション生成（複雑な変更の場合）
yarn make:migration:custom create_new_table
```

**ステップ5: 生成されたマイグレーションファイルの確認**

```bash
# 生成されたSQLファイルを確認
cat db/migrations/YYYYMMDDHHMMSS_create_new_table.sql
```

**ステップ6: マイグレーション適用**

```bash
# ローカル環境に適用
yarn db:migrate
```

#### 15.3.2. マイグレーションが生成されない場合のトラブルシューティング

マイグレーションが生成されない場合、以下のチェックリストを**順番に**確認してください：

##### ✅ チェックリスト1: スキーマファイルのエクスポート確認

```bash
# index.tsに新規スキーマが追加されているか確認
cat supabase/functions/_shared/schemas/index.ts
```

**確認事項:**

- ✅ 新規スキーマファイルが`export * from '_shared/schemas/ファイル名'`で追加されているか
- ✅ パスが正しいか（`_shared/schemas/`で始まる）
- ✅ ファイル名の拡張子（.ts）を省略しているか

##### ✅ チェックリスト2: スキーマファイルの構文確認

```bash
# TypeScript型チェック
yarn type-check

# Deno型チェック
yarn deno:type-check
```

**確認事項:**

- ✅ `export const テーブル名 = pgTable(...)` がエクスポートされているか
- ✅ インポート文が正しいか（`drizzle-orm`、`drizzle-orm/pg-core`）
- ✅ 型定義（`SelectXXX`, `InsertXXX`）がエクスポートされているか

##### ✅ チェックリスト3: drizzle.config.tsの設定確認

```bash
# drizzle.config.tsの内容確認
cat db/drizzle/drizzle.config.ts
```

**確認事項:**

- ✅ `schema: './supabase/functions/_shared/schemas/*'` となっているか
- ✅ `out: './db/migrations'` が正しいか

##### ✅ チェックリスト4: 環境変数の確認

```bash
# .envファイルにDB_URLが設定されているか確認
cat .env | grep DB_URL
```

**確認事項:**

- ✅ `DB_URL`が設定されているか
- ✅ データベース接続文字列が正しいか

##### ✅ チェックリスト5: キャッシュクリア＆再生成

```bash
# node_modulesとキャッシュをクリア
rm -rf node_modules/.cache
rm -rf .next

# マイグレーション再生成
yarn make:migration create_new_table
```

##### ✅ チェックリスト6: drizzle-kitのバージョン確認

```bash
# drizzle-kitのバージョン確認
npx drizzle-kit --version

# 最新版へのアップデート
yarn add -D drizzle-kit@latest
```

#### 15.3.3. よくある失敗パターンと解決方法

**失敗パターン1: index.tsに追加し忘れ**

```typescript
// ❌ 間違い: index.tsに追加していない
// supabase/functions/_shared/schemas/newTable.ts
export const newTable = pgTable('new_table', { ... })

// supabase/functions/_shared/schemas/index.ts
export * from '_shared/schemas/users'
export * from '_shared/schemas/events'
// newTableの追加を忘れている！
```

**解決方法:**

```typescript
// ✅ 正しい: index.tsに必ず追加
// supabase/functions/_shared/schemas/index.ts
export * from '_shared/schemas/users'
export * from '_shared/schemas/events'
export * from '_shared/schemas/newTable' // 追加！
```

**失敗パターン2: テーブル定義をエクスポートしていない**

```typescript
// ❌ 間違い: constがエクスポートされていない
const newTable = pgTable('new_table', { ... })  // exportが無い
```

**解決方法:**

```typescript
// ✅ 正しい: exportを付ける
export const newTable = pgTable('new_table', { ... })
```

**失敗パターン3: 相対パスの誤り**

```typescript
// ❌ 間違い: 相対パスを使用
import { users } from '../users'
import { users } from './users'

// ✅ 正しい: _shared/からの絶対パス
import { users } from '_shared/schemas/users'
```

**失敗パターン4: 外部キーの参照エラー**

```typescript
// ❌ 間違い: 参照先のテーブルをインポートしていない
export const newTable = pgTable('new_table', {
    userId: uuid('user_id').references(() => users.id), // usersが未定義
})

// ✅ 正しい: 必要なテーブルをインポート
import { users } from '_shared/schemas/users'
export const newTable = pgTable('new_table', {
    userId: uuid('user_id').references(() => users.id),
})
```

#### 15.3.4. マイグレーション生成のデバッグコマンド

```bash
# drizzle-kitの詳細ログを出力
npx drizzle-kit generate --config=./db/drizzle/drizzle.config.ts --name test_migration --verbose

# データベースの現在の状態を確認
npx drizzle-kit introspect --config=./db/drizzle/drizzle.config.ts

# drizzle-kitのスキーマ認識状況を確認（スキーマファイルがロードされているか）
npx drizzle-kit check --config=./db/drizzle/drizzle.config.ts
```

### 15.4. マイグレーション戦略

#### 15.4.1. 開発環境

```bash
# スキーマ変更後、マイグレーション生成
yarn make:migration add_new_feature

# マイグレーション適用
yarn db:migrate

# データリセット（開発環境のみ）
yarn db:reset
```

#### 15.4.2. 本番環境

**事前準備（必須）:**

```bash
# 1. 必ずバックアップを作成
# Supabaseダッシュボードまたはpg_dumpを使用

# 2. マイグレーションSQLを事前確認
cat ./migrations/XXXX_add_new_feature.sql

# 3. ステージング環境でテスト実施
```

**マイグレーション実行:**

```bash
# マイグレーション適用
yarn db:migrate
```

#### 15.4.3. ベストプラクティス

1. **破壊的変更の回避**
    - DROP TABLE/COLUMNは極力避ける
    - 代わりに非推奨化→新規追加→移行→削除の順で実施

2. **マイグレーションの粒度**
    - 1つのマイグレーションは1つの変更に限定
    - 複雑な変更は複数のマイグレーションに分割

3. **テスト環境での検証**
    - 本番適用前に必ずステージング環境で検証
    - データ量が多い場合のパフォーマンスも確認

4. **マイグレーション履歴の記録**
    - 各マイグレーションの目的と影響をコメントで記載
    - 実行日時と実行者を記録

## 16. 技術スタック（参考情報）

### 16.1. フロントエンド技術選定

**コアフレームワーク:**

- **Next.js 15.3.2** - React フレームワーク（App Router）
- **React 19.0.0** - UIライブラリ
- **TypeScript 5** - 型安全な開発環境

**スタイリング:**

- **Tailwind CSS 4** - ユーティリティファーストCSS
- **@tailwindcss/postcss** - PostCSS統合

**状態管理・データフェッチング:**

- **React Query (TanStack Query) 5.85.5** - サーバーステート管理
- **Jotai 2.12.5** - アトミックな状態管理
- **React Hook Form 7.60.0** - フォーム管理
- **Zod 4.1.9** - スキーマバリデーション

### 16.2. バックエンド・データベース技術選定

**インフラストラクチャ:**

- **Supabase** - BaaS（認証、データベース、ストレージ）
- **Supabase Edge Functions** - サーバーレス関数
- **PostgreSQL** - データベース（Supabase経由）

**APIフレームワーク:**

- **Hono** - 軽量WebフレームワークをEdge Functionsで使用
- **Drizzle ORM** - TypeScript型安全なORM

### 16.3. 開発ツール

**コード品質:**

- **ESLint 9** - リンティング
- **Prettier 3.5.3** - コードフォーマッティング
- **eslint-plugin-unused-imports** - 未使用インポート検出

**テスト:**

- **Jest 30.1.3** - ユニットテスト
- **@testing-library/jest-dom** - DOM テスト
- **ts-jest** - TypeScript サポート
