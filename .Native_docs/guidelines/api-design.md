# API設計ガイド

## 1. 推奨Middleware設計パターン

### 基本方針

- **try-catchは極力使用しない設計**
- 統一されたエラー形式で返却
- エラーの種類に応じた適切な処理
- グローバルミドルウェアによる共通処理の自動化

### initApi関数とapiHandlerパターン

```typescript
// _shared/middlewares/middleware.ts から提供される機能

/**
 * API初期化関数
 * - グローバルミドルウェアの自動適用
 * - ヘルスチェックエンドポイントの自動追加
 * - CORSとエラーハンドリングの統一設定
 */
export const initApi = <E extends Env = Env>(basePath: string) => {
    const app = new Hono<E>().basePath(basePath)

    // 共通ミドルウェアの適用
    app.use('*', corsMiddleware)
    app.options('*', optionsHandler)
    app.use('*', errorMiddleware) // グローバルエラーキャッチ

    // ヘルスチェックエンドポイント
    app.get('/health', (c) => {
        return c.json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            service: basePath.replace('/', ''),
        })
    })

    return app
}

/**
 * APIハンドラーラッパー
 * - try-catchロジックを内包
 * - 統一されたエラーレスポンス
 * - 詳細なエラーログ出力
 */
export const apiHandler = <T>(handler: (c: Context) => Promise<T>) => {
    return async (c: Context) => {
        try {
            return await handler(c)
        } catch (error: unknown) {
            // エラー処理は内部で統一的に実行
            // Zod, ApiError, HTTPException, その他エラーを自動判別
        }
    }
}

/**
 * バリデーション付きAPIハンドラー
 * - Zodスキーマによる自動バリデーション
 * - バリデーション済みデータの型安全な受け渡し
 * - エラーハンドリングの統一化
 */
export const validatedApiHandler = <T>(
    schema: any,
    handler: (c: Context, validatedData: T) => Promise<Response>,
) => {
    // 内部でバリデーションとエラーハンドリングを実行
}
```

### 実装例（メインエントリポイント）

```typescript
// users-api/index.ts
import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { initApi, apiHandler } from '../_shared/middleware.ts'

// 型拡張 - Honoのコンテキストにユーザー情報を追加
export type Variables = {
    user: any
    supabase: any
}

// サブAPIのインポート
import rewardsApi from './rewards-api.ts'
import membersApi from './members-api.ts'
// ... 他のサブAPI

// 共通初期化関数を使ってAPIアプリケーションを初期化
const app = initApi<{ Variables: Variables }>('/users-api')

// ルート定義
app.get(
    '/',
    apiHandler(async (c) => {
        return c.json({ message: 'Users API is running' })
    }),
)

// サブAPIをルーティング
app.route('/rewards', rewardsApi)
app.route('/members', membersApi)
// ... 他のルーティング

Deno.serve(app.fetch)
```

### 実装例（サブAPI）

```typescript
// users-api/rewards-api.ts
import { authMiddleware, apiHandler } from '../_shared/middleware.ts'
import type { Variables } from './index.ts'
import { Hono } from 'https://jsr.io/@hono/hono/4.7.6/src/index.ts'
import {
    getRewardsForUser,
    getRewardById,
} from '../_shared/services/rewardService.ts'
import { getPaginationInfoFromRequest } from '_shared/paginationUtility'
import type { SelectUser } from '_shared/schemas'

const rewardsApi = new Hono<{ Variables: Variables }>()

/**
 * ユーザー向けリワード一覧取得API
 * ユーザーがアクセス可能なリワード一覧を返却する
 */
rewardsApi.get(
    '/shops/:shopId',
    authMiddleware,
    apiHandler(async (c) => {
        const user = c.get('user') as SelectUser
        const shopId = c.req.param('shopId')
        const pagination = getPaginationInfoFromRequest(c)
        const filter = c.req.query('filter')

        const result = await getRewardsForUser(user?.id, shopId, {
            pagination,
            filter: filter as RewardFilterType,
        })

        return c.json(result)
    }),
)

/**
 * ユーザー向け特典詳細取得API
 * 特定の特典の詳細情報を取得する
 */
rewardsApi.get(
    '/:rewardId',
    authMiddleware,
    apiHandler(async (c) => {
        const rewardId = c.req.param('rewardId')

        // 特典情報を取得
        const rewardData = await getRewardById(rewardId)

        if (!rewardData) {
            return c.json({ error: '特典が見つかりません' }, 404)
        }

        return c.json({ reward: rewardData })
    }),
)

export default rewardsApi
```

## 2. Supabase Edge Functions/API設計原則

### 基本構造

- APIは `supabase/functions/{resource}-api` として実装
- RESTful設計を基本とし、リソース単位でエンドポイントを分割
- サーバー側で認証・バリデーション・エラー処理を徹底
- レスポンスは必ずJSON形式、型定義を厳守
- **ビジネスロジックはサービス層（\_shared/services/）に分離**

