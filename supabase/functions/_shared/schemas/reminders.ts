import { type InferInsertModel, type InferSelectModel } from 'drizzle-orm'
import { boolean, pgTable, timestamp, uuid } from 'drizzle-orm/pg-core'
import { events } from '_shared/schemas/events'

/**
 * reminders テーブルのスキーマを定義します。
 * 主な仕様: イベントのリマインダー通知を管理します
 *
 * @description
 * イベント開始前の通知を管理するテーブル
 * 通知タイミングと送信状態を記録
 */
export const reminders = pgTable('reminders', {
    id: uuid('id').primaryKey().defaultRandom(),
    eventId: uuid('event_id')
        .notNull()
        .references(() => events.id, { onDelete: 'cascade' }),
    remindAt: timestamp('remind_at').notNull(),
    isSent: boolean('is_sent').notNull().default(false),
    createdAt: timestamp('created_at').defaultNow().notNull(),
})

export type SelectReminder = InferSelectModel<typeof reminders>
export type InsertReminder = InferInsertModel<typeof reminders>
export type UpdateReminder = Partial<InsertReminder>
