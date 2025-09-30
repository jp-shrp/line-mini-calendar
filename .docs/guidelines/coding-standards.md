# コーディング規約

## ローディング状態の管理

ローディング処理の実装については、専用のガイドラインに従ってください。
→ [ローディング戦略ガイドライン](./loading-strategy.md)

## プロジェクト構造

### クライアント側API構造

```
api/
├── {resource-name}/                 # リソース名（例: users-api）
│   ├── {resource-name}-query.ts     # React Query実装
│   ├── queryKey.ts                  # Query Key定義
│   ├── hooks/
│   │   └── use{ResourceName}Api.ts  # API疎通サービス（useCallSupabase使用）
│   └── types/                       # クライアント専用型定義（あれば）
```

### ページ構造（画面実装）

```
app/
├── (screens)/                        # 画面グループ
│   ├── {page-name}/                 # リスト画面（例: sample）
│   │   ├── index.tsx                # メインコンポーネント
│   │   ├── hooks/
│   │   │   └── use{PageName}.ts     # 画面専用フック
│   │   └── components/              # 画面専用コンポーネント（あれば）
│   └── [id]/                        # 詳細画面（動的ルート）
│       ├── index.tsx                # メインコンポーネント
│       ├── hooks/
│       │   └── use{PageName}Detail.ts  # 詳細画面専用フック
│       └── components/              # 詳細画面専用コンポーネント（あれば）
```

### 共通型定義（Schema Firstアプローチ）

```
supabase/functions/_shared/
├── schemas/                         # Drizzle ORMスキーマ定義
│   └── users.ts                     # テーブルスキーマと基本型定義
├── validations/                     # Zodバリデーションスキーマ
│   └── createUserValidation.ts      # フォームバリデーション定義
└── types/
    └── {api-name}-types.ts          # API固有の型定義（Schemaから生成）
```

**重要**:

- **Schema First**: リソース系の型は`_shared/schemas/*`から生成
- **バリデーション**: フォームバリデーションは`_shared/validations/*`に定義
- Edge FunctionsとClient両方で使用する型は`_shared/types/`に配置
- importパスは`_shared/`で始まる（tsconfig.jsonのaliasを使用）
- これにより型の重複を防ぎ、保守性を向上
- Supabase ClientはSingletonパターンなので、ファイル上部でimport

## 必須ルール

本プロジェクトで**必ず守るべき**コーディング規約を以下に定めます。

### 1. 独自styleの使用禁止

**❌ 禁止:**

```typescript
// StyleSheetの使用
import { StyleSheet } from 'react-native'

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    padding: 16,
  }
})

// インラインスタイルの使用
<View style={{ backgroundColor: '#ffffff', padding: 16 }} />
<View style={styles.container} />
```

**✅ 正しい例:**

```typescript
// NativeWind/Tailwindクラスを使用
<View className="bg-white p-4" />
<View className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md" />
```

### 2. .tsxファイルでの三項演算子禁止

**❌ 禁止:**

```typescript
// 三項演算子の使用
return (
  <View>
    {isLoading ? <ActivityIndicator /> : <Text>Content</Text>}
    {user ? <UserProfile user={user} /> : <LoginForm />}
  </View>
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
  <View>
    <Text>Content</Text>
    <UserProfile user={user} />
  </View>
)

// または論理演算子を使用
return (
  <View>
    {isLoading && <ActivityIndicator />}
    {!isLoading && <Text>Content</Text>}
    {user && <UserProfile user={user} />}
    {!user && <LoginForm />}
  </View>
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
        return <ActivityIndicator />
    }

    return (
        <View className="flex-1 p-4">
            {users.map(user => (
                <Text key={user.id}>{user.name}</Text>
            ))}
        </View>
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
import { useUserDetail } from './hooks/useUserDetail'

const MainView: FC<ReturnType<typeof useUserDetail>> = ({
    user,
    loading,
    fetchUser,
}) => {
    if (loading) {
        return <ActivityIndicator />
    }

    if (!user) {
        return <Text>User not found</Text>
    }

    return (
        <View className="flex-1 p-4">
            <Text className="text-xl font-bold">{user.name}</Text>
            <Text className="text-gray-600">{user.email}</Text>
        </View>
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
// 本格的なロギングライブラリを使用
import { logger } from '@/lib/logger'

logger.debug('User data:', userData)
logger.error('API Error:', error)
logger.warn('Deprecated method')

// または適切なエラーハンドリング
if (error) {
    // エラーはuseModalやtoastで表示
    openModal({
        title: 'エラーが発生しました',
        message: error.message,
        type: 'error',
    })
}
```

