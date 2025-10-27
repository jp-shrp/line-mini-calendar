import {
    apiHandler,
    authMiddleware,
    initApi,
    validatedApiHandler,
    type Variables,
} from '_shared/middlewares/middleware'
import { getPaginationInfoFromRequest } from '_shared/paginationUtility'
import type { SelectUser } from '_shared/schemas/users'
import type { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'
import {
    createEvent,
    deleteEvent,
    getEventById,
    getEvents,
    updateEvent,
} from '_shared/services/eventService'
import type {
    CreateEventInput,
    EventDetailResponse,
    EventsListResponse,
} from '_shared/types/events-api-types'
import { SuccessResponse } from '_shared/types/responses'
import { parseJSTtoUTC } from '_shared/utils/date-utils'
import {
    createEventSchema,
    updateEventSchema,
} from '_shared/validations/eventsValidation'
import 'jsr:@supabase/functions-js/edge-runtime.d.ts'

// const DUMMY_USER_ID = 'c5f42133-6d0f-478d-8645-73e393aed5cb' // 開発用ダミーID（現在は未使用）

// 型拡張 - Honoのコンテキストにユーザー情報を追加
export type CalendarVariables = Variables & {
    user: SelectUser
    supabase: SupabaseClient
}

// 共通初期化関数を使ってAPIアプリケーションを初期化
const app = initApi<{ Variables: CalendarVariables }>('/calendar-api')

// ルート定義
app.get(
    '/',
    apiHandler((c) => {
        return Promise.resolve(
            c.json({
                message: 'Calendar API is running',
                timestamp: new Date().toISOString(),
            })
        )
    })
)

/**
 * イベント一覧取得API
 * GET /calendar-api/events
 * クエリパラメータ: startDate, endDate, category, page, limit
 *
 * TODO: 認証を一時的に無効化（開発用）
 */
app.get(
    '/events',
    authMiddleware,
    apiHandler(async (c) => {
        const user = c.get('user') as SelectUser
        const userId = user.id
        const pagination = getPaginationInfoFromRequest(c)

        // クエリパラメータの取得
        const startDate = c.req.query('startDate')
        const endDate = c.req.query('endDate')
        const category = c.req.query('category')

        // イベント一覧取得
        const { events, total } = await getEvents({
            userId,
            startDate,
            endDate,
            category,
            pagination,
        })

        // レスポンス作成
        const response: EventsListResponse = {
            events,
            total,
            page: pagination.currentPage,
            pageSize: pagination.limit,
        }

        return c.json(
            new SuccessResponse({
                data: response,
                message: 'イベント一覧を取得しました',
            })
        )
    })
)

/**
 * イベント詳細取得API
 * GET /calendar-api/events/:id
 *
 * TODO: 認証を一時的に無効化（開発用）
 */
app.get(
    '/events/:id',
    authMiddleware,
    apiHandler(async (c) => {
        const user = c.get('user') as SelectUser
        const userId = user.id
        const eventId = c.req.param('id')

        // イベント詳細取得
        const event = await getEventById(eventId, userId)

        // レスポンス作成
        const response: EventDetailResponse = {
            event,
        }

        return c.json(
            new SuccessResponse({
                data: response,
                message: 'イベント詳細を取得しました',
            })
        )
    })
)

/**
 * イベント作成API
 * POST /calendar-api/events
 *
 * TODO: 認証を一時的に無効化（開発用）
 */
app.post(
    '/events',
    authMiddleware,
    validatedApiHandler(createEventSchema, async (c, validatedData) => {
        const user = c.get('user') as SelectUser
        const userId = user.id

        // イベント作成
        // フロントから送信されたdatetime-local形式の文字列を日本時間として解釈し、UTCに変換
        const eventData: CreateEventInput = {
            title: validatedData.title,
            description: validatedData.description,
            category: validatedData.category,
            iconUrl: validatedData.iconUrl,
            startDatetime: parseJSTtoUTC(validatedData.startDatetime),
            endDatetime: parseJSTtoUTC(validatedData.endDatetime),
            color: validatedData.color,
        }
        const newEvent = await createEvent(userId, eventData)

        // レスポンス作成
        const response: EventDetailResponse = {
            event: newEvent,
        }

        return c.json(
            new SuccessResponse({
                data: response,
                message: 'イベントを作成しました',
            })
        )
    })
)

/**
 * イベント更新API
 * PUT /calendar-api/events/:id
 *
 * TODO: 認証を一時的に無効化（開発用）
 */
app.put(
    '/events/:id',
    authMiddleware,
    validatedApiHandler(updateEventSchema, async (c, validatedData) => {
        const user = c.get('user') as SelectUser
        const userId = user.id
        const eventId = c.req.param('id')

        // イベント更新データの準備
        const updateData: {
            title?: string
            description?: string
            category?: string
            iconUrl?: string
            startDatetime?: Date
            endDatetime?: Date
            color?: string
        } = {}

        if (validatedData.title !== undefined) {
            updateData.title = validatedData.title
        }
        if (validatedData.description !== undefined) {
            updateData.description = validatedData.description
        }
        if (validatedData.category !== undefined) {
            updateData.category = validatedData.category
        }
        if (validatedData.iconUrl !== undefined) {
            updateData.iconUrl = validatedData.iconUrl
        }
        if (validatedData.startDatetime !== undefined) {
            // フロントから送信されたdatetime-local形式の文字列を日本時間として解釈し、UTCに変換
            updateData.startDatetime = parseJSTtoUTC(
                validatedData.startDatetime
            )
        }
        if (validatedData.endDatetime !== undefined) {
            // フロントから送信されたdatetime-local形式の文字列を日本時間として解釈し、UTCに変換
            updateData.endDatetime = parseJSTtoUTC(validatedData.endDatetime)
        }
        if (validatedData.color !== undefined) {
            updateData.color = validatedData.color
        }

        // イベント更新
        const updatedEvent = await updateEvent(eventId, userId, updateData)

        // レスポンス作成
        const response: EventDetailResponse = {
            event: updatedEvent,
        }

        return c.json(
            new SuccessResponse({
                data: response,
                message: 'イベントを更新しました',
            })
        )
    })
)

/**
 * イベント削除API（ソフトデリート）
 * DELETE /calendar-api/events/:id
 *
 * TODO: 認証を一時的に無効化（開発用）
 */
app.delete(
    '/events/:id',
    authMiddleware,
    apiHandler(async (c) => {
        const user = c.get('user') as SelectUser
        const userId = user.id
        const eventId = c.req.param('id')

        // イベント削除（ソフトデリート）
        await deleteEvent(eventId, userId)

        return c.json(
            new SuccessResponse({
                data: { id: eventId },
                message: 'イベントを削除しました',
            })
        )
    })
)

// Deno Edge Functions用のexport
Deno.serve(app.fetch)