### ディレクトリ構造

```
supabase/functions/
├── _shared/
│   ├── types/           # 型定義
│   ├── schemas/         # Zodスキーマ
│   ├── validations/     # バリデーション
│   ├── services/        # ビジネスロジック（単一責任）
│   └── utils/           # ユーティリティ
├── users-api/           # ユーザー関連API
│   ├── index.ts         # ルート定義（メインエンドポイント）
│   ├── medias-api.ts    # メディア関連API
│   └── posts-api.ts     # 記事関連API
├── shops-api/           # ショップ関連API
│   ├── index.ts         # ルート定義
│   ├── members-api.ts   # メンバー関連API
│   └── points-api.ts    # ポイント関連API
└── notifications-api/   # 通知管理API（独立）
    └── index.ts
```

### APIエンドポイント設計

メインAPIとサブAPIに分けて実装することで、責務を明確に分離します。

#### メインAPI（index.ts）のルーティング例

```
GET    /users-api/                    # APIヘルスチェック
GET    /users-api/health              # ヘルスチェック（自動生成）

# サブAPIへのルーティング
/users-api/rewards/*                  # rewards-api.tsへ委譲
/users-api/members/*                  # members-api.tsへ委譲
/users-api/points/*                   # points-api.tsへ委譲
```

#### サブAPIのエンドポイント例（rewards-api.ts）

```
GET    /users-api/rewards/shops/:shopId    # ショップのリワード一覧
GET    /users-api/rewards/:rewardId        # リワード詳細
POST   /users-api/rewards/:rewardId/claim  # リワード交換
```

## 3. サービス層（\_shared/services/）の設計

### 単一責任の原則

- 1つのサービスクラスは1つのビジネスドメインのみを担当
- データベースアクセス・トランザクション管理・ビジネスルールを担当
- API間で共通利用できるサービス関数を提供

### 実装例

```typescript
// 良い例: 各ドメインごとにサービスを分割
// _shared/services/UserService.ts
export class UserService {
    async getUserProfile(userId: string) {
        const user = await db.select().from(users).where(eq(users.id, userId))
        return user[0]
    }

    async updateUserProfile(userId: string, data: UpdateUserData) {
        return await db
            .update(users)
            .set(data)
            .where(eq(users.id, userId))
            .returning()
    }
}

// _shared/services/PointService.ts
export class PointService {
    async addPoints(userId: string, points: number) {
        return await db.transaction(async (tx) => {
            // ポイント追加ロジック
        })
    }

    async getPointBalance(userId: string) {
        // ポイント残高取得ロジック
    }
}

// 悪い例: 複数のドメインを扱うサービス
class UserAndPointService {
    async getUserProfile() {
        /* ユーザー管理 */
    }
    async addPoints() {
        /* ポイント管理 */
    }
    async sendNotification() {
        /* 通知管理 */
    }
}
```

## 4. エンドポイント命名規則・resource分離

### 単一責任の原則

- 1つのエンドポイントファイルは1つのリソース管理のみを担当
- リソース名は複数形、単語区切りはハイフン（-）
- パスパラメータは :paramName 形式
- **エンドポイントファイルはルーティング・認証・レスポンス処理のみを担当**
- **具体的な処理は対応するサービス層に委譲**

### 実装パターン

サンプルコードの実装例（セクション1）を参照してください。重要なポイント：

- **メインAPI（index.ts）**: ルーティングの集約とサブAPIへの委譲
- **サブAPI（\*-api.ts）**: 各リソースの具体的なエンドポイント実装
- **サービス層の活用**: ビジネスロジックはサービス層に委譲
- **エラーハンドリング**: apiHandlerでtry-catchを内包

## 5. レスポンス形式・型定義

### 成功レスポンスの統一形式

APIの成功レスポンスは `SuccessResponse` クラスを使用して統一します。

```typescript
// _shared/types/responses.ts
export class SuccessResponse<T = unknown> {
    constructor(options: { data: T; message?: string })
}

// 使用例（apiHandler内で自動的にJSONレスポンスに変換）
return new SuccessResponse({
    data: users,
    message: 'ユーザー一覧を取得しました', // デフォルト: 'success'
})

// 実際のレスポンスJSON
{
    "success": true,
    "data": [...],
    "message": "ユーザー一覧を取得しました"
}
```

### apiHandlerでの自動変換

`apiHandler` と `validatedApiHandler` は `SuccessResponse` インスタンスを自動的にJSONレスポンスに変換します：

```typescript
// apiHandlerの使用例
usersApi.get(
    '/users',
    apiHandler(async () => {
        const users = await getAllUsers()
        // SuccessResponseを返すだけで、自動的にJSONレスポンスに変換される
        return new SuccessResponse({
            data: users,
            message: 'ユーザー一覧を取得しました',
        })
    }),
)

// validatedApiHandlerの使用例
usersApi.post(
    '/users',
    validatedApiHandler(createUserSchema, async (_c, validatedData) => {
        const user = await createUser(validatedData)
        return new SuccessResponse({
            data: user,
            message: 'ユーザーを作成しました',
        })
    }),
)
```

