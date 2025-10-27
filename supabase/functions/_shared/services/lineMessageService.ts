/**
 * LINE Message Service
 *
 * @description
 * LINE Messaging APIを使用してメッセージの送信を管理するサービス
 */

import type {
    LineFlexBubble,
    LineFlexMessage,
    LineMessage,
    LinePushRequest,
    LineReplyRequest,
    LineTextMessage,
} from '_shared/types/line-api-types'

/**
 * LINE Messaging APIのベースURL
 */
const LINE_MESSAGING_API_BASE_URL = 'https://api.line.me/v2/bot'

/**
 * LINE Message Serviceクラス
 */
export class LineMessageService {
    /**
     * @param channelAccessToken - LINEチャネルアクセストークン
     */
    constructor(private readonly channelAccessToken: string) {}

    /**
     * Reply APIを使用してメッセージを送信する
     *
     * @param replyToken - リプライトークン
     * @param messages - 送信するメッセージ配列
     * @throws LINE API呼び出しエラー
     */
    async replyMessage(
        replyToken: string,
        messages: LineMessage[]
    ): Promise<void> {
        const body: LineReplyRequest = {
            replyToken,
            messages,
        }

        const response = await fetch(
            `${LINE_MESSAGING_API_BASE_URL}/message/reply`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${this.channelAccessToken}`,
                },
                body: JSON.stringify(body),
            }
        )

        if (!response.ok) {
            const errorText = await response.text()
            throw new Error(
                `LINE Reply API failed: ${response.status} ${response.statusText} - ${errorText}`
            )
        }
    }

    /**
     * Push APIを使用してメッセージを送信する
     *
     * @param to - 送信先のユーザーID
     * @param messages - 送信するメッセージ配列
     * @throws LINE API呼び出しエラー
     */
    async pushMessage(to: string, messages: LineMessage[]): Promise<void> {
        const body: LinePushRequest = {
            to,
            messages,
        }

        const response = await fetch(
            `${LINE_MESSAGING_API_BASE_URL}/message/push`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${this.channelAccessToken}`,
                },
                body: JSON.stringify(body),
            }
        )

        if (!response.ok) {
            const errorText = await response.text()
            throw new Error(
                `LINE Push API failed: ${response.status} ${response.statusText} - ${errorText}`
            )
        }
    }

    /**
     * テキストメッセージを作成する
     *
     * @param text - メッセージテキスト
     * @returns テキストメッセージオブジェクト
     */
    createTextMessage(text: string): LineTextMessage {
        return {
            type: 'text',
            text,
        }
    }

    /**
     * Flex Messageを作成する
     *
     * @param altText - 代替テキスト
     * @param contents - Flexメッセージの内容
     * @returns Flex Messageオブジェクト
     */
    createFlexMessage(
        altText: string,
        contents: LineFlexBubble
    ): LineFlexMessage {
        return {
            type: 'flex',
            altText,
            contents,
        }
    }

    /**
     * 未認証ユーザー向けのログイン促進メッセージを作成する
     *
     * @param liffId - LIFF ID
     * @returns ログイン促進メッセージのFlex Bubble
     */
    createLoginPromptMessage(liffId: string): LineFlexBubble {
        const liffUrl = `https://liff.line.me/${liffId}`

        return {
            type: 'bubble',
            body: {
                type: 'box',
                layout: 'vertical',
                contents: [
                    {
                        type: 'text',
                        text: 'ログインが必要です',
                        weight: 'bold',
                        size: 'xl',
                        color: '#1DB446',
                    },
                    {
                        type: 'text',
                        text: 'カレンダー機能を利用するには、まずアプリにログインしてください。',
                        size: 'sm',
                        color: '#666666',
                        wrap: true,
                        margin: 'md',
                    },
                ],
            },
            footer: {
                type: 'box',
                layout: 'vertical',
                contents: [
                    {
                        type: 'button',
                        action: {
                            type: 'uri',
                            label: 'アプリを開く',
                            uri: liffUrl,
                        },
                        style: 'primary',
                        color: '#1DB446',
                    },
                ],
            },
        }
    }

    /**
     * AI検索結果のFlex Messageを作成する
     *
     * @param events - イベント情報の配列
     * @param liffId - LIFF ID
     * @returns AI検索結果のFlex Bubble
     */
    createEventSearchResultMessage(
        events: Array<{
            id: string
            title: string
            startDatetime: string
            endDatetime?: string | null
        }>,
        liffId: string
    ): LineFlexBubble {
        const liffUrl = `https://liff.line.me/${liffId}`

        if (events.length === 0) {
            return {
                type: 'bubble',
                body: {
                    type: 'box',
                    layout: 'vertical',
                    contents: [
                        {
                            type: 'text',
                            text: '検索結果',
                            weight: 'bold',
                            size: 'xl',
                            color: '#1DB446',
                        },
                        {
                            type: 'text',
                            text: 'イベントが見つかりませんでした',
                            size: 'sm',
                            color: '#666666',
                            wrap: true,
                            margin: 'md',
                        },
                    ],
                },
                footer: {
                    type: 'box',
                    layout: 'vertical',
                    contents: [
                        {
                            type: 'button',
                            action: {
                                type: 'uri',
                                label: 'カレンダーを見る',
                                uri: liffUrl,
                            },
                            style: 'primary',
                            color: '#1DB446',
                        },
                    ],
                },
            }
        }

        // イベント一覧を作成
        const eventItems = events.slice(0, 5).map((event) => {
            const startDate = new Date(event.startDatetime)
            const dateStr = startDate.toLocaleDateString('ja-JP', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            })

            return {
                type: 'box' as const,
                layout: 'vertical' as const,
                contents: [
                    {
                        type: 'text' as const,
                        text: event.title,
                        weight: 'bold' as const,
                        size: 'sm' as const,
                        wrap: true,
                    },
                    {
                        type: 'text' as const,
                        text: dateStr,
                        size: 'xs' as const,
                        color: '#999999',
                        margin: 'xs' as const,
                    },
                ],
                margin: 'md' as const,
                action: {
                    type: 'uri' as const,
                    uri: `${liffUrl}/calendar/${event.id}`,
                },
            }
        })

        return {
            type: 'bubble',
            body: {
                type: 'box',
                layout: 'vertical',
                contents: [
                    {
                        type: 'text',
                        text: `${events.length}件のイベントが見つかりました`,
                        weight: 'bold',
                        size: 'xl',
                        color: '#1DB446',
                    },
                    ...eventItems,
                ],
            },
            footer: {
                type: 'box',
                layout: 'vertical',
                contents: [
                    {
                        type: 'button',
                        action: {
                            type: 'uri',
                            label: 'すべて見る',
                            uri: `${liffUrl}/calendar`,
                        },
                        style: 'primary',
                        color: '#1DB446',
                    },
                ],
            },
        }
    }
}
