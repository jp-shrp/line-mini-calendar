import { type InferInsertModel, type InferSelectModel } from 'drizzle-orm'
import { pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'

/**
 * users テーブルのスキーマを定義します。
 * 主な仕様: ユーザー情報を管理します
 *
 * @description
 * LINEミニカレンダーのユーザー情報を管理するテーブル
 * Email/Password認証とLINE認証の両方に対応
 */
export const users = pgTable('users', {
    id: uuid('id').primaryKey().defaultRandom(),
    lineUserId: varchar('line_user_id', { length: 255 }).unique(),
    displayName: varchar('display_name', { length: 100 }),
    profileImage: text('profile_image'),
    email: varchar('email', { length: 255 }).unique(),
    auth0Id: text('auth0_id').unique(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export type SelectUser = InferSelectModel<typeof users>
export type InsertUser = InferInsertModel<typeof users>
export type UpdateUser = Partial<InsertUser>
