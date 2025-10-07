/**
 * Events API関連の型定義
 * クライアント側とEdge Functions側で共通利用
 * Schema firstアプローチで型を生成
 */

import type {
    InsertEvent,
    SelectEvent,
    UpdateEvent,
} from '_shared/schemas/events'

// Schemaから生成された型を再エクスポート
export type Event = SelectEvent

// APIクエリパラメータの型定義
export interface EventsQueryParams {
    startDate?: string // ISO 8601形式
    endDate?: string // ISO 8601形式
    category?: string
    page?: number
    limit?: number
}

// API固有のレスポンス型定義
export interface EventsListResponse {
    events: Event[]
    total: number
    page: number
    pageSize: number
}

export interface EventDetailResponse {
    event: Event
}

// API固有の入力型定義（Schemaの型をベースに拡張）
export type CreateEventInput = Omit<
    InsertEvent,
    'id' | 'userId' | 'isDeleted' | 'createdAt' | 'updatedAt'
>
export type UpdateEventInput = Omit<
    UpdateEvent,
    'id' | 'userId' | 'isDeleted' | 'createdAt' | 'updatedAt'
>
