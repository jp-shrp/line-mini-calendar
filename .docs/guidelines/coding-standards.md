# コーディング規約

## プロジェクト構造

### クライアント側構造

```
src/
├── app/                    # Next.js App Router
│   ├── (with-layout)/      # レイアウトグループ
│   │   ├── page.tsx        # トップページ
│   │   └── [feature]/      # 機能ページ
│   ├── api/                # API Routes
│   └── layout.tsx          # ルートレイアウト
├── components/             # 再利用可能コンポーネント
│   ├── ui/                 # 基本UIコンポーネント
│   └── features/           # 機能別コンポーネント
├── hooks/                  # カスタムフック
├── contexts/               # Reactコンテキスト
├── lib/                    # ユーティリティ
├── actions/                # Server Actions
└── models/                 # データモデル
```

### 共通型定義（Schema Firstアプローチ）

```
supabase/functions/_shared/
├── schemas/                # Drizzle ORMスキーマ定義
│   └── users.ts            # テーブルスキーマと基本型定義
├── validations/            # Zodバリデーションスキーマ
│   └── createUserValidation.ts  # フォームバリデーション定義
└── types/
    └── {api-name}-types.ts # API固有の型定義（Schemaから生成）
```

**重要**:

- **Schema First**: リソース系の型は`_shared/schemas/*`から生成
- **バリデーション**: フォームバリデーションは`_shared/validations/*`に定義
- Edge FunctionsとClient両方で使用する型は`_shared/types/`に配置
- importパスは`_shared/`で始まる（設定のaliasを使用）
- これにより型の重複を防ぎ、保守性を向上

## 必須ルール

本プロジェクトで**必ず守るべき**コーディング規約を以下に定めます。

### 1. 独自styleの使用禁止

**❌ 禁止:**

```typescript
// インラインスタイルの使用
<div style={{ backgroundColor: '#ffffff', padding: 16 }} />
```

**✅ 正しい例:**

```typescript
// Tailwind CSSクラスを使用
<div className="bg-white p-4" />
<div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md" />
```

### 2. .tsxファイルでの三項演算子禁止

**❌ 禁止:**

```typescript
// 三項演算子の使用
return (
    <div>
        {isLoading ? <ActivityIndicator /> : <div>Content</div>}
        {user ? <UserProfile user={user} /> : <LoginForm />}
    </div>
)
```

**✅ 正しい例:**

```typescript
// Early returnパターンを使用
if (isLoading) {
    return <ActivityIndicator />
}

if (!user) {
    return <LoginForm />
}

return (
    <div>
        <div>Content</div>
        <UserProfile user={user} />
    </div>
)

// または論理演算子を使用
return (
    <div>
        {isLoading && <ActivityIndicator />}
        {!isLoading && <div>Content</div>}
        {user && <UserProfile user={user} />}
        {!user && <LoginForm />}
    </div>
)
```

### 3. Propsの簡略化（Hook+View分離パターン）

**パターンA: 1ファイル内でhookとviewを分離**

```typescript
// components/UserList.tsx
const useUserList = () => {
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(false)

    const fetchUsers = async () => {
        setLoading(true)
        // fetch logic
        setLoading(false)
    }

    return {
        users,
        loading,
        fetchUsers,
    }
}

const MainView: FC<ReturnType<typeof useUserList>> = ({
    users,
    loading,
    fetchUsers,
}) => {
    if (loading) {
        return <div>Loading...</div>
    }

    return (
        <div className="flex-1 p-4">
            {users.map(user => (
                <div key={user.id}>{user.name}</div>
            ))}
        </div>
    )
}

export const UserList = () => {
    const hookItems = useUserList()
    return <MainView {...hookItems} />
}

export default UserList
```

**パターンB: hookとviewを完全に分離**

```typescript
// hooks/useUserDetail.ts
export const useUserDetail = (userId: string) => {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(false)

    const fetchUser = async () => {
        setLoading(true)
        // fetch logic
        setLoading(false)
    }

    return {
        user,
        loading,
        fetchUser,
    }
}

// components/UserDetail.tsx
import { useUserDetail } from '@/hooks/useUserDetail'

const MainView: FC<ReturnType<typeof useUserDetail>> = ({
    user,
    loading,
    fetchUser,
}) => {
    if (loading) {
        return <div>Loading...</div>
    }

    if (!user) {
        return <div>User not found</div>
    }

    return (
        <div className="flex-1 p-4">
            <h1 className="text-xl font-bold">{user.name}</h1>
            <p className="text-gray-600">{user.email}</p>
        </div>
    )
}

export const UserDetail = ({ userId }: { userId: string }) => {
    const hookItems = useUserDetail(userId)
    return <MainView {...hookItems} />
}

export default UserDetail
```

### 4. console.log/console.error等の削除義務

**❌ 禁止:**

```typescript
// デバッグ用console.logを残したままコミット
console.log('User data:', userData)
console.error('API Error:', error)
console.warn('Deprecated method')
```

**✅ 正しい例:**

```typescript
// 適切なエラーハンドリング
if (error) {
    // エラーはtoastやモーダルで表示
    toast.error('エラーが発生しました')
}
```

### 5. unused import/variableの削除義務

