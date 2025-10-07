import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import {
    apiHandler,
    authMiddleware,
    initApi,
    validatedApiHandler,
    type Variables,
} from '_shared/middlewares/middleware'
import { createEvent, getEvents } from '_shared/services/eventService'
import { getPaginationInfoFromRequest } from '_shared/paginationUtility'
import { SuccessResponse } from '_shared/types/responses'
import type { SelectUser } from '_shared/schemas/users'
import type {
    EventsListResponse,
    EventDetailResponse,
} from '_shared/types/events-api-types'
import { createEventSchema } from '_shared/validations/eventsValidation'

// 型拡張 - Honoのコンテキストにユーザー情報を追加
export type CalendarVariables = Variables & {
    user: SelectUser
    supabase: any
}

// 共通初期化関数を使ってAPIアプリケーションを初期化
const app = initApi<{ Variables: CalendarVariables }>('/calendar-api')

// ルート定義
app.get(
    '/',
    apiHandler(async (c) => {
        return c.json({
            message: 'Calendar API is running',
            timestamp: new Date().toISOString(),
        })
    })
)

/**
 * イベント一覧取得API
 * GET /calendar-api/events
 * クエリパラメータ: start_date, end_date, category, page, limit
 */
app.get(
    '/events',
    authMiddleware,
    apiHandler(async (c) => {
        const user = c.get('user') as SelectUser
        const pagination = getPaginationInfoFromRequest(c)

        // クエリパラメータの取得
        const startDate = c.req.query('start_date')
        const endDate = c.req.query('end_date')
        const category = c.req.query('category')

        // イベント一覧取得
        const { events, total } = await getEvents({
            userId: user.id,
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
 * イベント作成API
 * POST /calendar-api/events
 */
app.post(
    '/events',
    authMiddleware,
    validatedApiHandler(createEventSchema, async (c, validatedData) => {
        const user = c.get('user') as SelectUser

        // イベント作成
        const eventData = {
            title: validatedData.title,
            description: validatedData.description,
            category: validatedData.category,
            iconUrl: validatedData.iconUrl,
            startDatetime: new Date(validatedData.startDatetime),
            endDatetime: new Date(validatedData.endDatetime),
            color: validatedData.color,
        }
        const newEvent = await createEvent(user.id, eventData)

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

// Deno Edge Functions用のexport
Deno.serve(app.fetch)
