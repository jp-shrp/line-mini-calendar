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
 * events テーブルのスキーマを定義します。
 * 主な仕様: イベント情報を管理します
 *
 * @description
 * ユーザーが登録したカレンダーイベントを保存するテーブル
 * スポーツイベント、配信予定などを管理
 */
export const events = pgTable('events', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    title: varchar('title', { length: 100 }).notNull(),
    description: text('description'),
    category: varchar('category', { length: 50 }).notNull().default('other'),
    iconUrl: text('icon_url'),
    startDatetime: timestamp('start_datetime').notNull(),
    endDatetime: timestamp('end_datetime').notNull(),
    color: varchar('color', { length: 7 }),
    isDeleted: boolean('is_deleted').notNull().default(false),
    searchKeywords: text('search_keywords'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export type SelectEvent = InferSelectModel<typeof events>
export type InsertEvent = InferInsertModel<typeof events>
export type UpdateEvent = Partial<InsertEvent>
