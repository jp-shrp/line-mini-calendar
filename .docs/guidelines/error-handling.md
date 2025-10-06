# エラーハンドリングガイド

本プロジェクトでは、フロント側の呼び出しで極力try-catchを使用せず、エラーを自動的に処理する仕組みを導入しています。

## 概要

- **React Query**のグローバルエラーハンドラーを使用
- **422バリデーションエラー**は自動的にフォームにセット
- **その他のエラー**は自動的にモーダル表示
- **suppressErrorModal**オプションでモーダル表示を抑制可能
- **カスタムエラー処理**が必要な場合は個別に`onError`を指定可能

## アーキテクチャ

### 1. QueryClient設定 (`src/lib/query-client.ts`)

グローバルエラーハンドラーを設定し、全てのクエリ・ミューテーションのエラーを自動処理します。

```typescript
export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
            onError: (error) => {
                // 422以外はグローバルエラーハンドラーで処理
                if (!isValidationError(error) && globalErrorHandler) {
                    globalErrorHandler(error)
                }
            },
        },
        mutations: {
            retry: false,
            onError: (error) => {
                // 422以外はグローバルエラーハンドラーで処理
                if (!isValidationError(error) && globalErrorHandler) {
                    globalErrorHandler(error)
                }
            },
        },
    },
})
```

### 2. モーダル連携 (`src/components/ClientWrapper.tsx`)

`ErrorHandlerSetup`コンポーネントで`useModal`とグローバルエラーハンドラーを連携します。

```typescript
function ErrorHandlerSetup({ children }: { children: ReactNode }) {
    const { openModal } = useModal()

    useEffect(() => {
        setGlobalErrorHandler((error: any) => {
            openModal({
                title: error?.title || 'エラーが発生しました',
                content: error?.message || '予期しないエラーが発生しました',
                type: 'error',
            })
        })
    }, [openModal])

    return <>{children}</>
}
```

### 3. エラー形式

全てのエラーは`StandardApiError`形式に統一されています。

```typescript
interface StandardApiError {
    title: string // エラータイトル
    message: string // エラーメッセージ
    code: string // エラーコード
    status: number // HTTPステータスコード
    details?: any // 追加の詳細情報
}
```

## 使い方

### useSupabaseQuery（GET）

基本的な使い方では、エラーは自動的にモーダル表示されます。

```typescript
// エラーは自動でモーダル表示
const { data, isLoading } = useSupabaseQuery({
    queryKey: ['users'],
    functionName: 'samples-api/users',
})
```

#### エラーモーダルを表示しない場合

`suppressErrorModal: true`を指定すると、エラーモーダルの自動表示を抑制できます。

```typescript
// エラーモーダルを表示せず、自分でエラー処理する
const { data, error } = useSupabaseQuery({
    queryKey: ['users'],
    functionName: 'samples-api/users',
    suppressErrorModal: true, // モーダル表示を抑制
})

// errorを使って独自のエラー表示を実装
if (error) {
    // カスタムエラー表示
}
```

### useSupabaseMutation（POST/PUT/DELETE）

#### 基本版

```typescript
// エラーは自動でモーダル表示
const mutation = useSupabaseMutation({
    functionName: 'samples-api/users',
    method: 'POST',
    invalidateQueries: ['users'],
})

// 呼び出し（try-catch不要）
mutation.mutate({ name: 'John', email: 'john@example.com' })
```

#### エラーモーダルを表示しない場合

```typescript
// エラーモーダルを表示せず、自分でエラー処理する
const mutation = useSupabaseMutation({
    functionName: 'samples-api/users',
    method: 'POST',
    suppressErrorModal: true, // モーダル表示を抑制
})
```

#### フォーム連携版

422バリデーションエラーは自動的にフォームにセットされます。

```typescript
const form = useForm()

const mutation = useSupabaseMutation(form, {
    functionName: 'samples-api/users',
    method: 'POST',
    invalidateQueries: ['users'],
})

// 呼び出し（try-catch不要、422エラーは自動でフォームにセット）
mutation.mutate(form.getValues())
```

### カスタムエラー処理

特定のエラーだけカスタム処理したい場合は`onError`を指定します。

```typescript
const { data } = useSupabaseQuery({
    queryKey: ['users'],
    functionName: 'samples-api/users',
    onError: (error) => {
        // カスタム処理
        console.error('Custom error handling:', error)
        // グローバルエラーハンドラーも実行されます
    },
})
```

### callEdgeFunctionを直接使用する場合

直接呼び出しの場合は、従来通りtry-catchが必要です。

```typescript
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
    console.log(result)
} catch (err) {
    console.error(err)
    // エラーは既にStandardApiError形式に変換されている
}
```

## エラーの種類と処理

### 422 バリデーションエラー

- **フォーム連携版**: 自動的にフォームの各フィールドにエラーをセット
- **基本版**: グローバルエラーハンドラーでモーダル表示

```typescript
// レスポンス例
{
  "title": "バリデーションエラー",
  "message": "入力内容を確認してください",
  "code": "VALIDATION_ERROR",
  "status": 422,
  "details": [
    { "field": "email", "message": "有効なメールアドレスを入力してください" },
    { "field": "name", "message": "名前は必須です" }
  ]
}
```

### その他のエラー (400, 500など)

- 自動的にモーダルでエラーメッセージを表示
- エラーの内容は`StandardApiError`の`title`と`message`を使用

## ベストプラクティス

### ✅ 推奨

- `useSupabaseQuery`/`useSupabaseMutation`を使用する
- try-catchを使用しない（エラーは自動処理される）
- フォーム送信には`useSupabaseMutation(form, options)`を使用する

### ❌ 非推奨

- `callEdgeFunction`を直接使用する（特別な理由がない限り）
- 各コンポーネントで個別にエラー処理を実装する
- エラー処理のために複雑なtry-catch構造を作る

## トラブルシューティング

### エラーがモーダル表示されない

1. `ClientWrapper`が正しくセットアップされているか確認
2. `ModalProvider`が`QueryClientProvider`の内側にあるか確認
3. ブラウザのコンソールでエラーが発生していないか確認

### 422エラーがフォームにセットされない

1. `useSupabaseMutation`にフォームインスタンスを渡しているか確認
2. フォームのフィールド名とエラーの`field`が一致しているか確認
3. Edge Functionから正しい形式でエラーを返しているか確認

### カスタムエラー処理が実行されない

- `onError`コールバック内で例外をthrowしていないか確認
- グローバルエラーハンドラーも実行されるため、モーダルは表示されます

## まとめ

本プロジェクトのエラーハンドリングは以下のように動作します：

1. **useSupabaseQuery/Mutation**を使用すれば、エラーは自動的に処理される
2. **422バリデーションエラー**はフォームに自動セット
3. **その他のエラー**はモーダルで自動表示
4. **suppressErrorModal: true**でモーダル表示を抑制可能
5. **カスタム処理**が必要な場合のみ`onError`を指定

これにより、フロント側のコードがシンプルになり、一貫したエラー表示を実現できます。
