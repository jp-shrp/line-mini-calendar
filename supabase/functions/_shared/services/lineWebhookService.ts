/**
 * LINE Webhook Service
 *
 * @description
 * LINE Messaging APIからのWebhookイベントを処理するサービス
 */

import { aiSearchEvents } from '_shared/services/aiEventService'
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
                    console.log('Unhandled event type:', event.type)
            }
        } catch (error) {
            console.error(`Error handling ${event.type} event:`, error)
            throw error
        }
    }

    /**
     * メッセージイベントを処理する
     *
     * @param event - メッセージイベント
     */
    private async handleMessageEvent(event: LineMessageEvent): Promise<void> {
        // テキストメッセージのみ処理
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
            console.error('No userId in message event')
            return
        }

        const messageText = event.message.text || ''

        try {
            // LINE User IDでユーザーを検索
            const user = await getUserByLineUserId(lineUserId)

            if (!user) {
                // 未認証ユーザー: ログイン促進メッセージを送信
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

            // 認証済みユーザー: AI検索を実行
            const searchResult = await aiSearchEvents(user.id, messageText)

            // 検索結果のFlex Messageを作成
            const resultBubble =
                this.lineMessageService.createEventSearchResultMessage(
                    searchResult.events.map((e) => ({
                        id: e.id,
                        title: e.title,
                        startDatetime: e.startDatetime,
                        endDatetime: e.endDatetime,
                    })),
                    this.liffId
                )

            const resultMessage = this.lineMessageService.createFlexMessage(
                searchResult.aiMessage || 'イベント検索結果',
                resultBubble
            )

            await this.lineMessageService.replyMessage(event.replyToken, [
                resultMessage,
            ])
        } catch (error) {
            console.error('Error in handleMessageEvent:', error)

            // エラー時は汎用エラーメッセージを送信
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
            console.error('No userId in follow event')
            return
        }

        try {
            // ウェルカムメッセージを送信
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
        } catch (error) {
            console.error('Error in handleFollowEvent:', error)
        }
    }

    /**
     * アンフォローイベントを処理する
     *
     * @param event - アンフォローイベント
     */
    private async handleUnfollowEvent(event: LineUnfollowEvent): Promise<void> {
        const lineUserId = event.source.userId
        if (!lineUserId) {
            console.error('No userId in unfollow event')
            return
        }

        // ログに記録（必要に応じてユーザーデータのクリーンアップなどを実装）
        console.log(`User unfollowed: ${lineUserId}`)
    }
}
