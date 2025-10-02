# Supabase Edge Functions 使用ガイド

本プロジェクトでは、Supabase Edge Functions + Next.js + React Query の構成で API を呼び出しています。

## 目次

1. [概要](#概要)
2. [基本的な使い方](#基本的な使い方)
3. [SSR での使用](#ssr-での使用)
4. [CSR での使用](#csr-での使用)
5. [エラーハンドリング](#エラーハンドリング)
6. [サンプルコード](#サンプルコード)

## 概要

### callEdgeFunction の新しい形式

Edge Function を呼び出す際は、`callEdgeFunction` を使用します。この関数は、`supabase.functions.invoke` をラップして、エラーハンドリングを統一的に行います。

```ts
const result = await supabaseApiClient.callEdgeFunction<ResponseType>(
  async () => {
    return supabase.functions.invoke('function-name', {
      method: 'POST',
      body: data,
    })
  },
  {
    error: {
      title: 'エラータイトル',
      message: 'エラーメッセージ',
    },
  }
)
```

### 主な特徴

- **統一されたエラーハンドリング**: すべてのエラーを `StandardApiError` 形式に変換
- **エラーフォールバック**: オプションでエラー時のタイトルとメッセージを指定可能
- **型安全**: TypeScript による型推論をサポート

## 基本的な使い方

### 1. 基本形

```ts
import { createSupabaseClient } from '@/db/supabase'
import { supabaseApiClient } from '@/src/lib/supabase-api-client'

const supabase = createSupabaseClient()

// GET リクエスト
const users = await supabaseApiClient.callEdgeFunction<UsersResponse>(
  async () => {
    return supabase.functions.invoke('samples-api/users', {
      method: 'GET',
    })
  },
  {
    error: {
      title: 'ユーザー取得エラー',
      message: 'ユーザー一覧の取得に失敗しました',
    },
  }
)

// POST リクエスト
const newUser = await supabaseApiClient.callEdgeFunction<UserResponse>(
  async () => {
    return supabase.functions.invoke('samples-api/users', {
      method: 'POST',
      body: {
        name: '太郎',
        email: 'taro@example.com',
      },
    })
  },
  {
    error: {
      title: 'ユーザー作成エラー',
      message: 'ユーザーの作成に失敗しました',
    },
  }
)
```

## SSR での使用

Server Component (SSR) では、`callEdgeFunction` を直接使用してデータを取得します。

### 例: Server Component

```tsx
// src/app/samples/ssr/page.tsx
import { createSupabaseClient } from '@/db/supabase'
import { supabaseApiClient } from '@/src/lib/supabase-api-client'

interface User {
  id: string
  name: string
  email: string
}

interface UsersResponse {
  users: User[]
}

export default async function SSRPage() {
  const supabase = createSupabaseClient()

  const data = await supabaseApiClient.callEdgeFunction<UsersResponse>(
    async () => {
      return supabase.functions.invoke('samples-api/users', {
        method: 'GET',
      })
    },
    {
      error: {
        title: 'ユーザー取得エラー',
        message: 'ユーザー一覧の取得に失敗しました',
      },
    }
  )

  return (
    <div>
      <h1>ユーザー一覧</h1>
      <ul>
        {data.users.map((user) => (
          <li key={user.id}>
            {user.name} ({user.email})
          </li>
        ))}
      </ul>
    </div>
  )
}
```

### SSR の利点

- SEO 対応に最適
- 初期表示が高速
- サーバー側でデータを取得するため、クライアント側の処理が不要

## CSR での使用

Client Component (CSR) では、React Query のカスタムフック `useSupabaseQuery` と `useSupabaseMutation` を使用します。

### 1. useSupabaseQuery (GET リクエスト)

```tsx
'use client'

import { useSupabaseQuery } from '@/src/hooks/useSupabaseQuery'

interface UsersResponse {
  users: User[]
}

export default function CSRPage() {
  const { data, isLoading, error, refetch } = useSupabaseQuery<UsersResponse>({
    queryKey: ['users'],
    functionName: 'samples-api/users',
  })

  if (isLoading) return <div>読み込み中...</div>
  if (error) return <div>エラー: {error.message}</div>

  return (
    <div>
      <h1>ユーザー一覧</h1>
      <button onClick={() => refetch()}>再読込</button>
      <ul>
        {data?.users.map((user) => (
          <li key={user.id}>
            {user.name} ({user.email})
          </li>
        ))}
      </ul>
    </div>
  )
}
```

### 2. useSupabaseMutation (POST/PUT/DELETE リクエスト)

```tsx
'use client'

import { useSupabaseMutation } from '@/src/hooks/useSupabaseMutation'

export default function CSRPage() {
  const createUserMutation = useSupabaseMutation<
    { user: User },
    { name: string; email: string }
  >({
    functionName: 'samples-api/users',
    method: 'POST',
    invalidateQueries: ['users'], // 成功時に再取得するクエリ
    onSuccess: (data) => {
      console.log('ユーザー作成成功:', data)
    },
  })

  const handleCreateUser = () => {
    createUserMutation.mutate({
      name: '太郎',
      email: 'taro@example.com',
    })
  }

  return (
    <button onClick={handleCreateUser} disabled={createUserMutation.isPending}>
      {createUserMutation.isPending ? '作成中...' : 'ユーザー作成'}
    </button>
  )
}
```

### 3. callEdgeFunction を直接使用

React Query を使わずに、`callEdgeFunction` を直接呼び出すこともできます。

```tsx
'use client'

import { createSupabaseClient } from '@/db/supabase'
import { supabaseApiClient } from '@/src/lib/supabase-api-client'

export default function CSRPage() {
  const handleFetchUsers = async () => {
    const supabase = createSupabaseClient()

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
      console.log('取得成功:', result)
    } catch (err) {
      console.error('エラー:', err)
    }
  }

  return <button onClick={handleFetchUsers}>ユーザー取得</button>
}
```

### CSR の利点

- インタラクティブな UI
- キャッシュ管理が容易
- リアルタイムなデータ更新

## エラーハンドリング

### StandardApiError 形式

すべてのエラーは以下の形式に統一されます:

```ts
interface StandardApiError {
  title: string
  message: string
  code: string
  status: number
  details?: any
}
```

### エラーフォールバック

`callEdgeFunction` のオプションでエラー時のデフォルトメッセージを指定できます:

```ts
const result = await supabaseApiClient.callEdgeFunction<ResponseType>(
  async () => {
    return supabase.functions.invoke('function-name', {
      method: 'POST',
      body: data,
    })
  },
  {
    error: {
      title: 'カスタムエラータイトル', // エラー時のタイトル
      message: 'カスタムエラーメッセージ', // エラー時のメッセージ
    },
  }
)
```

エラーが発生した場合、Edge Function から返されたエラーメッセージが優先されます。Edge Function からエラーメッセージが返されない場合は、ここで指定したフォールバックメッセージが使用されます。

## サンプルコード

実際の動作サンプルは以下のページで確認できます:

- **SSR サンプル**: `/samples/ssr`
- **CSR サンプル**: `/samples/csr`
- **サンプル一覧**: `/samples`

### ディレクトリ構成

```
src/
  app/
    samples/
      page.tsx           # サンプル一覧ページ
      ssr/
        page.tsx         # SSR サンプル
      csr/
        page.tsx         # CSR サンプル
  hooks/
    useSupabaseQuery.ts    # React Query用のGETフック
    useSupabaseMutation.ts # React Query用のPOST/PUT/DELETEフック
  lib/
    supabase-api-client.ts # callEdgeFunction実装
```

## まとめ

| パターン                 | 用途               | 主なメリット           |
| ------------------------ | ------------------ | ---------------------- |
| SSR (Server Component)   | 初期表示、SEO 対応 | 高速、SEO フレンドリー |
| CSR (useSupabaseQuery)   | データ取得         | キャッシュ、自動再取得 |
| CSR (useSupabaseMutation) | データ更新         | 楽観的 UI、自動更新    |
| CSR (callEdgeFunction)   | カスタム処理       | 柔軟性が高い           |

プロジェクトの要件に応じて、適切なパターンを選択してください。
