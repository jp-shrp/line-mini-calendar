import { type InferInsertModel, type InferSelectModel } from 'drizzle-orm'
import {
    boolean,
    pgTable,
    text,
    timestamp,
    uuid,
    varchar,
} from 'drizzle-orm/pg-core'
import { users } from '_shared/schemas/users'

/**
 * categories テーブルのスキーマを定義します。
 * 主な仕様: イベントカテゴリを管理します
 *
 * @description
 * イベントのカテゴリ情報を管理するテーブル
 * システムデフォルトカテゴリとユーザーカスタムカテゴリの両方をサポート
 */
export const categories = pgTable('categories', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 50 }).notNull(),
    color: varchar('color', { length: 7 }).notNull(),
    icon: text('icon'),
    isSystemDefault: boolean('is_system_default').notNull().default(false),
    createdAt: timestamp('created_at').defaultNow().notNull(),
})

export type SelectCategory = InferSelectModel<typeof categories>
export type InsertCategory = InferInsertModel<typeof categories>
export type UpdateCategory = Partial<InsertCategory>
