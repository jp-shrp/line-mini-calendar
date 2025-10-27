/**
 * LINE Webhook Integration Tests
 *
 * @description
 * LINE Messaging API Webhook処理の統合テスト
 */

import { describe, it, expect, beforeEach, afterEach, vi } from '@jest/globals'
import type {
    LineWebhookBody,
    LineMessageEvent,
    LineFollowEvent,
    LineUnfollowEvent,
} from '_shared/types/line-api-types'
import { LineWebhookService } from '_shared/services/lineWebhookService'
import { LineMessageService } from '_shared/services/lineMessageService'

// モック設定
vi.mock('_shared/services/userService')
vi.mock('_shared/services/aiEventService')
vi.mock('_shared/services/lineMessageService')

describe('LINE Webhook Integration Tests', () => {
    const mockChannelAccessToken = 'test_channel_access_token'
    const mockLiffId = 'test_liff_id'
    let webhookService: LineWebhookService

    beforeEach(() => {
        vi.clearAllMocks()
        webhookService = new LineWebhookService(
            mockChannelAccessToken,
            mockLiffId
        )
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    describe('メッセージイベント処理', () => {
        it('未認証ユーザーの場合、ログイン促進メッセージを返信する', async () => {
            // Arrange
            const mockEvent: LineMessageEvent = {
                type: 'message',
                timestamp: Date.now(),
                source: {
                    type: 'user',
                    userId: 'test_line_user_id',
                },
                webhookEventId: 'test_webhook_event_id',
                deliveryContext: {
                    isRedelivery: false,
                },
                replyToken: 'test_reply_token',
                message: {
                    type: 'text',
                    id: 'test_message_id',
                    text: '今日のイベントは?',
                },
            }

            const { getUserByLineUserId } = await import(
                '_shared/services/userService'
            )
            ;(getUserByLineUserId as any).mockResolvedValue(null) // 未認証ユーザー

            const mockReplyMessage = vi.fn().mockResolvedValue(undefined)
            ;(LineMessageService.prototype.replyMessage as any) =
                mockReplyMessage

            // Act
            await webhookService.handleWebhookEvents([mockEvent])

            // Assert
            expect(getUserByLineUserId).toHaveBeenCalledWith(
                'test_line_user_id'
            )
            expect(mockReplyMessage).toHaveBeenCalled()

            // ログイン促進メッセージが送信されたことを確認
            const replyCall = mockReplyMessage.mock.calls[0]
            expect(replyCall[0]).toBe('test_reply_token')
            expect(replyCall[1]).toHaveLength(1)
            expect(replyCall[1][0].type).toBe('flex')
        })

        it('認証済みユーザーの場合、AI検索結果を返信する', async () => {
            // Arrange
            const mockEvent: LineMessageEvent = {
                type: 'message',
                timestamp: Date.now(),
                source: {
                    type: 'user',
                    userId: 'test_line_user_id',
                },
                webhookEventId: 'test_webhook_event_id',
                deliveryContext: {
                    isRedelivery: false,
                },
                replyToken: 'test_reply_token',
                message: {
                    type: 'text',
                    id: 'test_message_id',
                    text: '今日の試合は?',
                },
            }

            const mockUser = {
                id: 'test_user_id',
                lineUserId: 'test_line_user_id',
                displayName: 'テストユーザー',
            }

            const mockSearchResult = {
                events: [
                    {
                        id: 'event_1',
                        title: 'プレミアリーグ',
                        startDatetime: new Date().toISOString(),
                        endDatetime: new Date().toISOString(),
                    },
                ],
                aiMessage: '今日の試合が見つかりました',
            }

            const { getUserByLineUserId } = await import(
                '_shared/services/userService'
            )
            const { aiSearchEvents } = await import(
                '_shared/services/aiEventService'
            )
            ;(getUserByLineUserId as any).mockResolvedValue(mockUser)
            ;(aiSearchEvents as any).mockResolvedValue(mockSearchResult)

            const mockReplyMessage = vi.fn().mockResolvedValue(undefined)
            ;(LineMessageService.prototype.replyMessage as any) =
                mockReplyMessage

            // Act
            await webhookService.handleWebhookEvents([mockEvent])

            // Assert
            expect(getUserByLineUserId).toHaveBeenCalledWith(
                'test_line_user_id'
            )
            expect(aiSearchEvents).toHaveBeenCalledWith(
                'test_user_id',
                '今日の試合は?'
            )
            expect(mockReplyMessage).toHaveBeenCalled()

            // AI検索結果のFlex Messageが送信されたことを確認
            const replyCall = mockReplyMessage.mock.calls[0]
            expect(replyCall[0]).toBe('test_reply_token')
            expect(replyCall[1]).toHaveLength(1)
            expect(replyCall[1][0].type).toBe('flex')
        })

        it('テキスト以外のメッセージの場合、エラーメッセージを返信する', async () => {
            // Arrange
            const mockEvent: LineMessageEvent = {
                type: 'message',
                timestamp: Date.now(),
                source: {
                    type: 'user',
                    userId: 'test_line_user_id',
                },
                webhookEventId: 'test_webhook_event_id',
                deliveryContext: {
                    isRedelivery: false,
                },
                replyToken: 'test_reply_token',
                message: {
                    type: 'image',
                    id: 'test_message_id',
                },
            }

            const mockReplyMessage = vi.fn().mockResolvedValue(undefined)
            ;(LineMessageService.prototype.replyMessage as any) =
                mockReplyMessage

            // Act
            await webhookService.handleWebhookEvents([mockEvent])

            // Assert
            expect(mockReplyMessage).toHaveBeenCalled()

            // エラーメッセージが送信されたことを確認
            const replyCall = mockReplyMessage.mock.calls[0]
            expect(replyCall[0]).toBe('test_reply_token')
            expect(replyCall[1]).toHaveLength(1)
            expect(replyCall[1][0].type).toBe('text')
            expect(replyCall[1][0].text).toContain('テキストメッセージのみ')
        })
    })

    describe('フォローイベント処理', () => {
        it('友だち追加時、ウェルカムメッセージとログイン促進メッセージを返信する', async () => {
            // Arrange
            const mockEvent: LineFollowEvent = {
                type: 'follow',
                timestamp: Date.now(),
                source: {
                    type: 'user',
                    userId: 'test_line_user_id',
                },
                webhookEventId: 'test_webhook_event_id',
                deliveryContext: {
                    isRedelivery: false,
                },
                replyToken: 'test_reply_token',
            }

            const mockReplyMessage = vi.fn().mockResolvedValue(undefined)
            ;(LineMessageService.prototype.replyMessage as any) =
                mockReplyMessage

            // Act
            await webhookService.handleWebhookEvents([mockEvent])

            // Assert
            expect(mockReplyMessage).toHaveBeenCalled()

            // 2つのメッセージが送信されたことを確認
            const replyCall = mockReplyMessage.mock.calls[0]
            expect(replyCall[0]).toBe('test_reply_token')
            expect(replyCall[1]).toHaveLength(2)

            // ウェルカムメッセージ
            expect(replyCall[1][0].type).toBe('text')
            expect(replyCall[1][0].text).toContain('友だち追加ありがとう')

            // ログイン促進メッセージ
            expect(replyCall[1][1].type).toBe('flex')
        })
    })

    describe('アンフォローイベント処理', () => {
        it('ブロック時、ログに記録する', async () => {
            // Arrange
            const mockEvent: LineUnfollowEvent = {
                type: 'unfollow',
                timestamp: Date.now(),
                source: {
                    type: 'user',
                    userId: 'test_line_user_id',
                },
                webhookEventId: 'test_webhook_event_id',
                deliveryContext: {
                    isRedelivery: false,
                },
            }

            const consoleSpy = vi.spyOn(console, 'log')

            // Act
            await webhookService.handleWebhookEvents([mockEvent])

            // Assert
            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining('User unfollowed')
            )
        })
    })

    describe('複数イベントの並列処理', () => {
        it('複数のイベントを並列処理できる', async () => {
            // Arrange
            const mockEvents: LineWebhookBody['events'] = [
                {
                    type: 'message',
                    timestamp: Date.now(),
                    source: {
                        type: 'user',
                        userId: 'user_1',
                    },
                    webhookEventId: 'event_1',
                    deliveryContext: {
                        isRedelivery: false,
                    },
                    replyToken: 'token_1',
                    message: {
                        type: 'text',
                        id: 'msg_1',
                        text: 'test',
                    },
                } as LineMessageEvent,
                {
                    type: 'follow',
                    timestamp: Date.now(),
                    source: {
                        type: 'user',
                        userId: 'user_2',
                    },
                    webhookEventId: 'event_2',
                    deliveryContext: {
                        isRedelivery: false,
                    },
                    replyToken: 'token_2',
                } as LineFollowEvent,
            ]

            const { getUserByLineUserId } = await import(
                '_shared/services/userService'
            )
            ;(getUserByLineUserId as any).mockResolvedValue(null)

            const mockReplyMessage = vi.fn().mockResolvedValue(undefined)
            ;(LineMessageService.prototype.replyMessage as any) =
                mockReplyMessage

            // Act
            const startTime = Date.now()
            await webhookService.handleWebhookEvents(mockEvents)
            const duration = Date.now() - startTime

            // Assert
            expect(mockReplyMessage).toHaveBeenCalledTimes(2)
            // 並列処理のため、合計時間が短いことを確認（目安: 500ms未満）
            expect(duration).toBeLessThan(500)
        })
    })

    describe('エラーハンドリング', () => {
        it('処理中にエラーが発生した場合、適切なエラーメッセージを返信する', async () => {
            // Arrange
            const mockEvent: LineMessageEvent = {
                type: 'message',
                timestamp: Date.now(),
                source: {
                    type: 'user',
                    userId: 'test_line_user_id',
                },
                webhookEventId: 'test_webhook_event_id',
                deliveryContext: {
                    isRedelivery: false,
                },
                replyToken: 'test_reply_token',
                message: {
                    type: 'text',
                    id: 'test_message_id',
                    text: 'エラーテスト',
                },
            }

            const { getUserByLineUserId } = await import(
                '_shared/services/userService'
            )
            const { aiSearchEvents } = await import(
                '_shared/services/aiEventService'
            )
            ;(getUserByLineUserId as any).mockResolvedValue({
                id: 'test_user_id',
            })
            ;(aiSearchEvents as any).mockRejectedValue(
                new Error('AI Search Error')
            )

            const mockReplyMessage = vi.fn().mockResolvedValue(undefined)
            ;(LineMessageService.prototype.replyMessage as any) =
                mockReplyMessage

            // Act
            await webhookService.handleWebhookEvents([mockEvent])

            // Assert
            expect(mockReplyMessage).toHaveBeenCalled()

            // エラーメッセージが送信されたことを確認
            const replyCall = mockReplyMessage.mock.calls[0]
            expect(replyCall[0]).toBe('test_reply_token')
            expect(replyCall[1]).toHaveLength(1)
            expect(replyCall[1][0].type).toBe('text')
            expect(replyCall[1][0].text).toContain('エラーが発生しました')
        })
    })
})
