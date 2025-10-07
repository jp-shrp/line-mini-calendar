# APIとバックエンドのパターン

## Supabase Edge Functions構造

```
supabase/functions/
├── _shared/              # 共有コード
│   ├── types/           # 型定義（クライアントと共有）
│   ├── schemas/         # Drizzle ORMスキーマ（Single Source of Truth）
│   ├── validations/     # Zodバリデーション
│   ├── services/        # ビジネスロジック層
│   ├── middlewares/     # ミドルウェア
│   └── utils/           # ユーティリティ
├── {resource}-api/      # リソースごとのAPI
│   ├── index.ts         # メインエントリポイント
│   └── {sub}-api.ts     # サブAPI
```

## API設計原則（MUST）

### initApiとapiHandlerパターン

```typescript
// メインエントリポイント
import { initApi, apiHandler } from '../_shared/middleware.ts'

const app = initApi('/users-api')

app.get('/', apiHandler(async (c) => {
    return c.json({ message: 'API running' })
}))

Deno.serve(app.fetch)
```

### 特徴
- try-catchは極力使用しない
- グローバルミドルウェアで自動エラーハンドリング
- 統一されたエラー形式
- ヘルスチェックエンドポイント自動追加

## Schema First アプローチ（MUST）

### 1. Drizzle ORMでスキーマ定義
```typescript
// _shared/schemas/users.ts
export const users = pgTable('users', {
    id: uuid('id').primaryKey().defaultRandom(),
    email: varchar('email', { length: 255 }).unique().notNull(),
})

export type SelectUser = InferSelectModel<typeof users>
export type InsertUser = InferInsertModel<typeof users>
```

### 2. Zodバリデーション定義
```typescript
// _shared/validations/createUserValidation.ts
export const createUserSchema = z.object({
    email: z.string().email('有効なメールアドレスを入力してください'),
})

export type CreateUserFormData = z.infer<typeof createUserSchema>
```

### 3. API型定義
```typescript
// _shared/types/users-api-types.ts
import type { SelectUser } from '_shared/schemas/users'

export type User = SelectUser
export type CreateUserInput = Omit<InsertUser, 'id' | 'createdAt'>
```

## サービス層設計（MUST）

- 1つのサービスクラスは1つのビジネスドメインのみを担当
- データベースアクセス・トランザクション管理を担当

```typescript
// _shared/services/UserService.ts
export class UserService {
    async getUserProfile(userId: string) {
        return await db.select().from(users).where(eq(users.id, userId))
    }
}
```

## レスポンス形式の統一（MUST）

```typescript
// 成功レスポンス
return new SuccessResponse({
    data: users,
    message: 'ユーザー一覧を取得しました'
})

// 実際のJSON
{
    "success": true,
    "data": [...],
    "message": "..."
}
```

## _sharedディレクトリ管理ルール（MUST）

新しいファイルを追加した場合、以下を必ず更新:

1. `supabase/functions/import_map.json`
2. `deno.json`

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