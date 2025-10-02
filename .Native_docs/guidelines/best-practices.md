# ベストプラクティス

## ユーザーフィードバック

### Alert使用禁止（必須）

- ❌ **禁止**: Alert.alert()の使用
- ✅ **必須**: useModalフックを使用

```tsx
// ❌ 禁止
import { Alert } from 'react-native'
Alert.alert('エラー', 'ログインに失敗しました')

// ✅ 正しい
import { useModal } from '@/src/contexts/ModalContext'
const { openModal } = useModal()
openModal({
    title: 'エラー',
    message: 'ログインに失敗しました',
    type: 'error',
})
```

## ローディング戦略

ローディング状態の管理については、専用のガイドラインを参照してください。
→ [ローディング戦略ガイドライン](./loading-strategy.md)

## ⚠️ 重要事項: エラーハンドリングパターン

### 1. APIエラーハンドリング - Result型パターン（必須）

#### API層での実装

```typescript
// api/samples-api/hooks/useSamplesApi.ts
export const useSamplesApi = () => {
    const { callFunction } = useCallSupabase()

    const getUsersList = async (): Promise<
        CallFunctionResult<SampleUsersListResponse>
    > => {
        // Result型をそのまま返す（throw errorしない）
        return await callFunction<SampleUsersListResponse>(
            async () => await supabase.functions.invoke('samples-api/users'),
            {
                title: 'ユーザー一覧取得エラー',
                message: 'ユーザー一覧の取得に失敗しました',
            }
        )
    }
}
```

#### Query/Mutation層での実装

```typescript
// api/samples-api/samples-api-query.ts
export const useSampleUsers = () => {
    const { getUsersList } = useSamplesApi()

    return useQuery({
        queryFn: async () => {
            const result = await getUsersList()
            // エラー時はnullを返す（アプリクラッシュを防ぐ）
            if (!result.success || !result.data) {
                return null as unknown as SampleUsersListResponse
            }
            return result.data
        },
    })
}
```

#### 返却値の型定義

```typescript
type CallFunctionResult<T> = {
    data: T | null
    error: boolean
    success: boolean
    validationErrors?: ValidationErrorDetail[]
}
```

### 2. グローバルErrorBoundary（必須）

レンダリングエラーや予期せぬJavaScriptエラーをキャッチします。

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

```typescript
// app/_layout.tsx
<ErrorBoundary>
    <QueryClientProvider client={queryClient}>
        {/* アプリケーション全体 */}
    </QueryClientProvider>
</ErrorBoundary>
```

### エラーハンドリングのベストプラクティス

#### ✅ 推奨パターン

1. **API層**: Result型を返す（throw errorしない）
2. **Query層**: エラー時はnullを返す
3. **Component層**: データのnullチェック
4. **グローバル**: ErrorBoundaryでキャッチ

```typescript
// ✅ 正しい実装例
const { data, isLoading } = useSampleUsers()

if (isLoading) return <SkeletonLoading />
if (!data) return null // エラー時は何も表示しない（モーダルは自動表示済み）

return <UserList users={data.users} />
```

#### ❌ 非推奨パターン

```typescript
// ❌ throw errorによるアプリクラッシュリスク
const getUsersList = async () => {
    const result = await callFunction(...)
    if (!result.success) {
        throw new Error('Failed') // アプリクラッシュの原因
    }
    return result.data
}

// ❌ エラー処理なし
const { data } = useSampleUsers()
console.log(data.users) // TypeError: Cannot read property 'users' of null
```

### なぜこのパターンが重要なのか

1. **アプリクラッシュ防止**: throw errorを避け、安全に処理継続
2. **統一されたエラー表示**: モーダル自動表示で一貫したUX
3. **多層防御**: API層、Query層、Component層、ErrorBoundaryでの防御
4. **保守性向上**: 一貫したエラーハンドリングパターン

### 必須チェックリスト

- [ ] API層でResult型を返す（throw errorしない）
- [ ] Query/Mutation層でnullチェック実装
- [ ] Component層でデータのnullチェック
- [ ] ErrorBoundaryをapp/\_layoutに設置
- [ ] try-catchは最小限に抑える

**⚠️ この重要事項に従わない場合、アプリクラッシュやランタイムエラーの原因となります。**

---

## 1. Expo React Native ベストプラクティス

### プロジェクト構造

