/**
 * LINE API関連の型定義
 *
 * @description
 * LINE Messaging APIとWebhook関連の型を定義します。
 * 公式ドキュメント: https://developers.line.biz/ja/reference/messaging-api/
 */

/**
 * LINE Webhookイベントの基本型
 */
export interface LineWebhookEvent {
    type: string
    timestamp: number
    source: LineEventSource
    webhookEventId: string
    deliveryContext: {
        isRedelivery: boolean
    }
    mode?: 'active' | 'standby'
}

/**
 * LINE イベントソース型
 */
export interface LineEventSource {
    type: 'user' | 'group' | 'room'
    userId?: string
    groupId?: string
    roomId?: string
}

/**
 * LINE メッセージイベント型
 */
export interface LineMessageEvent extends LineWebhookEvent {
    type: 'message'
    replyToken: string
    message: LineMessageObject
}

/**
 * LINE メッセージオブジェクト型
 */
export interface LineMessageObject {
    id: string
    type: 'text' | 'image' | 'video' | 'audio' | 'file' | 'location' | 'sticker'
    text?: string
    [key: string]: unknown
}

/**
 * LINE フォローイベント型
 */
export interface LineFollowEvent extends LineWebhookEvent {
    type: 'follow'
    replyToken: string
}

/**
 * LINE アンフォローイベント型
 */
export interface LineUnfollowEvent extends LineWebhookEvent {
    type: 'unfollow'
}

/**
 * LINE Webhook Body型
 */
export interface LineWebhookBody {
    destination: string
    events: LineWebhookEvent[]
}

/**
 * LINE メッセージ基本型
 */
export interface LineMessage {
    type: string
}

/**
 * LINE テキストメッセージ型
 */
export interface LineTextMessage extends LineMessage {
    type: 'text'
    text: string
    emojis?: Array<{
        index: number
        productId: string
        emojiId: string
    }>
}

/**
 * LINE Flex Message型
 */
export interface LineFlexMessage extends LineMessage {
    type: 'flex'
    altText: string
    contents: LineFlexContainer
}

/**
 * LINE Flex Container型
 */
export interface LineFlexContainer {
    type: 'bubble' | 'carousel'
    [key: string]: unknown
}

/**
 * LINE Flex Bubble型
 */
export interface LineFlexBubble extends LineFlexContainer {
    type: 'bubble'
    size?: 'nano' | 'micro' | 'kilo' | 'mega' | 'giga'
    header?: LineFlexBox
    hero?: LineFlexComponent
    body?: LineFlexBox
    footer?: LineFlexBox
    styles?: {
        header?: LineFlexBlockStyle
        hero?: LineFlexBlockStyle
        body?: LineFlexBlockStyle
        footer?: LineFlexBlockStyle
    }
    action?: LineAction
}

/**
 * LINE Flex Box型
 */
export interface LineFlexBox {
    type: 'box'
    layout: 'horizontal' | 'vertical' | 'baseline'
    contents: LineFlexComponent[]
    flex?: number
    spacing?: string
    margin?: string
    paddingAll?: string
    paddingTop?: string
    paddingBottom?: string
    paddingStart?: string
    paddingEnd?: string
    backgroundColor?: string
    borderColor?: string
    borderWidth?: string
    cornerRadius?: string
    width?: string
    height?: string
    offsetTop?: string
    offsetBottom?: string
    offsetStart?: string
    offsetEnd?: string
    position?: 'relative' | 'absolute'
    action?: LineAction
}

/**
 * LINE Flex Component型
 */
export type LineFlexComponent =
    | LineFlexBox
    | LineFlexButton
    | LineFlexFiller
    | LineFlexIcon
    | LineFlexImage
    | LineFlexSeparator
    | LineFlexSpacer
    | LineFlexText

/**
 * LINE Flex Text型
 */
