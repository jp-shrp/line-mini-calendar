# React Query統合パターン

## 基本構造（MUST）

すべてのAPI呼び出しは以下の構造に従う:

```
api/
├── query-key.ts          # Query Keys定義
├── feature-query.ts      # Query Hooks定義
└── feature-mutation.ts   # Mutation Hooks定義

hooks/
└── useFeature.ts         # Business Logic Hook

components/
├── FeatureClient.tsx     # Client Component
└── MainView.tsx          # Presentational Component
```

## 1. Query Keys定義（必須）

階層構造で定義し、キャッシュの無効化を容易に:

```typescript
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
```

## 2. Query Hook定義

`useSupabaseQuery`を使用:

```typescript
// api/user-query.ts
export const useUserListQuery = () => {
    return useSupabaseQuery<User[]>({
        queryKey: userQueryKeys.lists(),
        functionName: 'samples-api/users',
        method: 'GET',
    })
}

export const useUserDetailQuery = (userId: string) => {
    return useSupabaseQuery<User>({
        queryKey: userQueryKeys.detail(userId),
        functionName: 'samples-api/users',
        params: { id: userId },
    })
}
```

## 3. Mutation Hook定義

`useSupabaseMutation`を使用:

```typescript
// api/user-mutation.ts
export const useCreateUserMutation = () => {
    return useSupabaseMutation<User, CreateUserRequest>({
        functionName: 'samples-api/users',
        method: 'POST',
        invalidateKeys: [userQueryKeys.lists()],
        successMessage: 'ユーザーを作成しました',
    })
}

export const useUpdateUserMutation = () => {
    return useSupabaseMutation<User, Partial<User>>({
        functionName: 'samples-api/users',
        method: 'PUT',
        invalidateKeys: [userQueryKeys.all],
        successMessage: 'ユーザー情報を更新しました',
    })
}
```

## 4. Business Logic Hook

Query/Mutation Hooksを組み合わせてビジネスロジックを実装:

```typescript
// hooks/useUserList.ts
export const useUserList = () => {
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
    
    const { data, isLoading, error, refetch } = useUserListQuery()
    const deleteMutation = useDeleteUserMutation()
    
    const handleSelectUser = useCallback((userId: string) => {
        setSelectedUserId(userId)
    }, [])
    
    const handleDeleteUser = useCallback(async (userId: string) => {
        await deleteMutation.mutateAsync({ id: userId })
        setSelectedUserId(null)
    }, [deleteMutation])
    
    return {
        users: data || [],
        isLoading,
        error,
        selectedUserId,
        isDeleting: deleteMutation.isPending,
        handleSelectUser,
        handleDeleteUser,
        handleRefresh: refetch,
    }
}
```

## 5. Component統合

```typescript
// components/UserListClient.tsx
const UserListClient = () => {
    const hookData = useUserList()
    return <MainView {...hookData} />
}

const MainView: FC<ReturnType<typeof useUserList>> = ({
    users,
    isLoading,
    handleDeleteUser,
}) => {
    return (
        <QueryStateHandler
            data={users}
            isLoading={isLoading}
            useGlobalLoading={true}>
            {(users) => (
                <div>
                    {users.map(user => (
                        <div key={user.id}>{user.name}</div>
                    ))}
                </div>
            )}
        </QueryStateHandler>
    )
}
```

## Query Options

```typescript
useSupabaseQuery({
    queryKey: userQueryKeys.lists(),
    functionName: 'samples-api/users',
    method: 'GET',
    params: { limit: 10 },
    suppressErrorModal: false,
    enabled: true,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
})
```

## 禁止事項（MUST）

- ❌ コンポーネント内で直接Query Hooksを呼び出すこと
- ❌ Query Keysを直接文字列で定義すること
- ❌ ビジネスロジックとViewを同一コンポーネント内に混在させること