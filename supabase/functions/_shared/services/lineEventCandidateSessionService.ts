/**
 * LINE イベント候補セッション管理サービス
 *
 * @description
 * セッションのCRUD操作を提供するサービス
 */

import { db } from 'db'
import { eq } from 'imports'
import type { PostgresJsDatabase } from 'imports'
import {
    lineEventCandidateSessions,
    type InsertLineEventCandidateSession,
    type SelectLineEventCandidateSession,
} from '_shared/schemas/lineEventCandidateSessions'
import type { AIEventCandidate } from '_shared/types/ai-api-types'

/**
 * セッション作成入力型
 */
export interface CreateSessionInput {
    userId: string
    lineUserId: string
    query: string
    aiMessage?: string
    candidates: AIEventCandidate[]
}

/**
 * セッション作成
 *
 * @param input - セッション作成入力
 * @param dbClient - データベースクライアント（オプション、トランザクション用）
 * @returns 作成されたセッション
 */
export async function createLineEventCandidateSession(
    input: CreateSessionInput,
    dbClient?: PostgresJsDatabase<typeof import('_shared/schemas')>
): Promise<SelectLineEventCandidateSession> {
    const client = dbClient || db
    const sessionId = crypto.randomUUID()

    const sessionData: InsertLineEventCandidateSession = {
        sessionId,
        userId: input.userId,
        lineUserId: input.lineUserId,
        query: input.query,
        aiMessage: input.aiMessage || null,
        candidates: input.candidates as unknown,
    }

    const [session] = await client
        .insert(lineEventCandidateSessions)
        .values(sessionData)
        .returning()

    if (!session) {
        throw new Error('Failed to create session')
    }

    return session
}

/**
 * セッションIDでセッションを取得
 *
 * @param sessionId - セッションID
 * @param dbClient - データベースクライアント（オプション、トランザクション用）
 * @returns セッション情報（見つからない場合はnull）
 */
export async function getLineEventCandidateSession(
    sessionId: string,
    dbClient?: PostgresJsDatabase<typeof import('_shared/schemas')>
): Promise<SelectLineEventCandidateSession | null> {
    const client = dbClient || db

    const [session] = await client
        .select()
        .from(lineEventCandidateSessions)
        .where(eq(lineEventCandidateSessions.sessionId, sessionId))
        .limit(1)

    if (!session) {
        return null
    }

    // 有効期限チェック
    const now = new Date()
    if (session.expiresAt && new Date(session.expiresAt) < now) {
        return null
    }

    return session
}

/**
 * セッションを削除
 *
 * @param sessionId - セッションID
 * @param dbClient - データベースクライアント（オプション、トランザクション用）
 * @returns 削除が成功したかどうか
 */
export async function deleteLineEventCandidateSession(
    sessionId: string,
    dbClient?: PostgresJsDatabase<typeof import('_shared/schemas')>
): Promise<boolean> {
    const client = dbClient || db

    const result = await client
        .delete(lineEventCandidateSessions)
        .where(eq(lineEventCandidateSessions.sessionId, sessionId))
        .returning()

    return result.length > 0
}