### 5. unused import/variableの削除義務

**❌ 禁止:**

```typescript
import React, { useState, useEffect } from 'react' // useEffectが未使用
import { View, Text, TouchableOpacity } from 'react-native' // TouchableOpacityが未使用

export const MyComponent = () => {
    const [data, setData] = useState([]) // setDataが未使用
    const unusedVariable = 'test' // 完全に未使用

    return <View><Text>Hello</Text></View>
}
```

**✅ 正しい例:**

```typescript
import React, { useState } from 'react'
import { View, Text } from 'react-native'

export const MyComponent = () => {
    return <View><Text>Hello</Text></View>
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
import { useModal } from '@/src/contexts/ModalContext'
import { cn } from '@/src/lib/utils'
import { UserService } from '@/services/UserService'

// 画面コンポーネント用のディレクトリ構造に従ったインポート
import { useSample } from '@/src/screens/sample/hooks/useSample'
import { CreateUserForm } from '@/src/screens/sample/components/CreateUserForm'
import { useSampleDetail } from '@/src/screens/sample/[id]/hooks/useSampleDetail'
```

### 6-1. ディレクトリ構造の規約

**プロジェクト構造:**

```
app/
├── sample/                  # サンプル画面のルート
│   ├── index.tsx           # メイン画面コンポーネント
│   └── [id]/               # 動的ルート
│       └── index.tsx       # 詳細画面コンポーネント
src/
├── components/             # 共通UIコンポーネント
├── constants/              # 定数定義
├── contexts/               # React Context
├── hooks/                  # 共通カスタムフック
├── lib/                    # ユーティリティ関数
└── sample/                 # サンプル画面のロジック層
    ├── hooks/              # カスタムフック
    │   └── useSample.ts
    ├── components/         # 再利用可能なコンポーネント
    │   └── CreateUserForm.tsx
    └── [id]/               # 詳細画面用のロジック
        └── hooks/
            └── useSampleDetail.ts
```

**重要な規約:**

- `app/` ディレクトリには画面コンポーネント（`index.tsx`）のみを配置
- 共通の `components/`、`constants/`、`contexts/`、`hooks/`、`lib/` は `src/` ディレクトリ直下に配置
- 各画面固有の `hooks/`、`components/` などのロジック層は `src/{page-name}/` ディレクトリに配置
- これによりExpo Routerの警告を回避し、関心の分離を実現

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

## 追加提案ルール（新規導入推奨）

### 8. ESLintルールの強制

**✅ 提案:**

```json
// .eslintrc.js または eslint.config.js
{
    "rules": {
        "no-console": "error", // console.log等を完全禁止
        "@typescript-eslint/no-unused-vars": "error", // 未使用変数をエラー化
        "@typescript-eslint/explicit-function-return-type": "warn", // 関数戻り値型の明示
        "prefer-const": "error", // letよりconstを推奨
        "no-var": "error", // varの使用禁止
        "react/jsx-no-useless-fragment": "error", // 不要なFragmentの禁止
        "react-hooks/exhaustive-deps": "error" // useEffect依存配列の厳密チェック
    }
}
```

### 9. Prettier設定の統一

**✅ 提案:**

```json
// .prettierrc
{
    "semi": false,
    "trailingComma": "es5",
    "singleQuote": true,
    "printWidth": 100,
    "tabWidth": 4,
    "bracketSpacing": true,
    "arrowParens": "avoid"
}
```

### 10. コミット前の必須チェック項目

**✅ 提案（husky + lint-staged）:**

```json
// package.json
{
    "lint-staged": {
        "*.{ts,tsx}": ["eslint --fix", "prettier --write", "tsc --noEmit"]
    },
    "husky": {
        "hooks": {
            "pre-commit": "lint-staged",
            "pre-push": "npm run test && npm run type-check"
        }
    }
}
```