export interface LineFlexText {
    type: 'text'
    text: string
    flex?: number
    margin?: string
    size?: string
    align?: 'start' | 'end' | 'center'
    gravity?: 'top' | 'bottom' | 'center'
    wrap?: boolean
    maxLines?: number
    weight?: 'regular' | 'bold'
    color?: string
    action?: LineAction
    style?: 'normal' | 'italic'
    decoration?: 'none' | 'underline' | 'line-through'
    offsetTop?: string
    offsetBottom?: string
    offsetStart?: string
    offsetEnd?: string
}

/**
 * LINE Flex Button型
 */
export interface LineFlexButton {
    type: 'button'
    action: LineAction
    flex?: number
    margin?: string
    height?: 'sm' | 'md'
    style?: 'link' | 'primary' | 'secondary'
    color?: string
    gravity?: 'top' | 'bottom' | 'center'
    adjustMode?: 'shrink-to-fit'
    offsetTop?: string
    offsetBottom?: string
    offsetStart?: string
    offsetEnd?: string
}

/**
 * LINE Flex Filler型
 */
export interface LineFlexFiller {
    type: 'filler'
    flex?: number
}

/**
 * LINE Flex Icon型
 */
export interface LineFlexIcon {
    type: 'icon'
    url: string
    margin?: string
    size?: string
    aspectRatio?: string
    offsetTop?: string
    offsetBottom?: string
    offsetStart?: string
    offsetEnd?: string
}

/**
 * LINE Flex Image型
 */
export interface LineFlexImage {
    type: 'image'
    url: string
    flex?: number
    margin?: string
    align?: 'start' | 'end' | 'center'
    gravity?: 'top' | 'bottom' | 'center'
    size?: string
    aspectRatio?: string
    aspectMode?: 'cover' | 'fit'
    backgroundColor?: string
    action?: LineAction
    offsetTop?: string
    offsetBottom?: string
    offsetStart?: string
    offsetEnd?: string
}

/**
 * LINE Flex Separator型
 */
export interface LineFlexSeparator {
    type: 'separator'
    margin?: string
    color?: string
}

/**
 * LINE Flex Spacer型
 */
export interface LineFlexSpacer {
    type: 'spacer'
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl'
}

/**
 * LINE Flex Block Style型
 */
export interface LineFlexBlockStyle {
    backgroundColor?: string
    separator?: boolean
    separatorColor?: string
}

/**
 * LINE Action型
 */
export type LineAction = LineURIAction | LineMessageAction | LinePostbackAction

/**
 * LINE URI Action型
 */
export interface LineURIAction {
    type: 'uri'
    label?: string
    uri: string
    altUri?: {
        desktop: string
    }
}

/**
 * LINE Message Action型
 */
export interface LineMessageAction {
    type: 'message'
    label?: string
    text: string
}

/**
 * LINE Postback Action型
 */
export interface LinePostbackAction {
    type: 'postback'
    label?: string
    data: string
    displayText?: string
    inputOption?:
        | 'closeRichMenu'
        | 'openRichMenu'
        | 'openKeyboard'
        | 'openVoice'
    fillInText?: string
}

/**
 * LINE Reply APIリクエスト型
 */
export interface LineReplyRequest {
    replyToken: string
    messages: LineMessage[]
    notificationDisabled?: boolean
}

/**
 * LINE Push APIリクエスト型
 */
export interface LinePushRequest {
    to: string
    messages: LineMessage[]
    notificationDisabled?: boolean
}

/**
 * LINE API エラーレスポンス型
 */
export interface LineApiErrorResponse {
    message: string
    details?: Array<{
        message: string
        property: string
    }>
}

/**
 * LINE イベント候補セッション型
 *
 * @description
 * LINE経由でAI生成したイベント候補を一時保存するためのセッション
 */
export interface LineEventCandidateSession {
    id: string
    sessionId: string
    userId: string
    lineUserId: string
    query: string
    aiMessage: string | null
    candidates: unknown // JSONB型 - EventCandidate[]として扱う
    createdAt: Date
    expiresAt: Date
}

/**
 * LINE イベント候補セッション作成入力型
 */
export interface CreateLineEventCandidateSessionInput {
    userId: string
    lineUserId: string
    query: string
    aiMessage?: string
    candidates: unknown // EventCandidate[]として渡す
}
