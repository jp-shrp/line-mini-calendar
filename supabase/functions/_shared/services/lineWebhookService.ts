/**
 * LINE Webhook Service
 *
 * @description
 * LINE Messaging APIからのWebhookイベントを処理するサービス
 */

import { aiGenerateEventCandidates } from '_shared/services/aiEventService'
import { LineMessageService } from '_shared/services/lineMessageService'
import { getUserByLineUserId } from '_shared/services/userService'
import type {
    LineFollowEvent,
    LineMessageEvent,
    LineUnfollowEvent,
    LineWebhookEvent,
} from '_shared/types/line-api-types'

/**
 * LINE Webhook Serviceクラス
 */
export class LineWebhookService {
    private lineMessageService: LineMessageService

    /**
     * @param channelAccessToken - LINEチャネルアクセストークン
     * @param liffId - LIFF ID
     */
    constructor(
        channelAccessToken: string,
        private readonly liffId: string
    ) {
        this.lineMessageService = new LineMessageService(channelAccessToken)
    }

    /**
     * Webhookイベントを処理する
     *
     * @param events - Webhookイベント配列
     */
    async handleWebhookEvents(events: LineWebhookEvent[]): Promise<void> {
        // イベントを並列処理
        await Promise.all(events.map((event) => this.handleWebhookEvent(event)))
    }

    /**
     * 個別のWebhookイベントを処理する
     *
     * @param event - Webhookイベント
     */
    private async handleWebhookEvent(event: LineWebhookEvent): Promise<void> {
        try {
            switch (event.type) {
                case 'message':
                    await this.handleMessageEvent(event as LineMessageEvent)
                    break
                case 'follow':
                    await this.handleFollowEvent(event as LineFollowEvent)
                    break
                case 'unfollow':
                    await this.handleUnfollowEvent(event as LineUnfollowEvent)
                    break
                default:
                    break
            }
        } catch (error) {
            throw error
        }
    }

    /**
     * メッセージイベントを処理する
     *
     * @param event - メッセージイベント
     */
    private async handleMessageEvent(event: LineMessageEvent): Promise<void> {
        if (event.message.type !== 'text') {
            await this.lineMessageService.replyMessage(event.replyToken, [
                this.lineMessageService.createTextMessage(
                    '申し訳ございません。テキストメッセージのみ対応しています。'
                ),
            ])
            return
        }

        const lineUserId = event.source.userId
        if (!lineUserId) {
            return
        }

        const messageText = event.message.text || ''

        try {
            const user = await getUserByLineUserId(lineUserId)

            if (!user) {
                const loginPromptBubble =
                    this.lineMessageService.createLoginPromptMessage(
                        this.liffId
                    )
                const loginMessage = this.lineMessageService.createFlexMessage(
                    'ログインが必要です',
                    loginPromptBubble
                )

                await this.lineMessageService.replyMessage(event.replyToken, [
                    loginMessage,
                ])
                return
            }

            const result = await aiGenerateEventCandidates(user.id, messageText)

            const resultBubble =
                this.lineMessageService.createEventCandidatesMessage(
                    result.candidates,
                    result.aiMessage,
                    this.liffId
                )

            const resultMessage = this.lineMessageService.createFlexMessage(
                result.aiMessage || 'イベント候補が見つかりました',
                resultBubble
            )

            await this.lineMessageService.replyMessage(event.replyToken, [
                resultMessage,
            ])
        } catch (_error) {
            await this.lineMessageService.replyMessage(event.replyToken, [
                this.lineMessageService.createTextMessage(
                    '申し訳ございません。処理中にエラーが発生しました。しばらくしてから再度お試しください。'
                ),
            ])
        }
    }

    /**
     * フォローイベントを処理する
     *
     * @param event - フォローイベント
     */
    private async handleFollowEvent(event: LineFollowEvent): Promise<void> {
        const lineUserId = event.source.userId
        if (!lineUserId) {
            return
        }

        const welcomeMessage = this.lineMessageService.createTextMessage(
            '友だち追加ありがとうございます!\n\nLINEミニカレンダーでは、LINEからイベントを検索できます。\n\n例:\n- 今日の試合は?\n- 明日のプレミアリーグの試合\n- 今週のイベントを教えて\n\nまずはアプリにログインしてください。'
        )

        const loginPromptBubble =
            this.lineMessageService.createLoginPromptMessage(this.liffId)
        const loginMessage = this.lineMessageService.createFlexMessage(
            'アプリを開く',
            loginPromptBubble
        )

        await this.lineMessageService.replyMessage(event.replyToken, [
            welcomeMessage,
            loginMessage,
        ])
    }

    /**
     * アンフォローイベントを処理する
     *
     * @param event - アンフォローイベント
     */
    private handleUnfollowEvent(_event: LineUnfollowEvent): void {
        return
    }
}