## 推奨ルール

### 11. TypeScript厳格性

**✅ 推奨:**

```typescript
// 型の明示的な定義
interface User {
    id: string
    name: string
    email: string
}

// Genericsの積極的な使用
const useApiCall = <T>() => {
    const [data, setData] = useState<T | null>(null)
    // ...
}

// Non-null assertionの禁止（代わりに型ガード使用）
if (user && user.name) {
    // 処理
}
```

### 12. コンポーネント命名規則

**✅ 推奨:**

```typescript
// PascalCaseでExportコンポーネント
export const UserListComponent = () => {}

// camelCaseでhook関数
const useUserList = () => {}

// PascalCaseで内部View
const MainView: FC<Props> = () => {}
```

### 13. ファイル構造の統一

**✅ 推奨:**

```
components/
├── UserList/
│   ├── index.tsx          // export { UserList } from './UserList'
│   ├── UserList.tsx       // メインコンポーネント
│   └── hooks/
│       └── useUserList.ts // 専用hook（必要に応じて）
```

### 14. エラーハンドリングの統一

**✅ 推奨:**

```typescript
// Early returnでエラーハンドリング（ErrorBoundaryで保護）
const MyComponent = () => {
    const { data, isLoading } = useQuery()

    if (isLoading) return <LoadingSpinner />
    if (!data) return null // エラーは自動でモーダル表示される

    return <DataDisplay data={data} />
}
```

**ErrorBoundaryによる保護（必須）:**

```typescript
// app/_layout.tsx
<ErrorBoundary>
    <QueryClientProvider client={queryClient}>
        {/* アプリ全体がエラー保護される */}
    </QueryClientProvider>
</ErrorBoundary>
```

### 15. useEffectの依存配列

**✅ 推奨:**

```typescript
// 依存配列は必ず明記
useEffect(() => {
    fetchData(userId)
}, [userId]) // 依存関係を明確に

// 空配列の場合もコメントで意図を明記
useEffect(() => {
    // マウント時のみ実行
    initializeApp()
}, []) // マウント時のみ
```

### 16. 条件付きレンダリング

**✅ 推奨:**

```typescript
// 複雑な条件は関数で切り出し
const shouldShowContent = useMemo(() => {
    return user && user.isActive && !loading
}, [user, loading])

return (
    <View>
        {shouldShowContent && <Content />}
    </View>
)
```

### 17. パフォーマンス最適化

**✅ 推奨:**

```typescript
// React.memoを適切に使用
export const UserCard = React.memo<Props>(({ user }) => {
    return <View>...</View>
})

// useCallbackで関数をメモ化
const handlePress = useCallback(() => {
    onPress(user.id)
}, [user.id, onPress])
```

## useCallSupabaseの使用方法

### 概要

`useCallSupabase`は、Supabase APIを呼び出す際の統一的なインターフェースを提供するカスタムフックです。
シンプルで直感的なインターフェースを提供し、エラーハンドリングを洗練させた実装になっています。

### 基本的な使い方

#### Edge Functions（Supabase Functions）の呼び出し

```typescript
import { useCallSupabase } from '@/hooks/useCallSupabase'

const MyComponent = () => {
    const { callFunction } = useCallSupabase()

    const handleSubmit = async (data: FormData) => {
        const result = await callFunction(
            async () => {
                return await supabase.functions.invoke<ResponseType>(
                    'endpoint-name',
                    {
                        body: data,
                        method: 'POST',
                    },
                )
            },
            {
                title: 'エラータイトル',
                message: 'エラー時に表示するメッセージ',
            },
        )

        // successチェック
        if (!result.success || !result.data) {
            return // エラーは自動でモーダル表示される
        }

        // 成功時の処理
        console.log('Success:', result.data)
    }
}
```

#### データベース操作（PostgREST）の呼び出し

```typescript
const { callSupabase } = useCallSupabase()

const fetchData = async () => {
    try {
        const { data } = await callSupabase(
            async () => {
                return await supabase
                    .from('table_name')
                    .select('*')
                    .eq('column', 'value')
                    .single()
            },
            {
                title: 'データ取得エラー',
                message: 'データの取得に失敗しました',
            },
        )

        // dataを直接使用
        setData(data)
    } catch (error) {
        // エラー処理
    }
}
```

