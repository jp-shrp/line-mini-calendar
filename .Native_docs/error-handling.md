# エラーハンドリング戦略

## 概要

このアプリケーションでは、多層的なエラーハンドリング戦略を採用しています。

## 1. APIエラーハンドリング（Result型パターン）

### フロントエンド層

`useCallSupabase`フックを使用して、APIエラーを自動的にモーダル表示します。

```typescript
// api/samples-api/hooks/useSamplesApi.ts
const result = await callFunction<ResponseType>(
    async () => await supabase.functions.invoke('endpoint'),
    {
        title: 'エラータイトル',
        message: 'エラーメッセージ',
    }
)

// Result型: { data: T | null, error: boolean, success: boolean }
```

### React Query層

エラー時はnullを返し、アプリクラッシュを防ぎます。

```typescript
// api/samples-api/samples-api-query.ts
queryFn: async () => {
    const result = await getUsersList(page, limit)
    if (!result.success || !result.data) {
        return null // エラー時はnullを返す
    }
    return result.data
}
```

## 2. グローバルErrorBoundary

### 目的

- レンダリングエラーのキャッチ
- 予期せぬJavaScriptエラーの捕捉
- アプリクラッシュの防止

### 実装

```typescript
// src/components/ErrorBoundary.tsx
export class ErrorBoundary extends Component<Props, State> {
    static getDerivedStateFromError(error: Error): Partial<State> {
        return { hasError: true, error }
    }

    override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // エラーログ記録
    }
}
```

### 適用箇所

```typescript
// app/_layout.tsx
<ErrorBoundary>
    <QueryClientProvider client={queryClient}>
        {/* アプリコンテンツ */}
    </QueryClientProvider>
</ErrorBoundary>
```

## 3. エラー表示UI

### APIエラー

- `useModal`フックによる自動モーダル表示
- エラータイトルとメッセージを表示

### レンダリングエラー

- ErrorFallbackコンポーネントによるエラー画面
- リトライボタンでアプリ再起動
- 開発環境ではスタックトレース表示

## 4. ベストプラクティス

1. **APIコール**: 必ず`useCallSupabase`を使用
2. **Query/Mutation**: エラー時はnullを返す
3. **グローバルエラー**: ErrorBoundaryで捕捉
4. **ユーザー体験**: エラーメッセージは分かりやすく

## 5. 設定不要

以下のガイドラインが自動適用されます：

- ✅ console.logの削除
- ✅ try-catchの最小化
- ✅ 統一されたエラーレスポンス形式
- ✅ モーダルによるエラー通知
