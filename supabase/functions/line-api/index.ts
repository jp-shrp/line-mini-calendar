/**
 * LINE Messaging API Edge Function
 *
 * @description
 * LINE Messaging APIからのWebhookを処理するエンドポイント
 */

import { apiHandler, initApi } from '_shared/middlewares/middleware'
import { LineWebhookService } from '_shared/services/lineWebhookService'
import { getLineEventCandidateSession } from '_shared/services/lineEventCandidateSessionService'
import type { LineWebhookBody } from '_shared/types/line-api-types'
import { SuccessResponse } from '_shared/types/responses'
import { validateLineSignature } from '_shared/utils/line-signature'
import { HTTPException } from 'hono/http-exception'
import 'jsr:@supabase/functions-js/edge-runtime.d.ts'

// 環境変数の取得
const LINE_CHANNEL_ACCESS_TOKEN = Deno.env.get('LINE_CHANNEL_ACCESS_TOKEN')
const LINE_CHANNEL_SECRET = Deno.env.get('LINE_CHANNEL_SECRET')
const LIFF_ID = Deno.env.get('LINE_LIFF_ID')

// 環境変数のバリデーション
if (!LINE_CHANNEL_ACCESS_TOKEN) {
    throw new Error('LINE_CHANNEL_ACCESS_TOKEN is not set')
}
if (!LINE_CHANNEL_SECRET) {
    throw new Error('LINE_CHANNEL_SECRET is not set')
}
if (!LIFF_ID) {
    throw new Error('LINE_LIFF_ID is not set')
}

// API初期化
const app = initApi('/line-api')

// ルート定義
app.get('/', (c) => {
    return c.json({
        message: 'LINE API is running',
        timestamp: new Date().toISOString(),
    })
})

/**
 * セッション取得エンドポイント
 * GET /line-api/get-session
 *
 * @description
 * LIFFアプリからセッション情報を取得するエンドポイント
 */
app.get(
    '/get-session',
    apiHandler(async (c) => {
        const sessionId = c.req.query('sessionId')

        if (!sessionId) {
            throw new HTTPException(400, {
                message: 'sessionId is required',
            })
        }

        const session = await getLineEventCandidateSession(sessionId)

        if (!session) {
            throw new HTTPException(404, {
                message: 'Session not found or expired',
            })
        }

        return c.json(
            new SuccessResponse({
                data: {
                    sessionId: session.sessionId,
                    aiMessage: session.aiMessage || '',
                    candidates: session.candidates,
                },
                message: 'セッション情報を取得しました',
            })
        )
    })
)

/**
 * LINE Webhook エンドポイント
 * POST /line-api/webhook
 *
 * @description
 * LINE Platformからのwebhookを受け取り、各種イベントを処理します
 */
app.post(
    '/webhook',
    apiHandler(async (c) => {
        // リクエストボディの取得
        const bodyText = await c.req.text()
        const signature = c.req.header('X-Line-Signature')

        // 署名検証
        await validateLineSignature(
            bodyText,
            signature || null,
            LINE_CHANNEL_SECRET
        )

        // Webhookボディのパース
        const webhookBody: LineWebhookBody = JSON.parse(bodyText)

        // Webhookサービスのインスタンス化
        const webhookService = new LineWebhookService(
            LINE_CHANNEL_ACCESS_TOKEN,
            LIFF_ID
        )

        // イベント処理
        await webhookService.handleWebhookEvents(webhookBody.events)

        // LINE Platformへの応答（200 OKを返す必要がある）
        return c.json({ success: true })
    })
)

// Deno Edge Functions用のexport
Deno.serve(app.fetch)