#### 認証操作の呼び出し

```typescript
const { callAuth } = useCallSupabase()

const handleLogin = async (email: string, password: string) => {
    try {
        const { data } = await callAuth(
            async () => {
                return await supabase.auth.signInWithPassword({
                    email,
                    password,
                })
            },
            {
                title: 'ログインエラー',
                message: 'ログインに失敗しました',
            },
        )

        // ログイン成功
        console.log('User:', data.user)
    } catch (error) {
        // エラー処理
    }
}
```

### エラーハンドリングのオプション

```typescript
const result = await callFunction(
    async () => {
        /* ... */
    },
    {
        title: 'カスタムタイトル', // エラーモーダルのタイトル
        message: 'カスタムメッセージ', // エラーモーダルのメッセージ
        noModal: true, // trueにするとモーダル表示を抑制
        handle: (res) => {
            // カスタムエラーハンドリング
            console.log('Custom handling:', res)
        },
    },
)

// successチェックが必須
if (result.success && result.data) {
    // 成功時の処理
}
```

### エラーハンドリングの仕組み

1. **認証エラー（401/403）**: 自動的にログアウトし、ログイン画面にリダイレクト
2. **StandardApiError形式**: APIから返される標準エラー形式を自動解析
3. **エラーモーダル**: デフォルトでエラーをモーダル表示
4. **ProcessedError**: 処理済みエラーのマーカークラス（重複処理防止）

### 実装上の注意点

1. **callFunctionはResult型を返す**: `{ data: T | null, error: boolean, success: boolean }` 型を返す
2. **successチェックが必須**: エラー時は`success: false`、`data: null`になるため、必ずチェックすること
3. **型安全性**: ジェネリクスを使用して型安全性を確保
4. **認証エラーの自動処理**: 401エラーは自動でログアウト処理されるため、個別対応不要
5. **try-catch不要**: callFunctionはエラーをthrowしないため、try-catchは不要

### 使用例

```typescript
// シンプルな使用例
const result = await callFunction(
    async () => await supabase.functions.invoke('endpoint', { body: data }),
    { title: 'エラー', message: 'エラーメッセージ' },
)

if (!result.success || !result.data) {
    // エラーは自動表示される
    return
}

// 成功時の処理
handleSuccess(result.data)
```

## useZodFormの使用方法

### 概要

`useZodForm`は、React Hook FormとZodを統合し、型安全なフォームバリデーションを提供するカスタムフックです。
Schema First アプローチに基づき、`_shared/schemas`でベースの型定義を行い、`_shared/validations`でバリデーションルールを定義します。

### 基本的な使い方

#### 1. スキーマの定義（\_shared/schemas）

まず、データベーススキーマとしてベースの型定義を行います：

```typescript
// supabase/functions/_shared/schemas/users.ts
import { pgTable, varchar, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { type InferInsertModel, type InferSelectModel } from 'drizzle-orm'

export const users = pgTable('users', {
    id: uuid('id').primaryKey().defaultRandom(),
    email: varchar('email', { length: 255 }).unique().notNull(),
    name: varchar('name', { length: 100 }),
    profileImage: text('profile_image'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export type SelectUser = InferSelectModel<typeof users>
export type InsertUser = InferInsertModel<typeof users>
```

#### 2. バリデーションの定義（\_shared/validations）

スキーマの型を基にバリデーションルールを定義します：

```typescript
// supabase/functions/_shared/validations/createUserValidation.ts
import { z } from 'zod'
import type { InsertUser } from '_shared/schemas/users'

export const createUserSchema = z.object({
    email: z
        .string()
        .min(1, 'メールアドレスを入力してください')
        .email('有効なメールアドレスを入力してください')
        .max(255, 'メールアドレスは255文字以内で入力してください'),
    name: z
        .string()
        .min(1, '名前を入力してください')
        .min(2, '名前は2文字以上で入力してください')
        .max(100, '名前は100文字以内で入力してください')
        .optional()
        .transform((val) => val || undefined),
}) satisfies z.ZodType<Pick<InsertUser, 'email' | 'name'>>

export type CreateUserFormData = z.infer<typeof createUserSchema>
```

