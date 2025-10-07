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