### 型定義の管理（Schema Firstアプローチ）

- **Schema First**: リソース系の型は`_shared/schemas/*`のDrizzle ORMスキーマから生成
- レスポンスは必ずJSON、プロパティはスネークケース
- Edge FunctionsとClient両方で使用する型は `_shared/types/{api-name}-types.ts` で一元管理
    - 例: `_shared/types/users-api-types.ts`
    - importパスは`_shared/`で始まる（tsconfig.jsonのaliasを使用）
    - これにより型の重複を防ぎ、Edge Functions側でも同じ型定義を利用可能
- クライアント専用の型は `api/{resource}/types/` 配下に配置
- Drizzle ORMスキーマから型を生成し、API固有の型はそれを拡張

```typescript
// _shared/schemas/users.ts (Drizzle ORMスキーマ)
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
export type UpdateUser = Partial<InsertUser>

// _shared/types/users-api-types.ts (Schema Firstで型を生成)
import type { InsertUser, SelectUser, UpdateUser } from '_shared/schemas/users'

// Schemaから生成された型を再エクスポート
export type User = SelectUser

// API固有の入力型定義（Schemaの型をベースに拡張）
export type CreateUserInput = Omit<InsertUser, 'id' | 'createdAt' | 'updatedAt'>
export type UpdateUserInput = UpdateUser
```

## 6. その他の実装パターン

### データベース接続（Drizzle ORM）

```typescript
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

const connectionString = Deno.env.get('DATABASE_URL')!
const client = postgres(connectionString)
export const db = drizzle(client)

// 使用例
import { users } from '_shared/schemas/users'

const allUsers = await db.select().from(users)
const newUser = await db
    .insert(users)
    .values({
        email: 'test@example.com',
        name: 'Test User',
    })
    .returning()
```

### 認証ミドルウェア（authMiddleware）

```typescript
// Supabase認証の検証
import { createClient } from 'supabase'

export const authMiddleware = async (c: Context, next: Next) => {
    const token = c.req.header('Authorization')?.replace('Bearer ', '')

    if (!token) {
        return c.json({ error: 'Unauthorized' }, 401)
    }

    const supabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const {
        data: { user },
        error,
    } = await supabase.auth.getUser(token)

    if (error || !user) {
        return c.json({ error: 'Invalid token' }, 401)
    }

    c.set('user', user)
    await next()
}
```

### レート制限ミドルウェア

```typescript
const rateLimitMap = new Map()

export const rateLimit = (limit = 100, window = 60000) => {
    return async (c: Context, next: Next) => {
        const ip = c.req.header('x-forwarded-for') || 'unknown'
        const now = Date.now()
        const userLimit = rateLimitMap.get(ip) || {
            count: 0,
            resetTime: now + window,
        }

        if (now > userLimit.resetTime) {
            userLimit.count = 0
            userLimit.resetTime = now + window
        }

        if (userLimit.count >= limit) {
            return c.json({ error: 'Too many requests' }, 429)
        }

        userLimit.count++
        rateLimitMap.set(ip, userLimit)
        await next()
    }
}

// 使用
app.use('/api/*', rateLimit(100, 60000)) // 100 requests per minute
```

## 7. 🚨 **MUST**: \_shared ディレクトリ管理ルール

### 重要な原則

**\_shared ディレクトリに新しいファイルを追加した場合は、必ず以下の2つのファイルを更新する必要があります：**

1. **`supabase/functions/import_map.json`** - Supabase Functions内での import パス解決用
2. **`deno.json`** - プロジェクトルートでの Deno 実行時の import パス解決用

### 更新手順

#### 新しいファイルを追加した場合

```json
// supabase/functions/import_map.json
{
    "imports": {
        // 既存のインポート...
        "_shared/validations/newValidation": "./_shared/validations/newValidation.ts",
        // 追加したファイルのパスを記載
    }
}

// deno.json
{
    "imports": {
        // 既存のインポート...
        "_shared/validations/newValidation": "./supabase/functions/_shared/validations/newValidation.ts",
        // プロジェクトルートからの相対パスで記載
    }
}
```

### 更新が必要なケース

- ✅ 新しいバリデーションスキーマファイルを追加した場合
- ✅ 新しいサービスファイルを追加した場合
- ✅ 新しい型定義ファイルを追加した場合
- ✅ 新しいミドルウェアファイルを追加した場合
- ✅ 新しいユーティリティファイルを追加した場合

### 注意事項

- **忘れると Edge Functions でインポートエラーが発生します**
- **両方のファイルを同時に更新することが重要です**
- **パスの記載方法が異なることに注意してください**
    - `import_map.json`: `./_shared/...` （相対パス）
    - `deno.json`: `./supabase/functions/_shared/...` （プロジェクトルートからの相対パス）
