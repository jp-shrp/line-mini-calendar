/**
 * LINE イベント候補セッション スキーマ
 *
 * @description
 * LINE経由でAI生成したイベント候補を一時保存するためのセッション管理テーブル
 */

import { type InferInsertModel, type InferSelectModel } from 'drizzle-orm'
import {
    index,
    jsonb,
    pgTable,
    text,
    timestamp,
    uuid,
} from 'drizzle-orm/pg-core'
import { users } from '_shared/schemas/users'

/**
 * LINE イベント候補セッション テーブル
 */
export const lineEventCandidateSessions = pgTable(
    'line_event_candidate_sessions',
    {
        id: uuid('id').primaryKey().defaultRandom(),
        sessionId: text('session_id').notNull().unique(),
        userId: uuid('user_id')
            .notNull()
            .references(() => users.id, { onDelete: 'cascade' }),
        lineUserId: text('line_user_id').notNull(),
        query: text('query').notNull(),
        aiMessage: text('ai_message'),
        candidates: jsonb('candidates').notNull(),
        createdAt: timestamp('created_at', { withTimezone: true })
            .defaultNow()
            .notNull(),
        expiresAt: timestamp('expires_at', { withTimezone: true })
            .notNull()
            .$defaultFn(() => {
                const date = new Date()
                date.setHours(date.getHours() + 24)
                return date
            }),
    },
    (table) => ({
        sessionIdIdx: index('idx_line_event_candidate_sessions_session_id').on(
            table.sessionId
        ),
        lineUserIdIdx: index(
            'idx_line_event_candidate_sessions_line_user_id'
        ).on(table.lineUserId),
        expiresAtIdx: index('idx_line_event_candidate_sessions_expires_at').on(
            table.expiresAt
        ),
        userIdIdx: index('idx_line_event_candidate_sessions_user_id').on(
            table.userId
        ),
    })
)

// 型定義
export type SelectLineEventCandidateSession = InferSelectModel<
    typeof lineEventCandidateSessions
>
export type InsertLineEventCandidateSession = InferInsertModel<
    typeof lineEventCandidateSessions
>
