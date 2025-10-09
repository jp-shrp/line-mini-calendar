import {
    apiHandler,
    authMiddleware,
    initApi,
    type Variables,
} from '_shared/middlewares/middleware'
import type { SelectUser } from '_shared/schemas/users'
import {
    aiGenerateEventCandidates,
    aiSearchEvents,
} from '_shared/services/aiEventService'
import { createEvent } from '_shared/services/eventService'
import type {
    AIConfirmRegisterRequest,
    AIConfirmRegisterResponse,
    AIRegisterRequest,
    AIRegisterResponse,
    AISearchRequest,
    AISearchResponse,
} from '_shared/types/ai-api-types'
import type { CreateEventInput } from '_shared/types/events-api-types'
import { SuccessResponse } from '_shared/types/responses'
import { parseJSTtoUTC } from '_shared/utils/date-utils'
import 'jsr:@supabase/functions-js/edge-runtime.d.ts'

// 型拡張
export type AIVariables = Variables & {
    user: SelectUser
    supabase: any
}

// API初期化
const app = initApi<{ Variables: AIVariables }>('/ai-api')

// ルート定義
app.get('/', (c) => {
    return c.json({
        message: 'AI API is running',
        timestamp: new Date().toISOString(),
        features: ['search', 'register'],
    })
})

/**
 * AIイベント検索API
 * POST /ai-api/search
 *
 * リクエストボディ:
 * {
 *   "query": "今日の試合何がある"
 * }
 */
app.post(
    '/search',
    authMiddleware,
    apiHandler(async (c) => {
        const user = c.get('user') as SelectUser
        const userId = user.id

        const body = await c.req.json()
        const { query } = body as AISearchRequest

        if (!query || typeof query !== 'string') {
            return c.json(
                {
                    success: false,
                    message: 'クエリが必要です',
                },
                400
            )
        }

        // AI検索実行
        const result = await aiSearchEvents(userId, query)

        const response: AISearchResponse = result

        return c.json(
            new SuccessResponse({
                data: response,
                message: 'AI検索が完了しました',
            })
        )
    })
)

/**
 * AIイベント登録候補生成API
 * POST /ai-api/register
 *
 * リクエストボディ:
 * {
 *   "query": "トットナムの試合の日程を登録して"
 * }
 */
app.post(
    '/register',
    authMiddleware,
    apiHandler(async (c) => {
        const body = await c.req.json()
        const { query } = body as AIRegisterRequest

        if (!query || typeof query !== 'string') {
            return c.json(
                {
                    success: false,
                    message: 'クエリが必要です',
                },
                400
            )
        }

        // AI登録候補生成
        const result = await aiGenerateEventCandidates(query)

        const response: AIRegisterResponse = result

        return c.json(
            new SuccessResponse({
                data: response,
                message: 'AI登録候補を生成しました',
            })
        )
    })
)

/**
 * AIイベント登録確定API
 * POST /ai-api/confirm-register
 *
 * リクエストボディ:
 * {
 *   "candidateIndex": 0,
 *   "candidates": [...]
 * }
 */
app.post(
    '/confirm-register',
    authMiddleware,
    apiHandler(async (c) => {
        const user = c.get('user') as SelectUser
        const userId = user.id

        const body = await c.req.json()
        const { candidateIndex, candidates } = body as AIConfirmRegisterRequest

        if (
            typeof candidateIndex !== 'number' ||
            !Array.isArray(candidates) ||
            candidateIndex < 0 ||
            candidateIndex >= candidates.length
        ) {
            return c.json(
                {
                    success: false,
                    message: '有効な候補を選択してください',
                },
                400
            )
        }

        const selectedCandidate = candidates[candidateIndex]

        // イベント作成
        const eventData: CreateEventInput = {
            title: selectedCandidate.title,
            description: selectedCandidate.description,
            category: selectedCandidate.category,
            iconUrl: selectedCandidate.iconUrl,
            startDatetime: parseJSTtoUTC(selectedCandidate.startDatetime),
            endDatetime: parseJSTtoUTC(selectedCandidate.endDatetime),
            color: selectedCandidate.color,
        }

        const newEvent = await createEvent(userId, eventData)

        const response: AIConfirmRegisterResponse = {
            event: newEvent,
            aiMessage: `「${newEvent.title}」をカレンダーに登録しました！`,
        }

        return c.json(
            new SuccessResponse({
                data: response,
                message: 'イベントを登録しました',
            })
        )
    })
)

// Deno Edge Functions用のexport
Deno.serve(app.fetch)