```
/
├── app/                    # Expo Routerのルートファイル
│   ├── (tabs)/            # タブナビゲーション
│   ├── sample/            # サンプル画面
│   │   └── [id]/         # 動的ルート
│   └── _layout.tsx        # ルートレイアウト
├── src/                   # ソースコード
│   ├── components/        # 再利用可能なコンポーネント
│   │   └── ui/           # 基本UIコンポーネント
│   ├── hooks/            # カスタムフック
│   ├── contexts/         # Reactコンテキスト
│   ├── lib/              # ユーティリティ関数
│   ├── constants/        # 定数定義
│   └── sample/           # サンプル機能モジュール
├── api/                  # API関連
│   └── {resource-name}/  # 各リソースのAPI実装
├── db/                   # データベース関連
├── types/                # 型定義
├── assets/              # 画像、フォントなどのアセット
└── supabase/            # Supabase関連
```

### コンポーネント設計

```typescript
// 単一責任原則に従った関数コンポーネント
export function UserCard({ user }: { user: User }) {
  return (
    <View className="p-4">
      <Text>{user.name}</Text>
    </View>
  );
}
```

### パフォーマンス最適化

#### 1. React.memoを使用したメモ化

```typescript
export const ExpensiveComponent = React.memo(({ data }) => {
    // レンダリングコストが高いコンポーネント
})
```

#### 2. useMemo / useCallbackの適切な使用

```typescript
const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b])
const memoizedCallback = useCallback(() => doSomething(a, b), [a, b])
```

#### 3. FlatListの最適化

```typescript
<FlatList
  data={data}
  renderItem={renderItem}
  keyExtractor={item => item.id}
  getItemLayout={(data, index) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  })}
  removeClippedSubviews
  maxToRenderPerBatch={10}
  windowSize={10}
/>
```

## 2. NativeWind ベストプラクティス

### セットアップと設定

#### global.cssでグローバルスタイル定義

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
    :root {
        --primary: 220 90% 56%;
        --secondary: 260 60% 50%;
    }
}
```

#### tailwind.config.jsでテーマ拡張

```javascript
module.exports = {
    content: [
        './app/**/*.{js,jsx,ts,tsx}',
        './components/**/*.{js,jsx,ts,tsx}',
    ],
    presets: [require('nativewind/preset')],
    theme: {
        extend: {
            colors: {
                primary: 'hsl(var(--primary))',
                secondary: 'hsl(var(--secondary))',
            },
        },
    },
}
```

### スタイリング原則

#### 1. ユーティリティファースト

```typescript
// 良い例
<View className="flex-1 items-center justify-center p-4">
  <Text className="text-lg font-bold text-primary">Hello</Text>
</View>

// 避けるべき例（インラインスタイル）
<View style={{ flex: 1, alignItems: 'center' }}>
  <Text style={{ fontSize: 18 }}>Hello</Text>
</View>
```

#### 2. レスポンシブデザイン

```typescript
<View className="w-full px-4 md:px-8 lg:px-16">
  <Text className="text-sm md:text-base lg:text-lg">Responsive Text</Text>
</View>
```

#### 3. ダークモード対応

```typescript
<View className="bg-white dark:bg-gray-900">
  <Text className="text-black dark:text-white">Dark Mode Support</Text>
</View>
```

### コンポーネントスタイル管理

#### cn関数で条件付きクラス

```typescript
import { cn } from '@/lib/utils';

function Button({ variant, className, ...props }) {
  return (
    <Pressable
      className={cn(
        'px-4 py-2 rounded-lg',
        variant === 'primary' && 'bg-primary',
        variant === 'secondary' && 'bg-secondary',
        className
      )}
      {...props}
    />
  );
}
```

#### variantsパターン（改善版）

```typescript
// lib/utils.ts にcn関数を定義
export function cn(...classes: (string | undefined | null | false)[]): string {
    return classes.filter(Boolean).join(' ')
}

// variantsオブジェクトでスタイルを管理
const buttonVariants = {
  base: 'px-4 py-2 rounded transition-opacity active:opacity-80',
  variants: {
    primary: 'bg-primary text-white hover:bg-primary/90',
    secondary: 'bg-secondary text-black hover:bg-secondary/90',
    outline: 'border border-primary text-primary hover:bg-primary/10',
  },
};

// 使用例
<Pressable className={cn(buttonVariants.base, buttonVariants.variants[variant])} />
```

#### ダークモード対応variantsパターン

```typescript
const modalVariants = {
  container: 'bg-white dark:bg-gray-800 rounded-xl p-6 shadow-2xl',
  title: {
    base: 'text-lg font-semibold mb-3 text-center',
    error: 'text-red-500 dark:text-red-400',
    success: 'text-green-600 dark:text-green-400',
  },
  button: {
    base: 'px-5 py-2.5 rounded-md min-w-[80px] items-center active:opacity-80',
    primary: 'bg-blue-500 hover:bg-blue-600',
    danger: 'bg-red-500 hover:bg-red-600',
  },
}

