# LINE Messaging API デプロイメントガイド

**作成日**: 2025-10-16
**対象**: LINEミニカレンダー - LINE Messaging API連携機能
**前提**: Step 1-6の実装が完了していること

---

## 目次

1. [概要](#概要)
2. [デプロイ前の準備](#デプロイ前の準備)
3. [デプロイ手順](#デプロイ手順)
4. [動作確認](#動作確認)
5. [トラブルシューティング](#トラブルシューティング)
6. [ロールバック手順](#ロールバック手順)

---

## 概要

このドキュメントは、LINE Messaging API連携機能のデプロイ手順を説明します。

### デプロイ対象

- **Edge Function**: `line-api`
- **Webhook エンドポイント**: `/line-api/webhook`
- **環境変数**: `LINE_CHANNEL_ACCESS_TOKEN`, `LINE_CHANNEL_SECRET`, `NEXT_PUBLIC_LIFF_ID`

### デプロイフロー

```
1. 環境変数設定
   ↓
2. Edge Functionデプロイ
   ↓
3. Webhook URL設定
   ↓
4. 動作確認
```

---

## デプロイ前の準備

### 1. LINE Developers Console設定の確認

以下の情報が取得済みであることを確認してください。

- ✅ LINE Channel Secret
- ✅ LINE Channel Access Token
- ✅ LIFF ID（`NEXT_PUBLIC_LIFF_ID`）

> 未取得の場合は、`.tasks/2025_10_16_02_tasks.md`の「UserTask 1」を参照してください。

### 2. ローカル環境での動作確認

デプロイ前に、ローカル環境で動作確認を行います。

```bash
# 1. 環境変数の設定（.envファイル）
# .envファイルに以下を追加
LINE_CHANNEL_ACCESS_TOKEN=your_channel_access_token
LINE_CHANNEL_SECRET=your_channel_secret
NEXT_PUBLIC_LIFF_ID=your_liff_id

# 2. Supabase Functions のローカル起動
supabase start
supabase functions serve line-api

# 3. テストリクエスト送信（別ターミナル）
curl -X POST http://localhost:54321/functions/v1/line-api/webhook \
  -H "Content-Type: application/json" \
  -H "X-Line-Signature: test" \
  -d '{
    "destination": "test",
    "events": []
  }'
```

### 3. コードの最終チェック

```bash
# フォーマット・型チェック・Lint・テスト実行
yarn format
yarn type-check
yarn lint
yarn test
```

すべて成功することを確認してください。

---

## デプロイ手順

### Step 1: Supabase Functionsへの環境変数設定

Supabase Functionsに必要な環境変数を設定します。

```bash
# LINE Channel Access Token設定
supabase secrets set LINE_CHANNEL_ACCESS_TOKEN="取得したChannel Access Token"

# LINE Channel Secret設定
supabase secrets set LINE_CHANNEL_SECRET="取得したChannel Secret"

# LIFF ID設定（既に設定済みの場合はスキップ）
supabase secrets set NEXT_PUBLIC_LIFF_ID="取得したLIFF ID"

# 設定確認
supabase secrets list
```

**出力例**:

```
NAME                         VALUE (TRUNCATED)
LINE_CHANNEL_ACCESS_TOKEN    eyJhbGciOiJIUzI1NiIsInR5cCI6Ik...
LINE_CHANNEL_SECRET          1234567890abcdef1234567890abcdef
NEXT_PUBLIC_LIFF_ID          1234567890-AbCdEfGh
```

---

### Step 2: Edge Functionのデプロイ

`line-api` Edge Functionをデプロイします。

```bash
# line-api Edge Functionをデプロイ
supabase functions deploy line-api

# デプロイ成功の確認
supabase functions list
```

**成功メッセージ例**:

```
Deployed Function line-api on project xxxx

Function URL: https://xxxx.supabase.co/functions/v1/line-api
```

---

### Step 3: Webhook URL設定

LINE Developers ConsoleにWebhook URLを設定します。

#### 3-1. Webhook URLの確認

```bash
# Supabase Project URLを確認
supabase status

# 出力例
# API URL: https://xxxx.supabase.co
```

Webhook URLは以下の形式になります:

```
https://xxxx.supabase.co/functions/v1/line-api/webhook
```

#### 3-2. LINE Developers Consoleでの設定

1. [LINE Developers Console](https://developers.line.biz/console/)にアクセス
2. 対象のMessaging APIチャンネルを選択
3. 「Messaging API設定」タブをクリック
4. 「Webhook URL」セクションで以下を実施:
    - Webhook URL: `https://xxxx.supabase.co/functions/v1/line-api/webhook`
    - 「更新」ボタンをクリック
    - 「検証」ボタンをクリック
5. 検証成功のメッセージを確認
6. 「Webhookの利用」を**ON**にする

#### 3-3. 応答設定の確認

「Messaging API設定」タブで以下を確認:

- ✅ **応答メッセージ**: OFF（無効）
- ✅ **Webhook**: ON（有効）
- ✅ **Webhookの再送**: ON（推奨）

---

## 動作確認

### 1. Health Check

Edge FunctionのHealth Checkエンドポイントを確認します。

```bash
# Health Checkエンドポイントにアクセス
curl https://xxxx.supabase.co/functions/v1/line-api

# 成功レスポンス例
# {"message":"LINE API is running","timestamp":"2025-10-16T12:00:00.000Z"}
```

### 2. ログ確認

Edge Functionのログをリアルタイムで確認します。

```bash
# ログのリアルタイム監視
supabase functions logs line-api --tail

# 特定の時間範囲のログ確認
supabase functions logs line-api --since 1h
```

### 3. LINE Botとの対話テスト

#### テストケース1: 未認証ユーザー

1. LINE公式アカウントを友だち追加（まだの場合）
2. LIFFアプリに**ログインせず**にメッセージを送信
    - 例: 「今日のイベントは？」
3. 以下のメッセージが返信されることを確認:
    - 「ログインが必要です」
    - 「アプリを開く」ボタンが表示される

#### テストケース2: 認証済みユーザー

1. LIFFアプリでログイン
2. LINEメッセージでAI検索を実行
    - 例: 「今日の試合は？」
3. 以下のレスポンスが返信されることを確認:
    - AI検索結果のFlex Message
    - イベントリストが表示される
    - 「すべて見る」ボタンが表示される

#### テストケース3: フォローイベント

1. LINE公式アカウントをブロック後、再度友だち追加
2. Welcomeメッセージが表示されることを確認:
    - 「友だち追加ありがとうございます!」
    - 使い方の説明
    - 「アプリを開く」ボタン

#### テストケース4: エラーハンドリング

1. テキスト以外のメッセージを送信（画像、スタンプ等）
2. 以下のメッセージが返信されることを確認:
    - 「申し訳ございません。テキストメッセージのみ対応しています。」

### 4. パフォーマンス確認

```bash
# ログでレスポンス時間を確認
supabase functions logs line-api --tail

# 目安: Webhook処理は5秒以内に完了すること
```

---

## トラブルシューティング

### 問題1: Webhook検証が失敗する

**原因**:

- 環境変数が正しく設定されていない
- Edge Functionがデプロイされていない

**解決方法**:

```bash
# 1. 環境変数の確認
supabase secrets list

# 2. Edge Functionのデプロイ確認
supabase functions list

# 3. ログで詳細エラー確認
supabase functions logs line-api --tail
```

### 問題2: 署名検証エラー

**ログ出力例**:

```
Error: Invalid LINE signature
```

**原因**:

- `LINE_CHANNEL_SECRET`が間違っている

**解決方法**:

```bash
# Channel Secretを再設定
supabase secrets set LINE_CHANNEL_SECRET="正しいChannel Secret"

# Edge Functionを再デプロイ
supabase functions deploy line-api
```

### 問題3: メッセージが返信されない

**原因**:

- Webhookが有効になっていない
- 応答メッセージが有効になっている（競合）
- ユーザー認証に失敗している

**解決方法**:

```bash
# 1. ログで詳細確認
supabase functions logs line-api --tail

# 2. LINE Developers Consoleで設定確認
# - Webhook: ON
# - 応答メッセージ: OFF

# 3. DBでユーザー存在確認（認証済みユーザーの場合）
# Supabase Dashboardでusersテーブルを確認
```

### 問題4: AI検索が動作しない

**原因**:

- Gemini APIキーが設定されていない
- `aiEventService`でエラーが発生している

**解決方法**:

```bash
# 1. Gemini APIキーの確認
supabase secrets list | grep GEMINI

# 2. ai-api Edge Functionのログ確認
supabase functions logs ai-api --tail

# 3. 必要に応じてGemini APIキーを設定
supabase secrets set GEMINI_API_KEY="your_gemini_api_key"
```

### 問題5: タイムアウトエラー

**ログ出力例**:

```
Error: Function execution timed out
```

**原因**:

- AI検索処理に時間がかかりすぎている
- 外部API呼び出しがタイムアウト

**解決方法**:

- AI検索のタイムアウト設定を調整
- 非同期処理の最適化
- キャッシュ機構の導入を検討

---

## ロールバック手順

デプロイに問題がある場合は、以下の手順でロールバックします。

### 1. Edge Functionのロールバック

```bash
# 1. デプロイ履歴確認
supabase functions list --with-versions line-api

# 2. 以前のバージョンにロールバック（該当バージョンを再デプロイ）
# Gitで以前のコミットをチェックアウトして再デプロイ
git checkout <previous-commit-hash>
supabase functions deploy line-api
git checkout main  # 元のブランチに戻る
```

### 2. Webhook無効化（緊急時）

```bash
# LINE Developers Consoleで「Webhookの利用」をOFFにする
```

これにより、一時的にWebhook処理を停止できます。

### 3. 環境変数の復元

```bash
# 以前の環境変数を再設定
supabase secrets set LINE_CHANNEL_ACCESS_TOKEN="以前のトークン"
supabase secrets set LINE_CHANNEL_SECRET="以前のシークレット"
```

---

## まとめ

### デプロイチェックリスト

- ✅ 環境変数がSupabase Functionsに設定されている
- ✅ `line-api` Edge Functionがデプロイされている
- ✅ Webhook URLがLINE Developers Consoleに設定されている
- ✅ Webhook検証が成功している
- ✅ 応答メッセージが無効化されている
- ✅ Webhookの利用が有効化されている
- ✅ Health Checkエンドポイントが正常に応答する
- ✅ 未認証ユーザー・認証済みユーザーの動作確認が完了
- ✅ エラーハンドリングが正しく動作する

---

**作成者**: Claude Code
**最終更新**: 2025-10-16
