# データベース設計とマイグレーション

## 1. データベースマイグレーションの流れ

### 基本的なマイグレーション作成手順

1. **スキーマの定義**
    - `supabase/functions/_shared/schemas`ディレクトリにスキーマファイルを作成または編集
    - Drizzle ORMのスキーマ定義を使用

2. **マイグレーションファイルの生成**

    ```bash
    # マイグレーション生成コマンド（要設定）
    npm run db:generate {migration_name}
    ```

    - `migration_name`は分かりやすい名前を付ける（例: add_users_table, update_posts_schema）
    - このコマンドでDrizzleが自動的にSQLマイグレーションファイルを生成

3. **マイグレーションの実行**

    ```bash
    npm run db:migrate
    ```

    - 未適用のマイグレーションを自動的に適用
    - データベースの状態を最新に更新

### マイグレーションのベストプラクティス

- **スキーマファースト**: 常にスキーマ定義を更新してからマイグレーションを生成
- **命名規則**: マイグレーション名は「動作*対象*詳細」の形式を推奨（例: add_users_table, update_posts_add_status）
- **レビュー必須**: 生成されたSQLファイルを必ず確認してから実行
- **バックアップ**: 本番環境では必ずバックアップを取ってから実行

## 2. Drizzle ORM スキーマ定義

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
import { relations } from 'drizzle-orm'
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
                table.category
            ),
        }
    }
)
```

## 3. データベースクエリパターン

### 基本的なCRUD操作

```typescript
// lib/database/userService.ts
import { db } from '@/lib/db'
import { users } from '@/schemas/users'
import { eq, desc, like } from 'drizzle-orm'

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

    // READ (複数)
    async getUsers(filters?: UserFilters) {
        let query = db.select().from(users)

        if (filters?.search) {
            query = query.where(like(users.name, `%${filters.search}%`))
        }

        return query.orderBy(desc(users.createdAt))
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
}
```

## 4. データベース設計のベストプラクティス

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

## 5. マイグレーション戦略

### 開発環境

```bash
# スキーマ変更後、マイグレーション生成
npm run db:generate add_new_feature

# マイグレーション適用
npm run db:migrate

# データリセット（開発環境のみ）
npm run db:reset
```

### 本番環境

#### 事前準備（必須）

```bash
# 1. 必ずバックアップを作成
# Supabaseダッシュボードまたはpg_dumpを使用

# 2. マイグレーションSQLを事前確認
cat ./migrations/XXXX_add_new_feature.sql

# 3. ステージング環境でテスト実施
```

#### マイグレーション実行

```bash
# マイグレーション適用
npm run db:migrate
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
