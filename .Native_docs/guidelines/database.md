# データベース設計とマイグレーション

## 1. データベースマイグレーションの流れ

### 基本的なマイグレーション作成手順

1. **スキーマの定義**
    - `_shared/schemas`ディレクトリにスキーマファイルを作成または編集
    - Drizzle ORMのスキーマ定義を使用

2. **マイグレーションファイルの生成**

    ```bash
    yarn make:migration {migration_name}
    ```

    - `migration_name`は分かりやすい名前を付ける（例: add_users_table, update_posts_schema）
    - このコマンドでDrizzleが自動的にSQLマイグレーションファイルを生成

3. **カスタムマイグレーション（SQL直接記述）**

    ```bash
    yarn make:migration:custom {migration_name}
    ```

    - 空のマイグレーションファイルを作成
    - 複雑な変更や手動でSQLを書く必要がある場合に使用

4. **マイグレーションの実行**

    ```bash
    yarn db:migrate
    ```

    - 未適用のマイグレーションを自動的に適用
    - データベースの状態を最新に更新

### マイグレーションのベストプラクティス

- **スキーマファースト**: 常にスキーマ定義を更新してからマイグレーションを生成
- **命名規則**: マイグレーション名は「動作*対象*詳細」の形式を推奨（例: add_users_table, update_posts_add_status）
- **レビュー必須**: 生成されたSQLファイルを必ず確認してから実行
- **バックアップ**: 本番環境では必ずバックアップを取ってから実行

## 2. シードデータの流れ

### シードファイルの作成と実行

1. **個別シードファイルの作成**
    - `./db/seeds/`ディレクトリに新しいシードファイルを作成
    - `./db/seeds/users.ts`を参考にして実装
    - 各シードファイルは独立して実行可能なように設計

2. **シードファイルの登録**
    - `./db/seeds/seed.ts`にインポートと実行を追加
    - 実行順序に注意（依存関係がある場合は順番を考慮）

3. **全体シードの実行**

    ```bash
    yarn db:seed
    ```

    - 登録された全てのシードファイルを順番に実行
    - 開発環境のリセット時に便利

4. **個別シードの実行**

    ```bash
    yarn db:seed ./db/seeds/users.ts
    ```

    - 特定のシードファイルのみを実行
    - 部分的なデータ更新に便利

### シードデータのベストプラクティス

- **冪等性の確保**: 複数回実行しても同じ結果になるように設計
- **トランザクション使用**: データの整合性を保つためトランザクションを使用
- **環境変数活用**: 環境に応じたシードデータの切り替え
- **クリーンアップ機能**: 既存データの削除オプションを提供

### シードファイルの構造例

```typescript
// db/seeds/users.ts
import { db } from '../db'
import { users } from '../_shared/schemas/users'

export const seedUsers = async () => {
    await db.transaction(async (tx) => {
        // 既存データのクリーンアップ（オプション）
        await tx.delete(users)

        // シードデータの挿入
        await tx.insert(users).values([
            {
                email: 'admin@example.com',
                name: 'Admin User',
                role: 'admin',
            },
            {
                email: 'user@example.com',
                name: 'Test User',
                role: 'user',
            },
        ])
    })

    console.log('✅ Users seeded successfully')
}
```

## 3. Drizzle ORM スキーマ定義

### 基本的なスキーマ定義

```typescript
// _shared/schemas/users.ts
import { pgTable, uuid, text, timestamp, boolean } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
    id: uuid('id').defaultRandom().primaryKey(),
    email: text('email').notNull().unique(),
    name: text('name').notNull(),
    role: text('role').notNull().default('user'),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// TypeScript型の自動生成
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
```

### リレーション定義

```typescript
// _shared/schemas/posts.ts
import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core'
import { users } from './users'

export const posts = pgTable('posts', {
    id: uuid('id').defaultRandom().primaryKey(),
    title: text('title').notNull(),
    content: text('content').notNull(),
    authorId: uuid('author_id')
        .notNull()
        .references(() => users.id),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// リレーション定義
export const postsRelations = relations(posts, ({ one }) => ({
    author: one(users, {
        fields: [posts.authorId],
        references: [users.id],
    }),
}))
```

### インデックスと制約

```typescript
// _shared/schemas/products.ts
import {
    pgTable,
    uuid,
    text,
    decimal,
    index,
    unique,
} from 'drizzle-orm/pg-core'

export const products = pgTable(
    'products',
    {
        id: uuid('id').defaultRandom().primaryKey(),
        sku: text('sku').notNull(),
        name: text('name').notNull(),
        price: decimal('price', { precision: 10, scale: 2 }).notNull(),
        category: text('category').notNull(),
    },
    (table) => {
        return {
            // インデックス
            categoryIdx: index('category_idx').on(table.category),
            priceIdx: index('price_idx').on(table.price),

            // 複合ユニーク制約
            uniqueSkuCategory: unique('unique_sku_category').on(
                table.sku,
                table.category,
            ),
        }
    },
)
```

