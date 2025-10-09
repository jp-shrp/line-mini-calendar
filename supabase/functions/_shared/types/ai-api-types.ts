/**
 * AI API関連の型定義
 * クライアント側とEdge Functions側で共通利用
 */

import type { Event } from '_shared/types/events-api-types'

/**
 * AI検索リクエスト
 */
export interface AISearchRequest {
    query: string // 自然言語のクエリ（例: "今日の試合何がある"）
}

/**
 * AI検索レスポンス
 */
export interface AISearchResponse {
    events: Event[]
    total: number
    aiMessage: string // AIが生成した応答メッセージ
    searchParams: {
        startDate?: string
        endDate?: string
        category?: string
        keywords?: string[]
    }
}

/**
 * AI登録リクエスト
 */
export interface AIRegisterRequest {
    query: string // 自然言語のクエリ（例: "トットナムの試合の日程を登録して"）
}

/**
 * AI登録候補
 */
export interface AIEventCandidate {
    title: string
    description?: string
    category: string
    startDatetime: string
    endDatetime: string
    iconUrl?: string
    color?: string
    confidence: number // AIの確信度（0-1）
    source?: string // 情報源
}

/**
 * AI登録レスポンス（候補提示）
 */
export interface AIRegisterResponse {
    candidates: AIEventCandidate[]
    aiMessage: string // AIが生成した確認メッセージ
    requiresConfirmation: boolean // ユーザー確認が必要かどうか
}

/**
 * AI登録確定リクエスト
 */
export interface AIConfirmRegisterRequest {
    candidateIndex: number // 選択された候補のインデックス
    candidates: AIEventCandidate[] // 候補リスト
}

/**
 * AI登録確定レスポンス
 */
export interface AIConfirmRegisterResponse {
    event: Event
    aiMessage: string
}

/**
 * AI一括登録リクエスト
 */
export interface AIBatchRegisterRequest {
    candidateIndexes: number[] // 選択された複数候補のインデックス配列
    candidates: AIEventCandidate[] // 候補リスト
}

/**
 * AI一括登録レスポンス
 */
export interface AIBatchRegisterResponse {
    events: Event[] // 登録されたイベントの配列
    successCount: number // 成功した件数
    failureCount: number // 失敗した件数
    aiMessage: string
}
