# ローディング戦略ガイドライン

## 概要

このドキュメントは、React Native Expo アプリケーションにおけるローディング状態の管理と表示に関する統一的な戦略を定義します。

## 基本原則

### 1. ローディング表示の種類

#### グローバルローディング（オーバーレイ）

- **用途**: 画面全体をブロックする必要がある重要な処理
- **例**: ログイン、データ送信、初期データ取得
- **実装**: `LoadingContext` + `OverlayLoading` コンポーネント

#### スケルトンローディング

- **用途**: 部分的なコンテンツの読み込み、ユーザー体験の向上
- **例**: リスト表示、詳細画面の初期表示
- **実装**: `SkeletonLoading` コンポーネント

#### インラインローディング

- **用途**: ボタンや小さな領域での処理中表示
- **例**: 個別アイテムの更新、追加アクション
- **実装**: `ActivityIndicator` コンポーネント

### 2. React Query との連携

すべてのデータフェッチングは React Query を使用し、専用のローディングフックを通じて管理します。

## 実装パターン

### useQueryWithLoading の使用

```typescript
// ✅ 推奨: スケルトンローディングを使用（デフォルト）
const { data, isLoading } = useSampleUsers(page, limit, {
    showGlobalLoading: false, // デフォルト値
})

// ✅ 推奨: 重要な初期データ取得でグローバルローディングを使用
const { data } = useInitialData({
    showGlobalLoading: true,
    loadingMessage: 'データを読み込んでいます...',
})
```

### useMutationWithLoading の使用

```typescript
// ✅ 推奨: 更新処理でグローバルローディングを使用
const createUser = useCreateSampleUser({
    showGlobalLoading: true,
    loadingMessage: 'ユーザーを作成しています...',
})

// 実行
await createUser.mutateAsync(userData)
```

## ベストプラクティス

### 1. ローディング種別の選択基準

| 処理の種類       | 推奨ローディング | 理由                                 |
| ---------------- | ---------------- | ------------------------------------ |
| 初期データ取得   | スケルトン       | ユーザーがコンテンツ構造を把握できる |
| ページネーション | スケルトン/なし  | 既存コンテンツを維持したまま追加     |
| データ送信       | グローバル       | 二重送信防止、処理の重要性を明示     |
| 削除処理         | グローバル       | 破壊的操作の実行中を明確に示す       |
| リフレッシュ     | Pull-to-Refresh  | ネイティブUXパターンに準拠           |

### 2. エラーハンドリングとの組み合わせ

```typescript
// ✅ 推奨: ローディングとエラーハンドリングの統合
const { data, isLoading, error } = useQueryWithLoading({
    queryKey: ['users'],
    queryFn: fetchUsers,
    onError: (error) => {
        // エラー時の処理
        showToast({
            type: 'error',
            message: 'データの取得に失敗しました',
        })
    },
})

if (isLoading) {
    return <SkeletonLoading />
}

if (error) {
    return <ErrorComponent />
}
```

### 3. パフォーマンス最適化

#### スケルトンローディングの最適化

```typescript
// ✅ 推奨: メモ化されたスケルトンコンポーネント
const UserListSkeleton = memo(() => (
    <SkeletonGroup count={5}>
        <SkeletonCard />
    </SkeletonGroup>
))

// 使用
if (isLoading) {
    return <UserListSkeleton />
}
```

#### 不要なグローバルローディングの回避

```typescript
// ❌ 非推奨: 頻繁な操作でグローバルローディング
const { refetch } = useQueryWithLoading({
    // ...
    showGlobalLoading: true, // 避ける
})

// ✅ 推奨: refetch時はローディングを控えめに
const { refetch } = useQueryWithLoading({
    // ...
    showGlobalLoading: false,
})
```

## 実装チェックリスト

### 新機能実装時のローディング対応

- [ ] データ取得処理は `useQueryWithLoading` を使用
- [ ] データ更新処理は `useMutationWithLoading` を使用
- [ ] 適切なローディング種別を選択
- [ ] エラー時の表示を実装
- [ ] スケルトンローディングのデザインを作成
- [ ] ローディング中の操作制限を実装

### テスト項目

- [ ] ローディング状態が正しく表示される
- [ ] ローディング中にユーザー操作が適切に制限される
- [ ] エラー時にローディングが解除される
- [ ] 成功時にローディングが解除される
- [ ] メモリリークが発生しない

## コンポーネント API リファレンス

### LoadingContext

```typescript
interface LoadingContextValue {
    isGlobalLoading: boolean
    globalLoadingMessage?: string
    showGlobalLoading: (message?: string) => void
    hideGlobalLoading: () => void
    setGlobalLoading: (loading: boolean, message?: string) => void
}
```

### useQueryWithLoading

```typescript
interface UseQueryWithLoadingOptions {
    showGlobalLoading?: boolean // デフォルト: false
    loadingMessage?: string
}

// 使用例
const result = useQueryWithLoading(queryOptions, loadingOptions)
```

### useMutationWithLoading

```typescript
interface UseMutationWithLoadingOptions {
    showGlobalLoading?: boolean // デフォルト: false
    loadingMessage?: string
}

// 使用例
const mutation = useMutationWithLoading(mutationOptions, loadingOptions)
```

### SkeletonLoading

```typescript
interface SkeletonLoadingProps {
    width?: number | string
    height?: number | string
    borderRadius?: number
    style?: ViewStyle
}

interface SkeletonCardProps {
    style?: ViewStyle
}

interface SkeletonGroupProps {
    count?: number // デフォルト: 3
    children: ReactNode
    style?: ViewStyle
}
```

## 移行ガイド

### 既存コードからの移行

#### Step 1: React Query フックの置き換え

```typescript
// Before
const { data, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
})

// After
const { data, isLoading } = useQueryWithLoading(
    {
        queryKey: ['users'],
        queryFn: fetchUsers,
    },
    {
        showGlobalLoading: false,
    },
)
```

#### Step 2: ローディング表示の統一

```typescript
// Before
if (isLoading) {
    return <ActivityIndicator />
}

// After
if (isLoading) {
    return <SkeletonGroup count={5}>
        <SkeletonCard />
    </SkeletonGroup>
}
```

## トラブルシューティング

### よくある問題と解決策

#### 1. グローバルローディングが表示されない

**原因**: `LoadingProvider` がアプリのルートに配置されていない

```typescript
// ✅ 解決策: _layout.tsx で Provider を配置
export default function RootLayout() {
    return (
        <QueryClientProvider client={queryClient}>
            <LoadingProvider>
                {/* アプリコンポーネント */}
            </LoadingProvider>
        </QueryClientProvider>
    )
}
```

#### 2. ローディングが解除されない

**原因**: エラー処理が適切に実装されていない

```typescript
// ✅ 解決策: onError コールバックを実装
const mutation = useMutationWithLoading({
    mutationFn: updateUser,
    onError: (error) => {
        // エラー処理
        console.error(error)
    },
    onSettled: () => {
        // 成功・失敗に関わらず実行
    },
})
```

## 関連ドキュメント

- [React Query 公式ドキュメント](https://tanstack.com/query/latest)
- [React Native Loading 実装例](docs/loading-usage.md)
- [コーディング規約](./coding-standards.md)
- [ベストプラクティス](./best-practices.md)