// cn関数で条件付きスタイルを合成
<TouchableOpacity className={cn(modalVariants.button.base, modalVariants.button[type])} />
```

## 3. React Query ベストプラクティス

### セットアップ

```typescript
// app/_layout.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5分
      gcTime: 1000 * 60 * 10, // 10分（旧cacheTime）
      retry: 3,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: 1,
    },
  },
});

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* アプリケーション */}
    </QueryClientProvider>
  );
}
```

### Query Keysの管理

```typescript
// api/users-api/queryKey.ts
export const usersQueryKeys = {
    all: ['users'] as const,
    lists: () => [...usersQueryKeys.all, 'list'] as const,
    list: (filters: string) =>
        [...usersQueryKeys.lists(), { filters }] as const,
    details: () => [...usersQueryKeys.all, 'detail'] as const,
    detail: (id: string) => [...usersQueryKeys.details(), id] as const,
} as const

// api/users-api/users-api-query.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { usersQueryKeys } from './queryKey'
import { callFunction } from '@/lib/callFunction'

export function useUsersList(filters?: UserFilters) {
    return useQuery({
        queryKey: usersQueryKeys.list(JSON.stringify(filters)),
        queryFn: async () => {
            const result = await callFunction(async () => {
                return await supabase.functions.invoke('users-api/users/list', {
                    body: { filters },
                })
            })
            if (!result.success || !result.data) return null
            return result.data
        },
    })
}
```

### カスタムフック設計

```typescript
// api/users-api/hooks/useUsers.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { usersQueryKeys } from '../queryKey'
import { callFunction } from '@/hooks/useCallSupabase'

// 一覧取得
export function useUsers(filters?: UserFilters) {
    return useQuery({
        queryKey: usersQueryKeys.list(JSON.stringify(filters)),
        queryFn: async () => {
            const result = await callFunction(async () => {
                return await supabase.functions.invoke('users-api/users/list', {
                    body: { filters },
                })
            })
            if (!result.success || !result.data) return null
            return result.data
        },
        select: (data) => data?.users,
    })
}

// 詳細取得
export function useUser(id: string) {
    return useQuery({
        queryKey: usersQueryKeys.detail(id),
        queryFn: async () => {
            const result = await callFunction(async () => {
                return await supabase.functions.invoke(`users-api/users/${id}`)
            })
            if (!result.success || !result.data) return null
            return result.data
        },
        enabled: !!id,
    })
}

// 作成
export function useCreateUser() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (userData: CreateUserData) => {
            const result = await callFunction(async () => {
                return await supabase.functions.invoke('users-api/users', {
                    method: 'POST',
                    body: userData,
                })
            })
            if (!result.success || !result.data)
                throw new Error('Failed to create user')
            return result.data
        },
        onSuccess: () => {
            // リスト再取得
            queryClient.invalidateQueries({ queryKey: usersQueryKeys.lists() })
        },
        onError: (error) => {
            console.error('User creation failed:', error)
        },
    })
}

// 更新
export function useUpdateUser() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({
            id,
            data,
        }: {
            id: string
            data: UpdateUserData
        }) => {
            const result = await callFunction(async () => {
                return await supabase.functions.invoke(
                    `users-api/users/${id}`,
                    {
                        method: 'PUT',
                        body: data,
                    }
                )
            })
            if (!result.success || !result.data)
                throw new Error('Failed to update user')
            return result.data
        },
        onSuccess: (data, { id }) => {
            // 詳細キャッシュ更新
            queryClient.setQueryData(usersQueryKeys.detail(id), data)
            // リスト再取得
            queryClient.invalidateQueries({ queryKey: usersQueryKeys.lists() })
        },
    })
}

