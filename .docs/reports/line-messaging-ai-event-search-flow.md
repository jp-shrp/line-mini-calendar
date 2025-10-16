# LIFFアプリでLINEメッセージを利用したAIイベント検索フロー調査レポート

**作成日**: 2025-10-16
**目的**: LIFFアプリとLINE Messaging APIを連携し、ユーザーがLINEメッセージを通じてAIイベント検索を実行できるフローを調査・設計する

---

## 目次

1. [エグゼクティブサマリー](#エグゼクティブサマリー)
2. [現在のプロジェクト構成](#現在のプロジェクト構成)
3. [LINE Messaging APIの概要](#line-messaging-apiの概要)
4. [提案フロー設計](#提案フロー設計)
5. [技術要件](#技術要件)
6. [実装ステップ](#実装ステップ)
7. [セキュリティとベストプラクティス](#セキュリティとベストプラクティス)
8. [参考資料](#参考資料)

---

## エグゼクティブサマリー

### 調査結果の要約

本プロジェクトは、LIFFアプリ（LINE Front-end Framework）を使用したカレンダー管理アプリケーションです。現在、Web UIを通じたAIイベント検索機能が実装されています。

この調査では、**LINEメッセージを通じてユーザーがAIイベント検索を実行できる機能**の実装フローを設計しました。

### 主要な発見

1. **現在の実装状況**
    - AI API（`/ai-api/search`）は既に実装済み
    - Gemini APIを使用したAI検索エンジンが稼働中
    - LIFF認証フローが実装済み

2. **必要な追加実装**
    - LINE Messaging API Webhookエンドポイント
    - メッセージ受信→AI検索→結果返信のフロー
    - LINE公式アカウントとの連携

3. **推奨アプローチ**
    - Webhookを使用したイベント駆動型アーキテクチャ
    - Supabase Edge Functionsでの実装
    - 既存AI APIの再利用

---

## 現在のプロジェクト構成

### プロジェクト概要

- **フレームワーク**: Next.js 15.3.2 (App Router)
- **バックエンド**: Supabase Edge Functions
- **AI**: Gemini API
- **認証**: LIFF + Supabase Auth

### 既存のAI機能

#### 1. AI検索API (`/ai-api/search`)

**エンドポイント**: `POST /ai-api/search`

**リクエスト例**:

```json
{
    "query": "今日の試合何がある"
}
```

**レスポンス例**:

```json
{
  "success": true,
  "data": {
    "aiMessage": "以下の試合が見つかりました",
    "events": [...]
  }
}
```

#### 2. AI登録API (`/ai-api/register`)

**エンドポイント**: `POST /ai-api/register`

イベント候補を生成し、ユーザーが選択して登録できる機能。

#### 3. LIFFクライアント

- **場所**: `src/lib/liff-client.ts`
- **機能**: LIFF SDK初期化、認証処理
- **サポート**: モックLIFF（開発環境）と実際のLIFF SDK（本番環境）

---

## LINE Messaging APIの概要

### 1. Messaging APIとは

LINE Messaging APIは、LINE公式アカウントを通じてユーザーとインタラクティブなコミュニケーションを実現するAPIです。

**主な機能**:

- ユーザーからのメッセージ受信（Webhook）
- ボットからのメッセージ送信（Reply API / Push API）
- ユーザープロフィール取得
- リッチメニュー、Flex Messageなどの高度なUI

### 2. Webhookの仕組み

#### Webhookイベントフロー

```
[ユーザー] → [LINEメッセージ送信]
    ↓
[LINE Platform] → [HTTP POST] → [Webhook URL]
    ↓
[開発者のサーバー] → [イベント処理]
    ↓
[LINE Platform] ← [Reply API] ← [開発者のサーバー]
    ↓
[ユーザー] ← [返信メッセージ]
```

#### Webhookイベントの種類

1. **Message Event**
    - ユーザーがメッセージを送信したとき
    - テキスト、画像、動画、スタンプなど複数のメッセージタイプをサポート

2. **Follow Event**
    - ユーザーがアカウントを友だち追加したとき

3. **Unfollow Event**
    - ユーザーがアカウントをブロックしたとき

4. **Postback Event**
    - ユーザーがポストバックアクションをタップしたとき

#### Webhookリクエストボディ構造

```json
{
    "destination": "U1234567890abcdef1234567890abcdef",
    "events": [
        {
            "type": "message",
            "message": {
                "type": "text",
                "id": "123456789012345678",
                "text": "今日の試合何がある？"
            },
            "webhookEventId": "01H1234567890ABCDEF",
            "deliveryContext": {
                "isRedelivery": false
            },
            "timestamp": 1234567890123,
            "source": {
                "type": "user",
                "userId": "U1234567890abcdef1234567890abcdef"
            },
            "replyToken": "b60d432864f44d079f6d8efe86cf404b",
            "mode": "active"
        }
    ]
}
```

### 3. メッセージ送信API

#### Reply API

- **用途**: Webhookイベントへの即座の返信
- **必須**: `replyToken`（Webhookイベントから取得）
- **制限**: 1つの`replyToken`で1回のみ使用可能、最大5メッセージまで送信可能
- **タイミング**: イベント受信後すぐに返信

**使用例**:

```typescript
POST https://api.line.me/v2/bot/message/reply

{
  "replyToken": "b60d432864f44d079f6d8efe86cf404b",
  "messages": [
    {
      "type": "text",
      "text": "検索結果を表示します"
    }
  ]
}
```

#### Push API

- **用途**: 任意のタイミングでメッセージを送信
- **必須**: `userId`（送信先のユーザーID）
- **制限**: 最大5メッセージまで送信可能
- **タイミング**: いつでも送信可能（プッシュ通知）

**使用例**:

```typescript
POST https://api.line.me/v2/bot/message/push

{
  "to": "U1234567890abcdef1234567890abcdef",
  "messages": [
    {
      "type": "text",
      "text": "新しい試合が追加されました"
    }
  ]
}
```

---

## 提案フロー設計

### アーキテクチャ概要

```
┌─────────────┐
│   ユーザー   │
└──────┬──────┘
       │
       │ 1. LINEメッセージ送信
       │    "今日の試合何がある？"
       ↓
┌─────────────────┐
│  LINE Platform  │
└────────┬────────┘
         │
         │ 2. Webhook POST
         │    /line-api/webhook
         ↓
┌────────────────────────────────┐
│  Supabase Edge Function        │
│  (line-api)                    │
│                                │
│  ┌──────────────────────────┐ │
│  │ Webhook Handler          │ │
│  │ - 署名検証               │ │
│  │ - イベント解析           │ │
│  └───────────┬──────────────┘ │
│              │                 │
│              │ 3. ユーザー認証確認
│              │                 │
│  ┌───────────▼──────────────┐ │
│  │ AI Search Service        │ │
│  │ - AI APIコール           │ │
│  │ - イベント検索           │ │
│  └───────────┬──────────────┘ │
│              │                 │
│              │ 4. 結果フォーマット
│              │                 │
│  ┌───────────▼──────────────┐ │
│  │ Message Builder          │ │
│  │ - Flex Message作成       │ │
│  │ - LIFF URLリンク追加     │ │
│  └───────────┬──────────────┘ │
└──────────────┼────────────────┘
               │
               │ 5. Reply API
               ↓
┌─────────────────┐
│  LINE Platform  │
└────────┬────────┘
         │
         │ 6. メッセージ配信
         ↓
┌─────────────┐
│   ユーザー   │
└─────────────┘
```

### 詳細フロー

#### Phase 1: メッセージ受信とバリデーション

1. **Webhook受信**
    - LINE Platformから`POST /line-api/webhook`にリクエスト受信
    - リクエストヘッダーに`x-line-signature`が含まれる

2. **署名検証**

    ```typescript
    import crypto from 'crypto'

    function verifySignature(
        body: string,
        signature: string,
        secret: string
    ): boolean {
        const hash = crypto
            .createHmac('sha256', secret)
            .update(body)
            .digest('base64')
        return hash === signature
    }
    ```

3. **イベント解析**
    - イベントタイプを確認（message, follow, postback等）
    - メッセージタイプを確認（text, image等）
    - テキストメッセージの場合、クエリとして処理

#### Phase 2: ユーザー認証とデータ取得

1. **ユーザーID取得**
    - Webhookイベントから`source.userId`を取得

2. **ユーザー認証状態確認**
    - Supabaseの`users`テーブルで`line_user_id`を検索
    - 未登録ユーザーの場合、LIFF認証を促すメッセージを返す

3. **ユーザー情報取得**
    - 既存の`authMiddleware`と同様の処理
    - ユーザーIDからイベントデータへのアクセス権限確認

#### Phase 3: AI検索実行

1. **AI検索APIコール**
    - 既存の`aiSearchEvents`サービスを再利用
    - ユーザーID + クエリテキストで検索実行

2. **検索結果処理**
    ```typescript
    const result = await aiSearchEvents(userId, messageText)
    // result: { aiMessage: string, events: Event[] }
    ```

#### Phase 4: メッセージフォーマット

1. **Flex Messageの作成**
    - 検索結果を視覚的に表示
    - 各イベントにLIFFアプリへのディープリンクを追加

2. **メッセージ構造例**
    ```json
    {
        "type": "flex",
        "altText": "検索結果: 3件のイベントが見つかりました",
        "contents": {
            "type": "bubble",
            "body": {
                "type": "box",
                "layout": "vertical",
                "contents": [
                    {
                        "type": "text",
                        "text": "検索結果",
                        "weight": "bold",
                        "size": "xl"
                    },
                    {
                        "type": "text",
                        "text": "今日の試合を3件見つけました",
                        "wrap": true,
                        "color": "#666666"
                    }
                ]
            },
            "footer": {
                "type": "box",
                "layout": "vertical",
                "contents": [
                    {
                        "type": "button",
                        "action": {
                            "type": "uri",
                            "label": "詳細を見る",
                            "uri": "https://liff.line.me/{liff-id}/calendar"
                        }
                    }
                ]
            }
        }
    }
    ```

#### Phase 5: メッセージ送信

1. **Reply API呼び出し**

    ```typescript
    import axios from 'axios'

    async function replyMessage(replyToken: string, messages: any[]) {
        await axios.post(
            'https://api.line.me/v2/bot/message/reply',
            {
                replyToken,
                messages,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
                },
            }
        )
    }
    ```

---

## 技術要件

### 必要な環境変数

```env
# LINE Messaging API
LINE_CHANNEL_ACCESS_TOKEN=your_channel_access_token
LINE_CHANNEL_SECRET=your_channel_secret

# LIFF（既存）
NEXT_PUBLIC_LIFF_ID=your_liff_id
NEXT_PUBLIC_ENABLE_LIFF=true
```

### 必要なLINE設定

1. **LINE Developers Consoleでの設定**
    - Messaging API チャンネル作成
    - Webhook URLの設定: `https://your-domain.com/line-api/webhook`
    - Webhook URLの検証
    - Channel Access Tokenの発行

2. **LIFFアプリとの連携**
    - 既存のLIFFアプリと同じLINE公式アカウントに関連付け
    - LIFF URLをメッセージ内リンクとして使用

### 新規実装が必要なコンポーネント

#### 1. LINE API Edge Function

**場所**: `supabase/functions/line-api/index.ts`

**機能**:

- Webhookエンドポイント
- 署名検証
- イベント処理
- メッセージ送信

**構造**:

```
supabase/functions/
├── line-api/
│   ├── index.ts          # メインエントリポイント
│   └── webhook-api.ts    # Webhook処理
└── _shared/
    ├── services/
    │   ├── lineMessageService.ts  # LINE Message API呼び出し
    │   └── lineWebhookService.ts  # Webhook処理ロジック
    ├── types/
    │   └── line-api-types.ts      # LINE API型定義
    └── utils/
        └── line-signature.ts       # 署名検証ユーティリティ
```

#### 2. 型定義

**場所**: `supabase/functions/_shared/types/line-api-types.ts`

```typescript
// Webhookイベント型
export interface LineWebhookEvent {
    type: 'message' | 'follow' | 'unfollow' | 'postback'
    timestamp: number
    source: {
        type: 'user' | 'group' | 'room'
        userId: string
    }
    replyToken: string
    mode: 'active' | 'standby'
}

export interface LineMessageEvent extends LineWebhookEvent {
    type: 'message'
    message: {
        type:
            | 'text'
            | 'image'
            | 'video'
            | 'audio'
            | 'file'
            | 'location'
            | 'sticker'
        id: string
        text?: string
    }
}

// Reply API型
export interface LineReplyRequest {
    replyToken: string
    messages: LineMessage[]
}

export interface LineMessage {
    type: 'text' | 'flex' | 'template'
    text?: string
    altText?: string
    contents?: any
}
```

#### 3. LINE Message Service

**場所**: `supabase/functions/_shared/services/lineMessageService.ts`

```typescript
export class LineMessageService {
    /**
     * Reply APIを使用してメッセージを返信
     */
    async replyMessage(
        replyToken: string,
        messages: LineMessage[]
    ): Promise<void>

    /**
     * Push APIを使用してメッセージを送信
     */
    async pushMessage(userId: string, messages: LineMessage[]): Promise<void>

    /**
     * イベント検索結果をFlex Messageに変換
     */
    buildEventResultMessage(
        events: Event[],
        aiMessage: string,
        liffUrl: string
    ): LineMessage
}
```

#### 4. LINE Webhook Service

**場所**: `supabase/functions/_shared/services/lineWebhookService.ts`

```typescript
export class LineWebhookService {
    /**
     * Webhookイベントを処理
     */
    async handleWebhookEvent(event: LineWebhookEvent): Promise<void>

    /**
     * メッセージイベントを処理
     */
    async handleMessageEvent(event: LineMessageEvent): Promise<void>

    /**
     * Followイベントを処理（友だち追加時）
     */
    async handleFollowEvent(event: LineWebhookEvent): Promise<void>
}
```

---

## 実装ステップ

### Step 1: LINE Developers設定

1. **Messaging APIチャンネル作成**
    - LINE Developers Consoleにログイン
    - 新しいProviderまたは既存のProviderを選択
    - Messaging APIチャンネルを作成

2. **Webhook URL設定**
    - Webhook URLを設定: `https://your-supabase-project.supabase.co/functions/v1/line-api/webhook`
    - Webhook送信を有効化

3. **認証情報取得**
    - Channel Secret取得
    - Channel Access Token発行

### Step 2: 環境変数設定

```bash
# .env に追加
LINE_CHANNEL_ACCESS_TOKEN=your_token_here
LINE_CHANNEL_SECRET=your_secret_here

# Supabase Functions環境変数にも設定
supabase secrets set LINE_CHANNEL_ACCESS_TOKEN=your_token_here
supabase secrets set LINE_CHANNEL_SECRET=your_secret_here
```

### Step 3: 型定義の実装

**ファイル**: `supabase/functions/_shared/types/line-api-types.ts`

LINE APIのリクエスト/レスポンス型を定義します。

### Step 4: ユーティリティ実装

**ファイル**: `supabase/functions/_shared/utils/line-signature.ts`

署名検証ロジックを実装します。

```typescript
import { createHmac } from 'node:crypto'

export function verifyLineSignature(
    body: string,
    signature: string,
    secret: string
): boolean {
    const hash = createHmac('sha256', secret).update(body).digest('base64')
    return hash === signature
}
```

### Step 5: サービス層の実装

#### 5-1. Line Message Service

**ファイル**: `supabase/functions/_shared/services/lineMessageService.ts`

Reply API、Push API、Flex Messageビルダーを実装します。

#### 5-2. Line Webhook Service

**ファイル**: `supabase/functions/_shared/services/lineWebhookService.ts`

Webhookイベント処理ロジックを実装します。

### Step 6: Edge Function実装

**ファイル**: `supabase/functions/line-api/index.ts`

```typescript
import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { initApi, apiHandler } from '_shared/middlewares/middleware'
import { verifyLineSignature } from '_shared/utils/line-signature'
import { LineWebhookService } from '_shared/services/lineWebhookService'

const app = initApi('/line-api')

// Webhook エンドポイント
app.post(
    '/webhook',
    apiHandler(async (c) => {
        // 1. 署名検証
        const signature = c.req.header('x-line-signature')
        const body = await c.req.text()
        const secret = Deno.env.get('LINE_CHANNEL_SECRET')!

        if (!verifyLineSignature(body, signature, secret)) {
            return c.json({ error: 'Invalid signature' }, 401)
        }

        // 2. イベント処理
        const webhookBody = JSON.parse(body)
        const webhookService = new LineWebhookService()

        for (const event of webhookBody.events) {
            await webhookService.handleWebhookEvent(event)
        }

        return c.json({ success: true })
    })
)

Deno.serve(app.fetch)
```

### Step 7: デプロイとテスト

1. **デプロイ**

    ```bash
    supabase functions deploy line-api
    ```

2. **Webhook検証**
    - LINE Developers ConsoleでWebhook URLを検証
    - テストメッセージを送信

3. **動作確認**
    - LINE公式アカウントを友だち追加
    - 「今日の試合何がある？」などのメッセージを送信
    - AIが検索結果を返信することを確認

### Step 8: import_map.json / deno.json 更新

**ファイル**: `supabase/functions/import_map.json`

```json
{
    "imports": {
        "_shared/services/lineMessageService": "./_shared/services/lineMessageService.ts",
        "_shared/services/lineWebhookService": "./_shared/services/lineWebhookService.ts",
        "_shared/types/line-api-types": "./_shared/types/line-api-types.ts",
        "_shared/utils/line-signature": "./_shared/utils/line-signature.ts"
    }
}
```

**ファイル**: `deno.json`

```json
{
    "imports": {
        "_shared/services/lineMessageService": "./supabase/functions/_shared/services/lineMessageService.ts",
        "_shared/services/lineWebhookService": "./supabase/functions/_shared/services/lineWebhookService.ts",
        "_shared/types/line-api-types": "./supabase/functions/_shared/types/line-api-types.ts",
        "_shared/utils/line-signature": "./supabase/functions/_shared/utils/line-signature.ts"
    }
}
```

---

## セキュリティとベストプラクティス

### 1. 署名検証

**MUST**: すべてのWebhookリクエストで署名を検証すること

```typescript
// 必ず実装
if (!verifyLineSignature(body, signature, secret)) {
    return c.json({ error: 'Invalid signature' }, 401)
}
```

### 2. エラーハンドリング

**MUST**: Webhookイベント処理は非同期・非ブロッキングで実行すること

```typescript
// 推奨パターン
for (const event of webhookBody.events) {
    try {
        await webhookService.handleWebhookEvent(event)
    } catch (error) {
        console.error('Failed to handle event:', event.webhookEventId, error)
        // ログを記録するが、エラーをthrowしない（他のイベント処理を妨げない）
    }
}
```

### 3. レート制限

**推奨**: Reply APIの呼び出し回数を管理

- 1つの`replyToken`は1回のみ使用可能
- 短時間に大量のリクエストを送信しない

### 4. ユーザー認証

**MUST**: LINEユーザーIDとSupabase usersテーブルを紐付けること

```typescript
// users テーブルに line_user_id カラムを追加
alter table users add column line_user_id text unique;

// Webhookイベント処理時にユーザー取得
const user = await db
  .select()
  .from(users)
  .where(eq(users.lineUserId, event.source.userId))
  .limit(1)

if (!user) {
  // 未登録ユーザーの場合、LIFF認証を促す
  await replyMessage(event.replyToken, [
    {
      type: 'text',
      text: 'まずはアプリにログインしてください'
    },
    {
      type: 'template',
      altText: 'ログイン',
      template: {
        type: 'buttons',
        text: 'LINEミニカレンダーを使用するには、まずログインが必要です',
        actions: [
          {
            type: 'uri',
            label: 'ログイン',
            uri: `https://liff.line.me/${LIFF_ID}/auth`
          }
        ]
      }
    }
  ])
}
```

### 5. ロギング

**推奨**: 以下の項目をログに記録

- リクエストタイムスタンプ
- Webhook Event ID
- ユーザーID
- メッセージ内容（個人情報を除く）
- API呼び出し結果

### 6. Webhook再配信対応

**推奨**: `deliveryContext.isRedelivery`を確認し、冪等性を確保

```typescript
if (event.deliveryContext?.isRedelivery) {
    console.log('This is a redelivered event:', event.webhookEventId)
    // 重複処理を避けるロジック
}
```

---

## 参考資料

### LINE Developers公式ドキュメント

1. **Messaging API概要**
    - URL: https://developers.line.biz/ja/docs/messaging-api/
    - 内容: Messaging APIの基本概念

2. **メッセージ受信（Webhook）**
    - URL: https://developers.line.biz/ja/docs/messaging-api/receiving-messages/
    - 内容: Webhookの詳細仕様、イベントタイプ

3. **メッセージ送信**
    - URL: https://developers.line.biz/ja/docs/messaging-api/sending-messages/
    - 内容: Reply API、Push APIの使い方

4. **Flex Message**
    - URL: https://developers.line.biz/ja/docs/messaging-api/using-flex-messages/
    - 内容: リッチなメッセージUIの作成方法

5. **LIFF（LINE Front-end Framework）**
    - URL: https://developers.line.biz/ja/docs/liff/
    - 内容: LIFFアプリの開発方法

6. **LINEミニアプリ**
    - URL: https://developers.line.biz/ja/docs/line-mini-app/
    - 内容: LINEミニアプリの概要と開発ガイドライン

### プロジェクト内ドキュメント

1. **ガイドライン**: `.docs/guideline.md`
    - コーディング規約、アーキテクチャパターン

2. **認証フロー**: `.docs/authentication-flow.md`
    - LIFF認証の実装詳細

3. **LINEミニアプリドキュメント**: `.docs/line-mini-app.md`
    - LINEミニアプリ化の計画

### 既存実装参照

1. **AI API**: `supabase/functions/ai-api/index.ts`
    - AI検索・登録APIの実装

2. **AI Service**: `supabase/functions/_shared/services/aiEventService.ts`
    - AI検索ロジック

3. **LIFF Client**: `src/lib/liff-client.ts`
    - LIFF SDK初期化

---

## まとめ

### 実装の全体像

1. **現在**: Web UIからのAI検索が可能
2. **追加**: LINEメッセージからのAI検索を実現
3. **連携**: LIFFアプリとMessaging APIを統合

### 次のアクションアイテム

- [ ] LINE Developers ConsoleでMessaging APIチャンネル作成
- [ ] Webhook URLの設定と検証
- [ ] `line-api` Edge Functionの実装
- [ ] Line Message Serviceの実装
- [ ] Line Webhook Serviceの実装
- [ ] 型定義の追加
- [ ] import_map.json / deno.json更新
- [ ] デプロイとテスト
- [ ] ユーザーテーブルに`line_user_id`カラム追加

### 期待される成果

- ユーザーがLINEメッセージで「今日の試合何がある？」と送信
- ボットがAI検索を実行し、結果をFlex Messageで返信
- ユーザーがLIFFアプリで詳細を確認できる
- シームレスなUXを提供

---

**レポート作成者**: Claude Code
**最終更新**: 2025-10-16
