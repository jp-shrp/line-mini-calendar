# Loading機能使用ガイド

このドキュメントでは、React Queryと連携したローディング機能の使用方法について説明します。

## 機能概要

1. **グローバルオーバーレイローディング** - 画面全体を覆うローディング表示
2. **スケルトンローディング** - コンテンツのプレースホルダー表示
3. **React Query連携フック** - クエリ/ミューテーションの状態と連動

## セットアップ

必要な設定は`app/_layout.tsx`で既に完了しています:

```tsx
<QueryClientProvider client={queryClient}>
    <LoadingProvider>
        {/* アプリケーションコンテンツ */}
        <OverlayLoading />
    </LoadingProvider>
</QueryClientProvider>
```

## 使用方法

### 1. グローバルオーバーレイローディング

手動でグローバルローディングを制御する場合:

```tsx
import { useLoading } from '@/src/contexts/LoadingContext'

const MyComponent = () => {
    const { showGlobalLoading, hideGlobalLoading } = useLoading()

    const handleLongOperation = async () => {
        showGlobalLoading()
        try {
            await performLongOperation()
        } finally {
            hideGlobalLoading()
        }
    }

    return <Button onPress={handleLongOperation}>実行</Button>
}
```

### 2. React Query連携

#### useQueryWithLoading

クエリの実行中に自動的にグローバルローディングを表示:

```tsx
import { useQueryWithLoading } from '@/src/hooks/useQueryWithLoading'

const MyComponent = () => {
    const { data, isLoading, error } = useQueryWithLoading(
        {
            queryKey: ['users'],
            queryFn: fetchUsers,
        },
        {
            showGlobalLoading: true, // グローバルローディングを表示
            loadingMessage: 'データを取得中...',
        },
    )

    if (error) return <ErrorView error={error} />
    if (!data) return null

    return <UserList users={data} />
}
```

#### useMutationWithLoading

ミューテーションの実行中に自動的にグローバルローディングを表示:

```tsx
import { useMutationWithLoading } from '@/src/hooks/useMutationWithLoading'

const MyComponent = () => {
    const mutation = useMutationWithLoading(
        {
            mutationFn: createUser,
            onSuccess: () => {
                // 成功時の処理
            },
        },
        {
            showGlobalLoading: true,
            loadingMessage: '保存中...',
        },
    )

    const handleSubmit = (data: UserData) => {
        mutation.mutate(data)
    }

    return <UserForm onSubmit={handleSubmit} />
}
```

### 3. スケルトンローディング

#### 基本的なスケルトン

```tsx
import { SkeletonLoading } from '@/src/components/ui/SkeletonLoading'

const LoadingState = () => (
    <View>
        <SkeletonLoading width={200} height={20} />
        <SkeletonLoading width="100%" height={40} borderRadius={8} />
    </View>
)
```

#### スケルトングループ

複数のスケルトンを一括表示:

```tsx
import { SkeletonGroup } from '@/src/components/ui/SkeletonLoading'

const LoadingList = () => <SkeletonGroup count={5} height={60} spacing={16} />
```

#### スケルトンカード

カード形式のスケルトン:

```tsx
import { SkeletonCard } from '@/src/components/ui/SkeletonLoading'

const LoadingCard = () => <SkeletonCard showAvatar={true} lines={3} />
```

### 4. 実装例

リスト画面での使用例:

```tsx
import React from 'react'
import { View, FlatList } from 'react-native'
import { useQueryWithLoading } from '@/src/hooks/useQueryWithLoading'
import { SkeletonCard } from '@/src/components/ui/SkeletonLoading'

const UserListScreen = () => {
    const { data, isLoading } = useQueryWithLoading(
        {
            queryKey: ['users'],
            queryFn: fetchUsers,
            staleTime: 5 * 60 * 1000, // 5分間キャッシュ
        },
        {
            showGlobalLoading: false, // スケルトンを使うのでグローバルは不要
        },
    )

    if (isLoading) {
        return (
            <View className="flex-1 p-4">
                {Array.from({ length: 5 }).map((_, i) => (
                    <SkeletonCard key={i} className="mb-4" />
                ))}
            </View>
        )
    }

    return (
        <FlatList
            data={data}
            renderItem={({ item }) => <UserCard user={item} />}
            keyExtractor={(item) => item.id}
        />
    )
}
```

## ベストプラクティス

1. **ローディングの使い分け**
    - 画面遷移や重要な操作: グローバルオーバーレイ
    - リスト表示: スケルトンローディング
    - 部分的な更新: インラインローディング

2. **パフォーマンス考慮**
    - 短い操作（< 300ms）ではローディング表示を避ける
    - React Queryの`staleTime`を適切に設定してキャッシュを活用

3. **エラーハンドリング**
    - ローディング後は必ずエラー状態をチェック
    - エラー時は`useModal`でユーザーに通知

4. **アクセシビリティ**
    - ローディング中は操作を無効化
    - 適切なメッセージを表示してユーザーに状況を伝える

## トラブルシューティング

### ローディングが表示されない

- `LoadingProvider`が正しく設定されているか確認
- `showGlobalLoading: true`オプションが設定されているか確認

### ローディングが消えない

- エラーハンドリングで`hideGlobalLoading`が呼ばれているか確認
- `finally`ブロックでローディングを確実に解除

### スケルトンのちらつき

- React Queryの`staleTime`を調整してキャッシュを活用
- `suspense`モードの使用を検討