// 削除
export function useDeleteUser() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (id: string) => {
            const result = await callFunction(async () => {
                return await supabase.functions.invoke(
                    `users-api/users/${id}`,
                    {
                        method: 'DELETE',
                    }
                )
            })
            if (!result.success) throw new Error('Failed to delete user')
            return result.data
        },
        onSuccess: (_, deletedId) => {
            // キャッシュから削除
            queryClient.removeQueries({
                queryKey: usersQueryKeys.detail(deletedId),
            })
            // リスト再取得
            queryClient.invalidateQueries({ queryKey: usersQueryKeys.lists() })
        },
    })
}
```

### オプティミスティックアップデート

```typescript
export function useOptimisticUpdateUser() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: updateUser,
        onMutate: async ({ id, data }) => {
            // クエリキャンセル
            await queryClient.cancelQueries({
                queryKey: queryKeys.users.detail(id),
            })

            // 現在の値を保存
            const previousUser = queryClient.getQueryData(
                queryKeys.users.detail(id)
            )

            // オプティミスティック更新
            queryClient.setQueryData(
                queryKeys.users.detail(id),
                (old: User) => ({
                    ...old,
                    ...data,
                })
            )

            // ロールバック用データを返す
            return { previousUser, id }
        },
        onError: (err, { id }, context) => {
            // エラー時はロールバック
            if (context?.previousUser) {
                queryClient.setQueryData(
                    queryKeys.users.detail(id),
                    context.previousUser
                )
            }
        },
        onSettled: (_, __, { id }) => {
            // 最終的に再取得
            queryClient.invalidateQueries({
                queryKey: queryKeys.users.detail(id),
            })
        },
    })
}
```

### プリフェッチング

```typescript
// hooks/usePrefetch.ts
export function usePrefetchUser() {
  const queryClient = useQueryClient();

  return (userId: string) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.users.detail(userId),
      queryFn: () => getUserById(userId),
      staleTime: 1000 * 60 * 5, // 5分
    });
  };
}

// 使用例
function UserListItem({ user }) {
  const prefetchUser = usePrefetchUser();

  return (
    <Pressable
      onPress={() => router.push(`/users/${user.id}`)}
      onPressIn={() => prefetchUser(user.id)} // タップ時にプリフェッチ
    >
      <Text>{user.name}</Text>
    </Pressable>
  );
}
```

## 4. フォルダ構成とコンポーネント設計

### Bottom-upアプローチによる構成

専用コンポーネント・フックから開始し、共通利用可能と判断した時点で上位階層へ昇格させる戦略を採用。

### 基本構造

```
src/                                # ソースコード
├── sample/                         # 機能モジュール
│   ├── hooks/                     # sample機能専用hooks
│   │   ├── useSample.ts
│   │   └── useAuth0.ts
│   ├── components/                # sample機能専用コンポーネント
│   │   └── CreateUserForm.tsx
│   └── [id]/                      # 詳細画面用
│       └── hooks/
│           └── useSampleDetail.ts
├── components/                     # 共通コンポーネント
│   ├── ui/                        # 基本UIコンポーネント
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   └── Card.tsx
│   ├── layout/                    # レイアウトコンポーネント
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   └── shared/                    # ビジネスロジックを含む共通コンポーネント
│       ├── UserAvatar.tsx
│       └── DatePicker.tsx
└── hooks/                          # 共通hooks（昇格したもの）
    ├── useAuth.ts
    ├── useToast.ts
    └── useDebounce.ts
```

### コンポーネント昇格の基準

#### 1. 昇格タイミング

- 2つ以上の画面で同一のコンポーネント/フックが必要になった時
- 汎用性が高く、他でも使用される可能性が高いと判断された時
- ビジネスロジックが独立していて再利用価値が高い時

#### 2. 昇格手順

```typescript
// Step 1: 専用コンポーネントとして開始
// src/screens/sample/components/UserCard.tsx
export const UserCard = ({ user }: { user: User }) => {
  return (
    <View className="p-4 bg-white rounded-lg">
      <Text>{user.name}</Text>
    </View>
  );
};

// Step 2: 他の画面でも必要になった場合、共通化を検討
// components/shared/UserCard.tsx（昇格後）
interface UserCardProps {
  user: User;
  onPress?: () => void;
  variant?: 'default' | 'compact';
}

export const UserCard = ({ user, onPress, variant = 'default' }: UserCardProps) => {
  // より汎用的な実装に拡張
  return (
    <Pressable onPress={onPress}>
      <View className={variant === 'compact' ? 'p-2' : 'p-4'}>
        <Text>{user.name}</Text>
      </View>
    </Pressable>
  );
};
```

### フック設計パターン

#### 1. 画面専用フック

```typescript
// src/screens/sample/hooks/useSample.ts
export const useUsers = () => {
    const { data, isLoading } = useQuery({
        queryKey: ['users'],
        queryFn: fetchUsers,
    })

    const handleUserSelect = (userId: string) => {
        // この画面特有のロジック
        router.push(`/users/${userId}`)
    }

    return {
        users: data,
        isLoading,
        handleUserSelect,
    }
}
```

#### 2. 共通フック（昇格後）

```typescript
// hooks/useUsers.ts
interface UseUsersOptions {
    autoFetch?: boolean
    filters?: UserFilters
    onSuccess?: (users: User[]) => void
}

