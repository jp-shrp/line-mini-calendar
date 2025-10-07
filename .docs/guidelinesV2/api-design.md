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
    handler: (c: Context, validatedData: T) => Promise<Response>
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

// 共通初期化関数を使ってAPIアプリケーションを初期化
const app = initApi<{ Variables: Variables }>('/users-api')

// ルート定義
app.get(
    '/',
    apiHandler(async (c) => {
        return c.json({ message: 'Users API is running' })
    })
)

// サブAPIをルーティング
app.route('/rewards', rewardsApi)
app.route('/members', membersApi)

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
    })
)

/**
 * ユーザー向け特典詳細取得API
 */
rewardsApi.get(
    '/:rewardId',
    authMiddleware,
    apiHandler(async (c) => {
        const rewardId = c.req.param('rewardId')

        const rewardData = await getRewardById(rewardId)

        if (!rewardData) {
            return c.json({ error: '特典が見つかりません' }, 404)
        }

        return c.json({ reward: rewardData })
    })
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
│   ├── profile-api.ts   # プロフィール関連API
│   └── settings-api.ts  # 設定関連API
├── products-api/        # 商品関連API
│   ├── index.ts         # ルート定義
│   ├── list-api.ts      # 一覧関連API
│   └── detail-api.ts    # 詳細関連API
└── notifications-api/   # 通知管理API（独立）
    └── index.ts
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

// _shared/services/ProductService.ts
export class ProductService {
    async getProducts(filters?: ProductFilters) {
        // 商品取得ロジック
    }

    async getProductById(id: string) {
        // 商品詳細取得ロジック
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

## 5. レスポンス形式・型定義

### 成功レスポンスの統一形式

APIの成功レスポンスは `SuccessResponse` クラスを使用して統一します。

```typescript
// _shared/types/responses.ts
export class SuccessResponse<T = unknown> {
    constructor(options: { data: T; message?: string })
}

// 使用例
return new SuccessResponse({
    data: users,
    message: 'ユーザー一覧を取得しました',
})

// 実際のレスポンスJSON
{
    "success": true,
    "data": [...],
    "message": "ユーザー一覧を取得しました"
}
```

### 型定義の管理（Schema Firstアプローチ）

- **Schema First**: リソース系の型は`_shared/schemas/*`のDrizzle ORMスキーマから生成
- レスポンスは必ずJSON、プロパティはスネークケース
- Edge FunctionsとClient両方で使用する型は `_shared/types/{api-name}-types.ts` で一元管理
- importパスは`_shared/`で始まる（設定のaliasを使用）

```typescript
// _shared/schemas/users.ts (Drizzle ORMスキーマ)
export const users = pgTable('users', {
    id: uuid('id').primaryKey().defaultRandom(),
    email: varchar('email', { length: 255 }).unique().notNull(),
    name: varchar('name', { length: 100 }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export type SelectUser = InferSelectModel<typeof users>
export type InsertUser = InferInsertModel<typeof users>
```

## 6. Next.js API Routes

### 基本構造

```typescript
// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
    try {
        const users = await fetchUsers()
        return NextResponse.json({ users })
    } catch (error) {
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const user = await createUser(body)
        return NextResponse.json({ user })
    } catch (error) {
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        )
    }
}
```

### 動的ルート

```typescript
// app/api/users/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const user = await fetchUserById(params.id)
    return NextResponse.json({ user })
}
```

## 7. 🚨 **MUST**: \_shared ディレクトリ管理ルール

### 重要な原則

**\_shared ディレクトリに新しいファイルを追加した場合は、必ず以下のファイルを更新する必要があります：**

1. **`supabase/functions/import_map.json`** - Supabase Functions内での import パス解決用
2. **`deno.json`** - プロジェクトルートでの Deno 実行時の import パス解決用

### 更新手順

```json
// supabase/functions/import_map.json
{
    "imports": {
        "_shared/validations/newValidation": "./_shared/validations/newValidation.ts"
    }
}

// deno.json
{
    "imports": {
        "_shared/validations/newValidation": "./supabase/functions/_shared/validations/newValidation.ts"
    }
}
```