## 4. データベースクエリパターン

### 基本的なCRUD操作

```typescript
// _shared/types/users-api/users.ts
export interface UserFilters {
    search?: string
    role?: string
    isActive?: boolean
    createdFrom?: Date
    createdTo?: Date
}

export interface PaginationOptions {
    page?: number
    limit?: number
    sortBy?: 'createdAt' | 'updatedAt' | 'name'
    sortOrder?: 'asc' | 'desc'
}

// _shared/services/UserService.ts
import { db } from '@/db/db'
import { users } from '@/db/schemas/users'
import { eq, desc, like } from 'drizzle-orm'
import type { UserFilters, PaginationOptions } from '@/types/users-api/users'
import type { NewUser, User } from '@/schemas/users'

export class UserService {
    // CREATE
    async createUser(data: NewUser) {
        const [user] = await db.insert(users).values(data).returning()
        return user
    }

    // READ (単一)
    async getUserById(id: string) {
        const [user] = await db.select().from(users).where(eq(users.id, id))
        return user
    }

    // READ (複数) - 型定義を使用
    async getUsers(filters?: UserFilters, pagination?: PaginationOptions) {
        let query = db.select().from(users)

        // フィルタリング
        if (filters?.search) {
            query = query.where(like(users.name, `%${filters.search}%`))
        }

        if (filters?.role) {
            query = query.where(eq(users.role, filters.role))
        }

        if (filters?.isActive !== undefined) {
            query = query.where(eq(users.isActive, filters.isActive))
        }

        // ソート
        const sortColumn = pagination?.sortBy || 'createdAt'
        const sortOrder = pagination?.sortOrder || 'desc'
        query = query.orderBy(
            sortOrder === 'desc'
                ? desc(users[sortColumn])
                : asc(users[sortColumn]),
        )

        // ページネーション
        if (pagination?.limit) {
            query = query.limit(pagination.limit)
            if (pagination.page) {
                query = query.offset((pagination.page - 1) * pagination.limit)
            }
        }

        return query
    }

    // UPDATE
    async updateUser(id: string, data: Partial<User>) {
        const [updated] = await db
            .update(users)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(users.id, id))
            .returning()
        return updated
    }

    // DELETE
    async deleteUser(id: string) {
        await db.delete(users).where(eq(users.id, id))
    }
}
```

### トランザクション処理

```typescript
// _shared/types/orders-api/orders.ts
export interface CreateOrderRequest {
    orderData: NewOrder
    items: NewOrderItem[]
}

// _shared/services/OrderService.ts
import type { CreateOrderRequest } from '@/types/orders-api/orders'

export class OrderService {
    async createOrderWithItems({ orderData, items }: CreateOrderRequest) {
        return await db.transaction(async (tx) => {
            // 1. 注文を作成
            const [order] = await tx
                .insert(orders)
                .values(orderData)
                .returning()

            // 2. 注文アイテムを作成
            const orderItems = items.map((item) => ({
                ...item,
                orderId: order.id,
            }))
            await tx.insert(orderItems).values(orderItems)

            // 3. 在庫を更新
            for (const item of items) {
                await tx
                    .update(products)
                    .set({
                        stock: sql`stock - ${item.quantity}`,
                    })
                    .where(eq(products.id, item.productId))
            }

            return order
        })
    }
}
```

### JOINを使った複雑なクエリ

```typescript
// _shared/services/PostService.ts
import { db } from '@/db/db'
import { posts, users, comments } from '@/db/schemas'
import { eq, desc, sql } from 'drizzle-orm'

export class PostService {
    async getPostsWithAuthors() {
        return await db
            .select({
                id: posts.id,
                title: posts.title,
                content: posts.content,
                createdAt: posts.createdAt,
                author: {
                    id: users.id,
                    name: users.name,
                    email: users.email,
                },
            })
            .from(posts)
            .leftJoin(users, eq(posts.authorId, users.id))
            .orderBy(desc(posts.createdAt))
    }

    async getPostWithCommentCount(postId: string) {
        const result = await db
            .select({
                post: posts,
                author: users,
                commentCount: sql<number>`count(${comments.id})`,
            })
            .from(posts)
            .leftJoin(users, eq(posts.authorId, users.id))
            .leftJoin(comments, eq(comments.postId, posts.id))
            .where(eq(posts.id, postId))
            .groupBy(posts.id, users.id)

        return result[0]
    }
}
```

### 集計クエリ