export const useUsers = (options: UseUsersOptions = {}) => {
    const { autoFetch = true, filters, onSuccess } = options

    const query = useQuery({
        queryKey: ['users', filters],
        queryFn: () => fetchUsers(filters),
        enabled: autoFetch,
        onSuccess,
    })

    return {
        ...query,
        users: query.data,
    }
}
```

### ネストされたルートの扱い

#### フック共有の階層

```
src/screens/sample/
├── hooks/
│   ├── useSample.ts                # sample機能全体で共有
│   └── useAuth0.ts                 # Auth0関連
├── [id]/
│   └── hooks/
│       └── useSampleDetail.ts      # 詳細画面専用
└── components/
    └── CreateUserForm.tsx          # sample機能で共有
```

### ベストプラクティス

#### 1. 命名規則

- 画面専用: `use{ScreenName}{Feature}` (例: `useUsersFilter`)
- 共通: `use{Feature}` (例: `useDebounce`)

#### 2. インポートパス

```typescript
// 画面専用（相対パス）
import { UserCard } from './components/UserCard'
import { useUsersFilter } from './hooks/useUsersFilter'

// 共通（エイリアス使用）
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'
```

#### 3. 段階的な抽象化

```typescript
// Level 1: 画面専用（具体的）
const useUserDetailForm = () => {
    // 特定の画面に特化した実装
}

// Level 2: 機能共通（部分的な抽象化）
const useUserForm = (mode: 'create' | 'edit') => {
    // ユーザー関連の画面で共有
}

// Level 3: 完全共通（完全な抽象化）
const useForm = <T>(options: FormOptions<T>) => {
    // アプリ全体で使用可能
}
```

## 🔧 Supabase Edge Functions ベストプラクティス

### 🚨 重要: インポートマッピングの設定（必須）

**Edge Functionsで\_sharedファイルをインポートする際は、必ず以下の設定を行う：**

#### 1. `import_map.json` の設定

```json
{
    "imports": {
        "_shared/schemas": "./_shared/schemas/index.ts",
        "_shared/schemas/users": "./_shared/schemas/users.ts",
        "_shared/validations": "./_shared/validations/index.ts",
        "_shared/validations/usersValidation": "./_shared/validations/usersValidation.ts",
        "_shared/middlewares/middleware": "./_shared/middlewares/middleware.ts",
        "_shared/services/userService": "./_shared/services/userService.ts",
        "_shared/types/common/errors": "./_shared/types/common/errors.ts",
        "_shared/errorMessages": "./_shared/errorMessages.ts",
        "_shared/paginationUtility": "./_shared/paginationUtility.ts",
        "_shared/utility": "./_shared/utility.ts"
    }
}
```

#### 2. `deno.json` の設定

```json
{
    "imports": {
        "_shared/": "./supabase/functions/_shared/",
        "_shared/schemas": "./supabase/functions/_shared/schemas/index.ts",
        "_shared/schemas/users": "./supabase/functions/_shared/schemas/users.ts",
        "_shared/validations": "./supabase/functions/_shared/validations/index.ts",
        "_shared/validations/usersValidation": "./supabase/functions/_shared/validations/usersValidation.ts",
        "_shared/middlewares/middleware": "./supabase/functions/_shared/middlewares/middleware.ts",
        "_shared/services/userService": "./supabase/functions/_shared/services/userService.ts",
        "_shared/types/common/errors": "./supabase/functions/_shared/types/common/errors.ts",
        "_shared/errorMessages": "./supabase/functions/_shared/errorMessages.ts",
        "_shared/paginationUtility": "./supabase/functions/_shared/paginationUtility.ts",
        "_shared/utility": "./supabase/functions/_shared/utility.ts"
    }
}
```

### ⚠️ なぜ必要？

この設定を行わないと以下の問題が発生：

- ❌ エディターのジャンプ機能（Go to Definition）が機能しない
- ❌ 型の補完（IntelliSense）が効かない
- ❌ import時のパス解決ができない
- ❌ 開発効率が大幅に低下

### ✅ 正しい使用例

```typescript
// ✅ パスマッピング設定後の正しいインポート
import { authMiddleware } from '_shared/middlewares/middleware'
import { getUserById } from '_shared/services/userService'
import { users } from '_shared/schemas/users'

// ❌ 設定なしの相対パス（非推奨）
import { authMiddleware } from '../_shared/middlewares/middleware.ts'
```

### 📝 新しい\_sharedファイル追加時の手順

1. ファイルを`supabase/functions/_shared/`以下に作成
2. `import_map.json`にパスマッピングを追加
3. `deno.json`にパスマッピングを追加
4. 型チェックとエディタ動作を確認