**❌ 禁止:**

```typescript
import React, { useState, useEffect } from 'react' // useEffectが未使用
import { Button, Input, Select } from '@/components' // Selectが未使用

export const MyComponent = () => {
    const [data, setData] = useState([]) // setDataが未使用
    const unusedVariable = 'test' // 完全に未使用

    return <div><Button>Hello</Button></div>
}
```

**✅ 正しい例:**

```typescript
import React, { useState } from 'react'
import { Button } from '@/components'

export const MyComponent = () => {
    return <div><Button>Hello</Button></div>
}
```

### 6. 絶対パスインポートの使用義務

**❌ 禁止:**

```typescript
// 相対パスの使用
import { useModal } from '../../contexts/ModalContext'
import { cn } from '../../../lib/utils'
import { UserService } from '../../../../services/UserService'
```

**✅ 正しい例:**

```typescript
// 絶対パスの使用（@/ aliasを使用）
import { useModal } from '@/contexts/ModalContext'
import { cn } from '@/lib/utils'
import { UserService } from '@/services/UserService'
```

### 7. 型定義の明示義務

**❌ 禁止:**

```typescript
// anyの使用
const handleData = (data: any) => {}

// 型推論に頼った曖昧な定義
const [user, setUser] = useState(null)
const [items, setItems] = useState([])

// 関数の戻り値型が不明
const fetchUser = async (id) => {
    // ...
}
```

**✅ 正しい例:**

```typescript
// 明示的な型定義
interface User {
    id: string
    name: string
    email: string
}

const handleData = (data: User) => {}

// 型を明示
const [user, setUser] = useState<User | null>(null)
const [items, setItems] = useState<Item[]>([])

// 関数の引数と戻り値の型を明示
const fetchUser = async (id: string): Promise<User | null> => {
    // ...
}
```

## React Query ベストプラクティス

### セットアップ

```typescript
// app/providers.tsx
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 1000 * 60 * 5, // 5分
                        gcTime: 1000 * 60 * 10, // 10分
                        retry: 3,
                        retryDelay: attemptIndex =>
                            Math.min(1000 * 2 ** attemptIndex, 30000),
                    },
                    mutations: {
                        retry: 1,
                    },
                },
            })
    )

    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )
}
```

### Query Keysの管理

```typescript
// lib/queryKeys.ts
export const queryKeys = {
    users: {
        all: ['users'] as const,
        lists: () => [...queryKeys.users.all, 'list'] as const,
        list: (filters: string) =>
            [...queryKeys.users.lists(), { filters }] as const,
        details: () => [...queryKeys.users.all, 'detail'] as const,
        detail: (id: string) => [...queryKeys.users.details(), id] as const,
    },
} as const
```

### カスタムフック設計

```typescript
// hooks/useUsers.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryKeys'

export function useUsers(filters?: UserFilters) {
    return useQuery({
        queryKey: queryKeys.users.list(JSON.stringify(filters)),
        queryFn: async () => {
            const response = await fetch('/api/users')
            return response.json()
        },
    })
}

export function useCreateUser() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (userData: CreateUserData) => {
            const response = await fetch('/api/users', {
                method: 'POST',
                body: JSON.stringify(userData),
            })
            return response.json()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() })
        },
    })
}
```

## Server Actions / API Routes

### Server Actions

```typescript
// actions/user.ts
'use server'

import { revalidatePath } from 'next/cache'

export async function createUser(formData: FormData) {
    const name = formData.get('name') as string
    const email = formData.get('email') as string

    // データベース処理
    const user = await db.user.create({ data: { name, email } })

    revalidatePath('/users')
    return user
}
```

### API Routes

```typescript
// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
    const users = await db.user.findMany()
    return NextResponse.json({ users })
}

export async function POST(request: NextRequest) {
    const body = await request.json()
    const user = await db.user.create({ data: body })
    return NextResponse.json({ user })
}
```

## エラーハンドリング

### クライアント側

```typescript
// components/ErrorBoundary.tsx
'use client'

import { Component, ReactNode } from 'react'

interface Props {
    children: ReactNode
}

interface State {
    hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = { hasError: false }
    }

    static getDerivedStateFromError() {
        return { hasError: true }
    }

    render() {
        if (this.state.hasError) {
            return <div>エラーが発生しました</div>
        }

        return this.props.children
    }
}
```

### Server Actions

```typescript
'use server'

export async function createUser(formData: FormData) {
    try {
        // 処理
    } catch (error) {
        return { error: 'ユーザーの作成に失敗しました' }
    }
}
```

## パフォーマンス最適化

### Server/Client Components の使い分け

```typescript
// Server Component (デフォルト)
export default async function Page() {
    const data = await fetchData() // サーバー側で実行
    return <div>{data}</div>
}

// Client Component
'use client'

export function InteractiveButton() {
    const [count, setCount] = useState(0)
    return <button onClick={() => setCount(count + 1)}>{count}</button>
}
```

### 動的インポート

```typescript
import dynamic from 'next/dynamic'

const DynamicComponent = dynamic(() => import('./HeavyComponent'), {
    loading: () => <p>Loading...</p>,
    ssr: false,
})
```