```typescript
// _shared/types/analytics-api/analytics.ts
export interface UserStatistics {
    totalUsers: number
    activeUsers: number
    avgPostsPerUser: number
}

export interface MonthlySignup {
    month: string
    count: number
}

// _shared/services/AnalyticsService.ts
import type {
    UserStatistics,
    MonthlySignup,
} from '@/types/analytics-api/analytics'

export class AnalyticsService {
    async getUserStatistics(): Promise<UserStatistics> {
        const stats = await db
            .select({
                totalUsers: sql<number>`count(*)`,
                activeUsers: sql<number>`count(*) filter (where ${users.isActive} = true)`,
                avgPostsPerUser: sql<number>`avg((
          select count(*) from ${posts} 
          where ${posts.authorId} = ${users.id}
        ))`,
            })
            .from(users)

        return stats[0]
    }

    async getMonthlySignups(): Promise<MonthlySignup[]> {
        return await db
            .select({
                month: sql<string>`to_char(${users.createdAt}, 'YYYY-MM')`,
                count: sql<number>`count(*)`,
            })
            .from(users)
            .groupBy(sql`to_char(${users.createdAt}, 'YYYY-MM')`)
            .orderBy(sql`to_char(${users.createdAt}, 'YYYY-MM') desc`)
    }
}
```

## 5. データベース設計のベストプラクティス

### 命名規則

- **テーブル名**: 複数形、snake_case（例: users, order_items）
- **カラム名**: snake_case（例: created_at, is_active）
- **外部キー**: {テーブル名単数形}\_id（例: user_id, product_id）

### インデックス設計

- 頻繁に検索される外部キーには必ずインデックスを作成
- 複合インデックスはクエリパターンに合わせて設計
- ユニーク制約が必要な場合はユニークインデックスを使用

### パフォーマンス最適化

- N+1問題を避けるためJOINを適切に使用
- 大量データの場合はページネーションを実装
- 集計処理は可能な限りデータベース側で実行

### セキュリティ

- SQLインジェクション対策としてパラメータ化クエリを使用
- 機密データは暗号化して保存
- アクセス権限を適切に設定

## 6. マイグレーション戦略

### 重要な制約事項

**Drizzle x Supabaseではdownマイグレーション（ロールバック）機能が提供されていません。**
そのため、前進のみの戦略（Forward-only migration）を採用します。

### 開発環境

```bash
# スキーマ変更後、マイグレーション生成
yarn make:migration add_new_feature

# マイグレーション適用
yarn db:migrate

# データリセット（開発環境のみ）
# ※ 現在未実装。必要に応じてpackage.jsonにスクリプト追加
```

### ステージング/本番環境

#### 事前準備（必須）

```bash
# 1. 必ずバックアップを作成
# ※ Supabaseダッシュボードまたはpg_dumpを使用してバックアップ

# 2. マイグレーションSQLを事前確認
cat ./db/migrations/XXXX_add_new_feature.sql

# 3. ステージング環境でテスト実施
```

#### マイグレーション実行

```bash
# マイグレーション適用（一方向のみ）
yarn db:migrate
```

### ロールバック戦略（Drizzle x Supabase対応版）

downマイグレーションが使用できないため、以下の戦略を採用：

#### 1. 補償トランザクション方式

問題が発生した場合、逆の操作を行う新しいマイグレーションを作成して適用

```bash
# 例: カラム追加でエラーが発生した場合
yarn make:migration:custom fix_remove_problematic_column
# 手動でDROP COLUMN文を記述
yarn db:migrate
```

#### 2. 段階的マイグレーション

リスクの高い変更は複数ステップに分割：

```typescript
// Step 1: 新カラムを追加（NULL許可）
ALTER TABLE users ADD COLUMN new_field TEXT;

// Step 2: データ移行（別マイグレーション）
UPDATE users SET new_field = old_field;

// Step 3: 制約追加（さらに別マイグレーション）
ALTER TABLE users ALTER COLUMN new_field SET NOT NULL;

// Step 4: 古いカラム削除（十分な検証後）
ALTER TABLE users DROP COLUMN old_field;
```

#### 3. バックアップからの復旧

最終手段として、問題発生前のバックアップから復旧

```bash
# Supabaseダッシュボードまたはpg_dumpを使用
pg_restore -d database_url backup_file.sql
```

### ベストプラクティス

1. **破壊的変更の回避**
    - DROP TABLE/COLUMNは極力避ける
    - 代わりに非推奨化→新規追加→移行→削除の順で実施

2. **マイグレーションの粒度**
    - 1つのマイグレーションは1つの変更に限定
    - 複雑な変更は複数のマイグレーションに分割

3. **テスト環境での検証**
    - 本番適用前に必ずステージング環境で検証
    - データ量が多い場合のパフォーマンスも確認

4. **マイグレーション履歴の記録**
    - 各マイグレーションの目的と影響をコメントで記載
    - 実行日時と実行者を記録
