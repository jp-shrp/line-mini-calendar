# ベストプラクティス

## 1. Next.js ベストプラクティス

### プロジェクト構造

```
src/
├── app/                    # Next.js App Router
│   ├── (with-layout)/      # レイアウトグループ
│   │   ├── page.tsx        # ページコンポーネント
│   │   └── layout.tsx      # レイアウトコンポーネント
│   ├── api/                # API Routes
│   └── layout.tsx          # ルートレイアウト
├── components/             # 再利用可能なコンポーネント
│   ├── ui/                 # 基本UIコンポーネント
│   └── features/           # 機能別コンポーネント
├── hooks/                  # カスタムフック
├── contexts/               # Reactコンテキスト
├── lib/                    # ユーティリティ関数
└── models/                 # データモデル
```

### コンポーネント設計

```typescript
// Server Component（デフォルト）
export default async function UserList() {
    const users = await fetchUsers() // サーバーで実行

    return (
        <div className="p-4">
            {users.map(user => (
                <div key={user.id}>{user.name}</div>
            ))}
        </div>
    )
}

// Client Component（インタラクティブな要素が必要な場合）
'use client'

export function InteractiveButton() {
    const [count, setCount] = useState(0)

    return (
        <button onClick={() => setCount(count + 1)}>
            Count: {count}
        </button>
    )
}
```

### パフォーマンス最適化

#### 1. Server/Client Componentsの使い分け

```typescript
// ✅ 推奨: Server Componentで静的コンテンツ
export default async function Page() {
    const data = await fetchData()
    return <StaticContent data={data} />
}

// ✅ 推奨: Client Componentでインタラクティブ要素のみ
'use client'

function InteractiveSection() {
    return <button onClick={handleClick}>Click</button>
}
```

#### 2. 動的インポート

```typescript
import dynamic from 'next/dynamic'

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
    loading: () => <p>Loading...</p>,
    ssr: false, // クライアントサイドのみでレンダリング
})
```

#### 3. 画像最適化

```typescript
import Image from 'next/image'

<Image
    src="/images/hero.jpg"
    alt="Hero image"
    width={1200}
    height={600}
    priority // above the fold の画像
    placeholder="blur"
/>
```

## 2. Tailwind CSS ベストプラクティス

### スタイリング原則

#### 1. ユーティリティファースト

```typescript
// ✅ 良い例
<div className="flex items-center justify-center p-4 bg-white rounded-lg shadow-md">
    <h1 className="text-lg font-bold text-primary">Hello</h1>
</div>

// ❌ 避けるべき例（インラインスタイル）
<div style={{ display: 'flex', alignItems: 'center' }}>
    <h1 style={{ fontSize: 18 }}>Hello</h1>
</div>
```

#### 2. レスポンシブデザイン

```typescript
<div className="w-full px-4 md:px-8 lg:px-16">
    <h1 className="text-sm md:text-base lg:text-lg">Responsive Text</h1>
</div>
```

#### 3. ダークモード対応

```typescript
<div className="bg-white dark:bg-gray-900">
    <p className="text-black dark:text-white">Dark Mode Support</p>
</div>
```

### コンポーネントスタイル管理

#### cn関数で条件付きクラス

```typescript
import { cn } from '@/lib/utils'

function Button({ variant, className, ...props }: ButtonProps) {
    return (
        <button
            className={cn(
                'px-4 py-2 rounded-lg',
                variant === 'primary' && 'bg-primary text-white',
                variant === 'secondary' && 'bg-secondary text-black',
                className
            )}
            {...props}
        />
    )
}
```

## 3. React Query ベストプラクティス

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

## 4. エラーハンドリング

### ErrorBoundary実装

```typescript
// components/ErrorBoundary.tsx
'use client'

import { Component, ReactNode } from 'react'

interface Props {
    children: ReactNode
}

interface State {
    hasError: boolean
    error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = { hasError: false }
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error }
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('Error caught by boundary:', error, errorInfo)
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex min-h-screen items-center justify-center">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold">
                            エラーが発生しました
                        </h1>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-4 rounded bg-primary px-4 py-2 text-white"
                        >
                            再読み込み
                        </button>
                    </div>
                </div>
            )
        }

        return this.props.children
    }
}
```

### API エラーハンドリング

```typescript
// lib/api.ts
export async function apiRequest<T>(
    url: string,
    options?: RequestInit
): Promise<T> {
    try {
        const response = await fetch(url, options)

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        return response.json()
    } catch (error) {
        console.error('API request failed:', error)
        throw error
    }
}
```

## 5. セキュリティベストプラクティス

### 環境変数の管理

```typescript
// ✅ 正しい使用
// .env.local
NEXT_PUBLIC_API_URL=https://api.example.com
DATABASE_URL=postgresql://...

// コード内
const apiUrl = process.env.NEXT_PUBLIC_API_URL // クライアント側でアクセス可能
const dbUrl = process.env.DATABASE_URL // サーバー側のみアクセス可能
```

### Server Actions のセキュリティ

```typescript
// actions/user.ts
'use server'

import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function updateUser(userId: string, data: UpdateUserData) {
    // 認証チェック
    const session = await auth()
    if (!session?.user) {
        throw new Error('Unauthorized')
    }

    // 権限チェック
    if (session.user.id !== userId) {
        throw new Error('Forbidden')
    }

    // データ更新
    const user = await db.user.update({
        where: { id: userId },
        data,
    })

    revalidatePath('/profile')
    return user
}
```

## 6. テストベストプラクティス

### コンポーネントテスト

```typescript
// __tests__/Button.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '@/components/ui/Button'

describe('Button', () => {
    it('renders correctly', () => {
        render(<Button>Click me</Button>)
        expect(screen.getByText('Click me')).toBeInTheDocument()
    })

    it('handles click events', async () => {
        const handleClick = jest.fn()
        render(<Button onClick={handleClick}>Click me</Button>)

        await userEvent.click(screen.getByText('Click me'))
        expect(handleClick).toHaveBeenCalledTimes(1)
    })
})
```

## 7. パフォーマンスモニタリング

### Web Vitals の計測

```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
    return (
        <html>
            <body>
                {children}
                <Analytics />
            </body>
        </html>
    )
}
```

## 8. アクセシビリティ

### セマンティックHTML

```typescript
// ✅ 推奨
<nav>
    <ul>
        <li><a href="/">Home</a></li>
        <li><a href="/about">About</a></li>
    </ul>
</nav>

<main>
    <h1>Page Title</h1>
    <article>Content</article>
</main>

// ❌ 避けるべき
<div>
    <div>
        <div onClick={navigate}>Home</div>
    </div>
</div>
```

### ARIA属性の適切な使用

```typescript
<button
    aria-label="Close dialog"
    onClick={handleClose}
>
    <CloseIcon />
</button>
```