#### 3. フォームコンポーネントでの使用

```typescript
// app/(screens)/sample/components/CreateUserForm.tsx
import React from 'react'
import { TextInput, TouchableOpacity, View, Text } from 'react-native'
import { Controller } from 'react-hook-form'
import { useZodForm } from '@/hooks/useZodForm'
import {
    createUserSchema,
    type CreateUserFormData,
} from '_shared/validations/createUserValidation'

export const CreateUserForm: React.FC<CreateUserFormProps> = ({
    onSubmit,
    isSubmitting = false,
}) => {
    const form = useZodForm<CreateUserFormData>({
        schema: createUserSchema,
        defaultValues: {
            email: '',
            name: '',
        },
    })

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = form

    return (
        <View>
            <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                    <>
                        <TextInput
                            className={errors.email
                                ? 'border-red-500 bg-red-50'
                                : 'border-gray-300 bg-white'}
                            placeholder="メールアドレス"
                            value={value}
                            onChangeText={onChange}
                            onBlur={onBlur}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                        {errors.email && (
                            <Text className="text-xs text-red-600">
                                {errors.email.message}
                            </Text>
                        )}
                    </>
                )}
            />

            <TouchableOpacity
                onPress={handleSubmit(onSubmit)}
                disabled={isSubmitting}>
                <Text>送信</Text>
            </TouchableOpacity>
        </View>
    )
}
```

### 重要な設計原則

1. **Schema First アプローチ**
    - 型定義は必ず `_shared/schemas/*` で行う
    - バリデーションは `_shared/validations/*` で定義
    - スキーマ型を継承してバリデーションを作成

2. **型安全性の確保**
    - `satisfies z.ZodType<T>` を使用して型の整合性を保証
    - ジェネリクスを活用して型推論を最大限活用

3. **エラーハンドリング**
    - エラーメッセージは日本語で分かりやすく記述
    - フィールドごとにエラー表示を実装

4. **React Native での Controller パターン**
    - TextInput などの非制御コンポーネントは Controller でラップ
    - onChange, onBlur, value を適切にバインド

### 実装上の注意点

1. **@ts-expect-error の使用禁止**: 型エラーは必ず正しく解決すること
2. **ZodSchema は非推奨**: z.ZodType を使用すること
3. **transform の活用**: 空文字を undefined に変換するなど、適切なデータ変換を行う
4. **再利用性**: 共通のバリデーションルールは関数として切り出す

## useModalの使用方法

### 概要

`useModal`は、アプリケーション全体でグローバルにアクセス可能なモーダルシステムを提供するカスタムフックです。
React ContextとProviderパターンを使用して、どのコンポーネントからでも簡単にモーダルを表示できます。

### 基本的な使い方

#### Context の設定

アプリケーションのルートレベルで`ModalProvider`でラップし、`Modal`コンポーネントを配置する必要があります。
（実装済み: `contexts/ModalContext.tsx`）

```typescript
// app/_layout.tsx
import { ModalProvider } from '@/contexts/ModalContext'
import { Modal } from '@/components/ui/Modal'

export default function RootLayout() {
  return (
    <ModalProvider>
      {/* 他のProvider */}
      <ThemeProvider>
        <Stack />
      </ThemeProvider>
      <Modal />
    </ModalProvider>
  )
}
```

#### コンポーネントでの使用

```typescript
import { useModal } from '@/contexts/ModalContext'

const MyComponent = () => {
    const { openModal, closeModal } = useModal()

    const handleError = () => {
        // simpleなモーダル
        openModal({
            title: '検索エラー',
            message: '管理者の検索中にエラーが発生しました',
            type: 'simple',
        })
    }

    const handleConfirm = () => {
        // confirmモーダル
        openModal({
            title: 'ポイントルールを削除しますか？',
            message:
                'この操作は元に戻せません。このポイントルールを削除してもよろしいですか？',
            type: 'confirm',
            onOk: () => {
                closeModal()
                handleDeleteRule(ruleId)
            },
            okText: 'はい',
            cancelText: 'いいえ',
        })
    }

    const handleAlert = () => {
        openModal({
            title: 'エラーが発生しています',
            message: '管理者に確認してください。',
            type: 'error',
        })
    }

    return (
        <View>
            <TouchableOpacity onPress={handleError}>
                <Text>Simple Modal</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleConfirm}>
                <Text>Confirm Modal</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleAlert}>
                <Text>Error Modal</Text>
            </TouchableOpacity>
        </View>
    )
}
```

