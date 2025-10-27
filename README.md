## EIKO

### envの設定

- .env.exampleのコピー

```bash
cp .env.example .env
```

### docker立ち上げ

```bash
make up
```

### 立ち上げ

- node_modulesのインストール

```bash
yarn
```

- 開発サーバー起動

```bash
yarn dev
```

### LINE認証のテスト

#### モックLIFFを使用したテスト（開発環境）

1. `.env`ファイルで以下を設定:

```env
NEXT_PUBLIC_ENABLE_LIFF=true
NEXT_PUBLIC_USE_MOCK_LIFF=true
NEXT_PUBLIC_LIFF_ID=mock-liff-id
```

2. 開発サーバーを起動:

```bash
yarn dev
```

3. `/auth`ページにアクセス
4. 「LINEでログイン」ボタンをクリック
5. モックLIFFが自動的にログイン処理を実行
6. ログイン成功後、`/`ページにリダイレクト

#### 実際のLIFF SDKを使用したテスト（本番環境）

1. [LINE Developers Console](https://developers.line.biz/console/)でLIFFアプリを作成
2. LIFF IDを取得
3. `.env`ファイルで以下を設定:

```env
NEXT_PUBLIC_ENABLE_LIFF=true
NEXT_PUBLIC_USE_MOCK_LIFF=false
NEXT_PUBLIC_LIFF_ID=your-actual-liff-id
LINE_LIFF_ID=your-actual-liff-id
```

4. HTTPS環境でアプリを起動（ngrok, Cloudflare Tunnelなど）
5. LINE内ブラウザまたはブラウザで`/auth`にアクセス
6. 「LINEでログイン」ボタンをクリック
7. LINE認証画面でログイン
8. ログイン成功後、`/`ページにリダイレクト

### LINE Messaging API連携

このアプリケーションは、LINE Messaging APIと連携してLINEメッセージからのAIイベント検索機能を提供します。

#### 必要な環境変数

LINE Messaging API機能を使用するには、以下の環境変数を設定する必要があります:

```env
# LINE Messaging API Configuration
LINE_CHANNEL_ACCESS_TOKEN=your-channel-access-token
LINE_CHANNEL_SECRET=your-channel-secret
NEXT_PUBLIC_LIFF_ID=your-liff-id
```

#### セットアップ手順

詳細なセットアップ手順は以下のドキュメントを参照してください:

1. **実装タスク**: `.tasks/2025_10_16_02_tasks.md`
2. **デプロイガイド**: `.docs/deployment/line-messaging-api-deployment.md`
3. **調査レポート**: `.docs/reports/line-messaging-ai-event-search-flow.md`

#### 主な機能

- **未認証ユーザー対応**: LINEメッセージを送信すると、ログイン促進メッセージが返信されます
- **AI検索**: 認証済みユーザーは、LINEメッセージでAIを使ったイベント検索が可能です
    - 例: 「今日の試合は?」「明日のプレミアリーグの試合」
- **Flex Message**: 検索結果はLINEの美しいFlex Messageで表示されます
- **Webhook署名検証**: セキュアなHMAC-SHA256署名検証を実装

#### アーキテクチャ

```
LINE Platform
  ↓ (Webhook)
Supabase Edge Function (line-api)
  ↓
LineWebhookService
  ├─ 未認証ユーザー → ログイン促進メッセージ
  └─ 認証済みユーザー → AI検索 → Flex Message
```

#### デプロイ

```bash
# 環境変数設定
supabase secrets set LINE_CHANNEL_ACCESS_TOKEN="your-token"
supabase secrets set LINE_CHANNEL_SECRET="your-secret"

# Edge Functionデプロイ
supabase functions deploy line-api

# Webhook URL設定
# LINE Developers ConsoleでWebhook URLを設定:
# https://your-project.supabase.co/functions/v1/line-api/webhook
```

詳細は`.docs/deployment/line-messaging-api-deployment.md`を参照してください。

### バックエンドはコーポレートサイト
