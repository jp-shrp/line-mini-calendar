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
    AIBatchRegisterRequest,
    AIBatchRegisterResponse,
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

/**
 * AIイベント一括登録API
 * POST /ai-api/batch-register
 *
 * リクエストボディ:
 * {
 *   "candidateIndexes": [0, 1, 2],
 *   "candidates": [...]
 * }
 */
app.post(
    '/batch-register',
    authMiddleware,
    apiHandler(async (c) => {
        const user = c.get('user') as SelectUser
        const userId = user.id

        const body = await c.req.json()
        const { candidateIndexes, candidates } = body as AIBatchRegisterRequest

        if (
            !Array.isArray(candidateIndexes) ||
            !Array.isArray(candidates) ||
            candidateIndexes.length === 0
        ) {
            return c.json(
                {
                    success: false,
                    message: '有効な候補を選択してください',
                },
                400
            )
        }

        // 選択されたインデックスが範囲内かチェック
        for (const index of candidateIndexes) {
            if (
                typeof index !== 'number' ||
                index < 0 ||
                index >= candidates.length
            ) {
                return c.json(
                    {
                        success: false,
                        message: '無効な候補インデックスが含まれています',
                    },
                    400
                )
            }
        }

        const events = []
        const errors: Array<{ index: number; title: string; error: string }> =
            []
        let successCount = 0
        let failureCount = 0

        // 選択された候補を一つずつイベント作成
        for (const index of candidateIndexes) {
            try {
                const selectedCandidate = candidates[index]

                const eventData: CreateEventInput = {
                    title: selectedCandidate.title,
                    description: selectedCandidate.description,
                    category: selectedCandidate.category,
                    iconUrl: selectedCandidate.iconUrl,
                    startDatetime: parseJSTtoUTC(
                        selectedCandidate.startDatetime
                    ),
                    endDatetime: parseJSTtoUTC(selectedCandidate.endDatetime),
                    color: selectedCandidate.color,
                }

                const newEvent = await createEvent(userId, eventData)
                events.push(newEvent)
                successCount++
            } catch (error) {
                const selectedCandidate = candidates[index]
                const errorMessage =
                    error instanceof Error ? error.message : String(error)
                console.error(
                    `Failed to create event at index ${index}:`,
                    errorMessage
                )
                errors.push({
                    index,
                    title: selectedCandidate.title,
                    error: errorMessage,
                })
                failureCount++
            }
        }

        let aiMessage = ''
        if (successCount > 0 && failureCount === 0) {
            aiMessage = `${successCount}件のイベントをカレンダーに登録しました！`
        } else if (successCount > 0 && failureCount > 0) {
            aiMessage = `${successCount}件のイベントをカレンダーに登録しました（${failureCount}件失敗）`
        } else {
            aiMessage = `イベントの登録に失敗しました（${failureCount}件失敗）`
        }

        if (errors.length > 0) {
            const errorDetails = errors
                .map((e) => `・${e.title}: ${e.error}`)
                .join('\n')
            aiMessage += `\n\n失敗した理由:\n${errorDetails}`
        }

        const response: AIBatchRegisterResponse = {
            events,
            successCount,
            failureCount,
            aiMessage,
        }

        return c.json(
            new SuccessResponse({
                data: response,
                message: `${successCount}件のイベントを登録しました`,
            })
        )
    })
)

// Deno Edge Functions用のexport
Deno.serve(app.fetch)