### モーダルタイプ

#### 1. Simple Modal (`type: 'simple'`)

- 基本的な情報表示用モーダル
- OKボタンのみ
- ボタンを押すとモーダルが閉じる

#### 2. Error Modal (`type: 'error'`)

- エラーメッセージ表示用モーダル
- 赤色のタイトルとボタンでエラーを強調
- OKボタンのみ

#### 3. Confirm Modal (`type: 'confirm'`)

- 確認ダイアログ用モーダル
- OKボタンとキャンセルボタンの2つ
- `onOk`コールバックで確認時の処理を実行

### ModalOptionsの詳細

```typescript
interface ModalOptions {
    title: string // モーダルのタイトル
    message: string // メッセージ本文
    type: ModalType // 'simple' | 'confirm' | 'error'
    onOk?: () => void // OKボタン押下時のコールバック（confirmタイプで使用）
    okText?: string // OKボタンのテキスト（デフォルト: 'OK'）
    cancelText?: string // キャンセルボタンのテキスト（デフォルト: 'キャンセル'）
}
```

## Queryパターンの責務（supabase invokeブリッジ + キャッシュ管理）

### 基本設計

- `/api/`配下の〇〇Queryは supabase.functions.invoke をラップ
- API呼び出しの型安全性・エラーハンドリング・キャッシュ管理を担保
- useQuery/useMutation等を用いてキャッシュ・ローディング・エラー状態を管理
- **UseQueryOptionsを受け取り可能にし、呼び出し側で柔軟なクエリ設定を可能にする**

### 実装例

```typescript
// api/user-member/user-member-query.ts
export const useUserMemberQuery = () => {
    /**
     * メンバー一覧を取得するクエリ
     */
    const getMembersListQuery = <TData = MemberListResponse>(
        shopId: string,
        pagination: PaginationInfo,
        options?: Omit<
            UseQueryOptions<
                MemberListResponse,
                Error,
                TData,
                [typeof userMemberQueryKey.membersList, string, number]
            >,
            'queryKey' | 'queryFn'
        >,
    ) => {
        return useQuery({
            queryKey: [
                userMemberQueryKey.membersList,
                shopId,
                pagination.currentPage,
            ],
            queryFn: async () => {
                const { data, error } = await supabase.functions.invoke(
                    'members-api/list',
                    {
                        body: { shopId, page: pagination.currentPage },
                    },
                )
                if (error) throw error
                return data?.members?.map((m) => new Member(m)) || []
            },
            enabled: !!shopId,
            ...options, // 呼び出し側からのオプションをスプレッド
        })
    }

    /**
     * メンバー詳細を取得するクエリ
     */
    const getMemberDetailQuery = <TData = MemberDetailResponse>(
        memberId: string,
        shopId: string,
        options?: Omit<
            UseQueryOptions<
                MemberDetailResponse,
                Error,
                TData,
                [typeof userMemberQueryKey.memberDetail, string, string]
            >,
            'queryKey' | 'queryFn'
        >,
    ) => {
        return useQuery({
            queryKey: [userMemberQueryKey.memberDetail, memberId, shopId],
            queryFn: async () => {
                const { data, error } = await supabase.functions.invoke(
                    'members-api/detail',
                    {
                        body: { memberId, shopId },
                    },
                )
                if (error) throw error
                return new Member(data.member)
            },
            enabled: !!memberId && !!shopId,
            ...options,
        })
    }

    return { getMembersListQuery, getMemberDetailQuery }
}

// 呼び出し側でのオプション指定例
const { getMembersListQuery } = useUserMemberQuery()
const {
    data: members,
    isLoading,
    error,
} = getMembersListQuery(shopId, pagination, {
    staleTime: 5 * 60 * 1000, // 5分間キャッシュ
    refetchOnWindowFocus: false, // ウィンドウフォーカス時の再取得を無効
    select: (data) => data.members.slice(0, 10), // データ変換
})
```
