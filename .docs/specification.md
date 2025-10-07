# LINEミニカレンダー アプリケーション仕様書

## 目次

1. [概要](#概要)
2. [システムアーキテクチャ](#システムアーキテクチャ)
3. [機能要件](#機能要件)
4. [データベース設計](#データベース設計)
5. [API設計](#api設計)
6. [画面設計](#画面設計)
7. [技術スタック](#技術スタック)
8. [開発ロードマップ](#開発ロードマップ)

---

## 概要

### アプリケーション名

**LINEミニカレンダー**

### 目的

スポーツイベント（プレミアリーグ、WBC等）や配信予定（Netflix等）をカレンダーに登録・管理できるWebアプリケーション。
将来的にLINEミニアプリ化を予定しており、LINEメッセージからAIを使って自然言語でイベント登録・検索が可能になる。

### 主要機能

1. **手動イベント登録**: アプリ画面から直接イベントを登録
2. **カレンダー表示**: 日/週/月表示に対応
3. **イベント管理**: 編集・削除機能
4. **AIイベント検索**: 自然言語でイベント検索（将来機能）
5. **AIイベント登録**: 自然言語でイベント登録（将来機能）
6. **リマインダー通知**: イベント開始前に通知（将来機能）

### 開発アプローチ

**段階的リリース戦略**

- **Phase 1 (MVP)**: 通常のNext.jsアプリとして基本機能を実装
- **Phase 2**: AI機能の統合
- **Phase 3**: LINE連携（認証・ミニアプリ化・Messaging API）

### 対象ユーザー

- スポーツファン（特にサッカー、野球等）
- 配信コンテンツを追いかけたいユーザー
- スケジュール管理をLINEで完結させたいユーザー

---

## システムアーキテクチャ

### Phase 1 (MVP) アーキテクチャ

```
┌───────────────────────────────────────────────────┐
│              Next.js App (Frontend)               │
│  ┌────────────────┐  ┌──────────────────────┐   │
│  │  Calendar View │  │   Event Management   │   │
│  │  - 日/週/月表示 │  │   - 登録/編集/削除    │   │
│  └───────┬────────┘  └──────────┬───────────┘   │
└──────────┼───────────────────────┼───────────────┘
           │                       │
           │  API Routes (REST)    │
           │                       │
┌──────────▼───────────────────────▼───────────────┐
│              Supabase (Backend Platform)         │
│                                                   │
│  ┌─────────────────────────────────────────┐   │
│  │   Edge Functions (Deno Runtime)         │   │
│  │   ┌──────────────────────┐              │   │
│  │   │   Calendar API       │              │   │
│  │   │  (イベントCRUD)      │              │   │
│  │   └──────────────────────┘              │   │
│  └─────────────────────────────────────────┘   │
│                                                   │
│  ┌─────────────────────────────────────────┐   │
│  │  PostgreSQL Database (Drizzle ORM)      │   │
│  │  ┌────────┐  ┌────────┐                │   │
│  │  │ users  │  │ events │                │   │
│  │  └────────┘  └────────┘                │   │
│  └─────────────────────────────────────────┘   │
│                                                   │
│  ┌─────────────────────────────────────────┐   │
│  │         Authentication (Simple)          │   │
│  │  - Email/Password (Supabase Auth)       │   │
│  └─────────────────────────────────────────┘   │
└───────────────────────────────────────────────────┘
```

### Phase 3 (最終) アーキテクチャ

```
┌──────────────────────────────────────────────────────────┐
│                     LINE Platform                        │
│  ┌────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │ LINE Login │  │ Messaging   │  │   LIFF      │     │
│  │   (OAuth)  │  │     API     │  │ (Mini App)  │     │
│  └──────┬─────┘  └──────┬──────┘  └──────┬──────┘     │
└─────────┼────────────────┼─────────────────┼────────────┘
          │                │                 │
          │                │                 │
┌─────────▼────────────────▼─────────────────▼────────────┐
│              Supabase (Backend Platform)                 │
│                                                           │
│  ┌─────────────────────────────────────────────────┐   │
│  │         Edge Functions (Deno Runtime)           │   │
│  │  ┌──────────────┐  ┌──────────────────────┐    │   │
│  │  │  Webhook API │  │   Calendar API       │    │   │
│  │  │  (LINE受信)  │  │  (イベントCRUD)      │    │   │
│  │  └──────┬───────┘  └──────────────────────┘    │   │
│  │         │                                        │   │
│  │  ┌──────▼───────────────────────────────┐      │   │
│  │  │     AI Processing (Gemini API)       │      │   │
│  │  │  - メッセージ解析                     │      │   │
│  │  │  - イベント情報抽出                   │      │   │
│  │  │  - Web検索統合                        │      │   │
│  │  └──────────────────────────────────────┘      │   │
│  └─────────────────────────────────────────────────┘   │
│                                                           │
│  ┌─────────────────────────────────────────────────┐   │
│  │         PostgreSQL Database (Drizzle ORM)       │   │
│  │  ┌────────┐  ┌────────┐  ┌────────────────┐   │   │
│  │  │ users  │  │ events │  │   reminders    │   │   │
│  │  └────────┘  └────────┘  └────────────────┘   │   │
│  └─────────────────────────────────────────────────┘   │
│                                                           │
│  ┌─────────────────────────────────────────────────┐   │
│  │         Cron Jobs (定期実行)                     │   │
│  │  - リマインダー通知送信 (毎時実行)              │   │
│  └─────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────────┘
                          │
┌─────────────────────────▼─────────────────────────┐
│              Next.js App (Frontend)               │
│  ┌────────────────┐  ┌──────────────────────┐   │
│  │  Calendar View │  │   Event Management   │   │
│  │  - 日/週/月表示 │  │   - 登録/編集/削除    │   │
│  └────────────────┘  └──────────────────────┘   │
└───────────────────────────────────────────────────┘
```

### データフロー (Phase 1 MVP)

#### 1. イベント手動登録フロー

```
[ユーザー] → [Next.jsアプリ] → [Calendar API] → [PostgreSQL]
                                              ↓
                                      [イベント登録完了]
```

#### 2. イベント一覧取得フロー

```
[ユーザー] → [Next.jsアプリ] → [Calendar API] → [PostgreSQL]
                                              ↓
                                      [イベント一覧を表示]
```

#### 3. イベント編集・削除フロー

```
[ユーザー] → [Next.jsアプリ] → [Calendar API] → [PostgreSQL]
                                              ↓
                                      [イベント更新/削除完了]
```

### データフロー (Phase 2-3 将来機能)

#### 4. AIイベント検索フロー (Phase 2)

```
[ユーザー] → [LINEトーク] 「今日の試合何がある」
                ↓
         [LINE Platform] (Webhook)
                ↓
         [Webhook API]
                ↓
         [Gemini AI] メッセージ解析
                ↓
         [PostgreSQL] DB検索
                ↓
         [LINE Messaging API] 返信
                ↓
         [ユーザーのLINE] 「今日の試合は以下の3件です...」
```

#### 5. AIイベント登録フロー (Phase 2)

```
[ユーザー] → [LINEトーク] 「トットナムの試合の日程を登録して」
                ↓
         [LINE Platform] (Webhook)
                ↓
         [Webhook API]
                ↓
         [Gemini AI] + [Web検索] 試合情報取得
                ↓
         [LINE Messaging API] 確認メッセージ送信
                ↓
         [ユーザー] 確認・承認
                ↓
         [PostgreSQL] イベント登録
                ↓
         [LINE Messaging API] 完了通知
```

#### 6. リマインダー通知フロー (Phase 3)

```
[Cron Job] (毎時0分実行)
      ↓
[PostgreSQL] 1時間後のイベント取得
      ↓
[LINE Messaging API] プッシュ通知
      ↓
[ユーザーのLINE] 「🔔 まもなく開始します...」
```

---

## 機能要件

### 優先度定義（改訂版）

- **P0-MVP**: Phase 1 MVP必須機能（基本のカレンダーアプリ）
- **P1-AI**: Phase 2 AI機能
- **P2-LINE**: Phase 3 LINE連携機能
- **P3-Future**: 将来的な機能

---

### 1. ユーザー管理・認証

#### 1.1 シンプル認証 [P0-MVP]

**機能概要**

- Supabase Authを使用した認証
- Email/Passwordでのサインアップ・ログイン

**実装詳細**

- Supabase Auth統合
- セッション管理
- パスワードリセット機能

**データ取得項目**

- Email（必須）
- パスワード（必須）
- 表示名（任意）

#### 1.2 LINE認証 [P2-LINE]

**機能概要**

- LINE Loginを使用したOAuth認証
- ユーザー情報の自動取得（名前、アイコン、LINE User ID）

**実装詳細**

- LINE Login SDK統合
- Supabase Authとの連携
- 既存アカウントとのマージ機能

**データ取得項目**

- LINE User ID（必須）
- 表示名
- プロフィール画像URL

#### 1.3 ユーザープロフィール [P3-Future]

**機能概要**

- ユーザー設定の管理
- 通知設定
- カテゴリカラー設定

---

### 2. イベント管理

#### 2.1 イベント手動登録 [P0-MVP]

**機能概要**

- アプリ画面からイベントを登録

**入力項目**

- イベント名（必須）
- 内容/説明（任意）
- 日付（必須）
- 開始時間（必須）
- 終了時間（必須）
- アイコン/画像（任意、デフォルトアイコン提供）
- カテゴリ（必須、ドロップダウン選択）
    - プレミアリーグ
    - セリエA
    - ラ・リーガ
    - ブンデスリーガ
    - WBC
    - Netflix
    - その他（カスタム）

**バリデーション**

- 必須項目チェック
- 日時の妥当性チェック（開始時間 < 終了時間）
- 文字数制限
    - イベント名: 100文字以内
    - 内容: 1000文字以内

#### 2.2 イベント編集 [P0-MVP]

**機能概要**

- 登録済みイベントの編集

**編集可能項目**

- すべての登録項目を編集可能

**制約**

- 過去のイベントも編集可能

#### 2.3 イベント削除 [P0-MVP]

**機能概要**

- イベントの削除（ソフトデリート）

**確認ダイアログ**

- 削除前に確認メッセージ表示

#### 2.4 イベント詳細表示 [P0-MVP]

**機能概要**

- イベントの詳細情報を表示

**表示項目**

- すべての登録情報
- 作成日時
- 更新日時
- リマインダー設定状況

---

### 3. カレンダー表示

#### 3.1 日表示 [P0-MVP]

**機能概要**

- 今日の予定を時間軸で表示

**表示内容**

- 時間軸（0:00〜24:00）
- イベントをタイムライン形式で表示
- イベントはカテゴリごとに色分け

**操作**

- 日付切り替え（前日/翌日）
- イベントタップで詳細表示

#### 3.2 週表示 [P0-MVP]

**機能概要**

- 1週間の予定を表示

**表示内容**

- 月曜〜日曜の7日間
- 各日のイベントを表示
- イベント数が多い場合は「他N件」と表示

**操作**

- 週の切り替え（前週/翌週）
- 日付タップで日表示に遷移
- イベントタップで詳細表示

#### 3.3 月表示 [P0-MVP]

**機能概要**

- カレンダー形式で1ヶ月の予定を表示

**表示内容**

- 月間カレンダーグリッド
- 各日にイベントをドット表示（最大3つ）
- 今日の日付をハイライト

**操作**

- 月の切り替え（前月/翌月）
- 日付タップで日表示に遷移

#### 3.4 カテゴリカラー設定 [P3-Future]

**機能概要**

- カテゴリごとの表示色を設定

**デフォルトカラー**

- プレミアリーグ: #E91E63（ピンク）
- セリエA: #2196F3（青）
- ラ・リーガ: #FF9800（オレンジ）
- WBC: #4CAF50（緑）
- Netflix: #E50914（Netflix赤）
- その他: #9E9E9E（グレー）

**カスタマイズ**

- ユーザーが自由に色を変更可能
- プリセットカラーパレット提供

---

### 4. AIイベント検索

#### 4.1 イベント検索 [P1-AI]

**機能概要**

- LINEトークから自然言語でイベント検索

**対応クエリ例**

- 「今日の試合何がある」
- 「明日のイベント教えて」
- 「今週のトットナムの試合は？」
- 「Netflixの配信予定は？」

**AI処理フロー**

1. ユーザーのメッセージを受信
2. Gemini APIでメッセージを解析
    - 検索対象日（今日、明日、今週等）
    - カテゴリフィルター（トットナム、Netflix等）
3. データベースから該当イベントを検索
4. 結果を整形してLINEメッセージで返信

**レスポンス形式**

```
【今日の予定】

⚽ 20:00-22:00 プレミアリーグ
トットナム vs アーセナル

📺 21:00-22:00 Netflix
新作ドラマ「〇〇」配信

全2件のイベント
詳細を見る → [ミニアプリへのリンク]
```

**エラーハンドリング**

- イベントが見つからない場合: 「該当するイベントは見つかりませんでした」
- 解析に失敗した場合: 「申し訳ございません。もう一度お試しください」

---

### 5. AIイベント登録

#### 5.1 イベント登録 [P1-AI]

**機能概要**

- LINEトークから自然言語でイベント登録

**対応クエリ例**

- 「トットナムの試合の日程を登録して」
- 「明日のNetflix新作を登録」
- 「来週のWBCの試合を登録して」

**AI処理フロー**

1. ユーザーのメッセージを受信
2. Gemini APIでメッセージを解析
    - イベント名の抽出
    - カテゴリの推定
    - 日時の推定
3. Web検索で詳細情報を取得
    - Google検索APIまたはGemini Web検索機能
    - 試合日程、配信予定等を取得
4. 複数の候補がある場合、確認メッセージを送信
5. ユーザーが選択・承認
6. データベースに登録
7. 完了通知を送信

**確認メッセージ形式**

```
以下のイベントを登録しますか？

⚽ プレミアリーグ
トットナム vs アーセナル
📅 2025年10月8日（水）20:00-22:00

[登録する] [キャンセル]
```

**複数候補がある場合**

```
トットナムの試合が3件見つかりました。

1. 10/8(水) 20:00 vs アーセナル
2. 10/12(日) 15:00 vs チェルシー
3. 10/15(水) 21:00 vs マンチェスター

登録したい試合の番号を返信してください。
または「全て登録」と返信してください。
```

**エラーハンドリング**

- 情報が見つからない場合: 「情報が見つかりませんでした。手動で登録しますか？」
- 解析に失敗した場合: 「申し訳ございません。もう一度詳しく教えてください」

---

### 6. リマインダー通知

#### 6.1 リマインダー設定 [P2-LINE]

**機能概要**

- イベント開始前に通知

**通知タイミング設定**

- 1日前
- 3時間前
- 1時間前
- 30分前
- カスタム（ユーザーが指定）

**デフォルト設定**

- 1時間前に通知（すべてのイベント）

#### 6.2 通知送信 [P2-LINE]

**実装方式**

- Supabase Cron Jobsで毎時0分に実行
- 該当時刻のリマインダーを検索
- LINE Messaging APIでプッシュ通知

**通知メッセージ形式**

```
🔔 まもなく開始します

⚽ プレミアリーグ
トットナム vs アーセナル
📅 20:00開始（1時間後）

詳細を見る → [ミニアプリへのリンク]
```

---

### 7. LINE連携機能

#### 7.1 Messaging API（Webhook） [P2-LINE]

**機能概要**

- LINE Platformからメッセージを受信
- AI処理後、LINEに返信

**Webhook設定**

- エンドポイント: `https://your-project.supabase.co/functions/v1/line-webhook`
- イベントタイプ: `message`, `postback`

**セキュリティ**

- LINE署名検証
- Webhook URLの秘匿化

#### 7.2 LIFF（LINE Front-end Framework） [P2-LINE]

**機能概要**

- LINEアプリ内でミニアプリを表示

**LIFF ID設定**

- サイズ: Full
- エンドポイント URL: Next.jsアプリのURL

---

## データベース設計

### ER図

```
┌─────────────────┐
│     users       │
├─────────────────┤
│ id (PK)         │
│ line_user_id    │ UNIQUE
│ display_name    │
│ profile_image   │
│ email           │
│ created_at      │
│ updated_at      │
└────────┬────────┘
         │
         │ 1:N
         │
┌────────▼────────────────┐
│       events            │
├─────────────────────────┤
│ id (PK)                 │
│ user_id (FK)            │
│ title                   │
│ description             │
│ category                │
│ icon_url                │
│ start_datetime          │
│ end_datetime            │
│ color                   │
│ is_deleted              │
│ created_at              │
│ updated_at              │
└────────┬────────────────┘
         │
         │ 1:N
         │
┌────────▼────────────────┐
│      reminders          │
├─────────────────────────┤
│ id (PK)                 │
│ event_id (FK)           │
│ remind_at               │
│ is_sent                 │
│ created_at              │
└─────────────────────────┘

┌─────────────────────────┐
│      categories         │
├─────────────────────────┤
│ id (PK)                 │
│ user_id (FK)            │ (NULL = システムデフォルト)
│ name                    │
│ color                   │
│ icon                    │
│ is_system_default       │
│ created_at              │
└─────────────────────────┘
```

### テーブル定義

#### users テーブル

| カラム名      | 型           | NULL | デフォルト | 説明                     |
| ------------- | ------------ | ---- | ---------- | ------------------------ |
| id            | UUID         | NO   | gen_random | 主キー                   |
| line_user_id  | VARCHAR(255) | NO   | -          | LINE User ID（ユニーク） |
| display_name  | VARCHAR(100) | YES  | NULL       | 表示名                   |
| profile_image | TEXT         | YES  | NULL       | プロフィール画像URL      |
| email         | VARCHAR(255) | YES  | NULL       | メールアドレス           |
| created_at    | TIMESTAMP    | NO   | NOW()      | 作成日時                 |
| updated_at    | TIMESTAMP    | NO   | NOW()      | 更新日時                 |

**インデックス**

- `line_user_id` (UNIQUE)
- `created_at`

---

#### events テーブル

| カラム名       | 型           | NULL | デフォルト | 説明                   |
| -------------- | ------------ | ---- | ---------- | ---------------------- |
| id             | UUID         | NO   | gen_random | 主キー                 |
| user_id        | UUID         | NO   | -          | ユーザーID（外部キー） |
| title          | VARCHAR(100) | NO   | -          | イベント名             |
| description    | TEXT         | YES  | NULL       | 説明                   |
| category       | VARCHAR(50)  | NO   | 'other'    | カテゴリ               |
| icon_url       | TEXT         | YES  | NULL       | アイコンURL            |
| start_datetime | TIMESTAMP    | NO   | -          | 開始日時               |
| end_datetime   | TIMESTAMP    | NO   | -          | 終了日時               |
| color          | VARCHAR(7)   | YES  | NULL       | 表示色（HEX形式）      |
| is_deleted     | BOOLEAN      | NO   | FALSE      | 削除フラグ             |
| created_at     | TIMESTAMP    | NO   | NOW()      | 作成日時               |
| updated_at     | TIMESTAMP    | NO   | NOW()      | 更新日時               |

**インデックス**

- `user_id`
- `start_datetime`
- `category`
- `is_deleted`
- `(user_id, start_datetime)` (複合)

**外部キー制約**

- `user_id` REFERENCES `users(id)` ON DELETE CASCADE

**チェック制約**

- `start_datetime < end_datetime`

---

#### reminders テーブル

| カラム名   | 型        | NULL | デフォルト | 説明                   |
| ---------- | --------- | ---- | ---------- | ---------------------- |
| id         | UUID      | NO   | gen_random | 主キー                 |
| event_id   | UUID      | NO   | -          | イベントID（外部キー） |
| remind_at  | TIMESTAMP | NO   | -          | 通知日時               |
| is_sent    | BOOLEAN   | NO   | FALSE      | 送信済みフラグ         |
| created_at | TIMESTAMP | NO   | NOW()      | 作成日時               |

**インデックス**

- `event_id`
- `remind_at`
- `is_sent`
- `(remind_at, is_sent)` (複合)

**外部キー制約**

- `event_id` REFERENCES `events(id)` ON DELETE CASCADE

---

#### categories テーブル

| カラム名          | 型          | NULL | デフォルト | 説明                            |
| ----------------- | ----------- | ---- | ---------- | ------------------------------- |
| id                | UUID        | NO   | gen_random | 主キー                          |
| user_id           | UUID        | YES  | NULL       | ユーザーID（NULL=システム共通） |
| name              | VARCHAR(50) | NO   | -          | カテゴリ名                      |
| color             | VARCHAR(7)  | NO   | -          | カラー（HEX形式）               |
| icon              | TEXT        | YES  | NULL       | アイコンURL                     |
| is_system_default | BOOLEAN     | NO   | FALSE      | システムデフォルトフラグ        |
| created_at        | TIMESTAMP   | NO   | NOW()      | 作成日時                        |

**インデックス**

- `user_id`
- `is_system_default`

**外部キー制約**

- `user_id` REFERENCES `users(id)` ON DELETE CASCADE

---

### 初期データ（システムデフォルトカテゴリ）

```sql
INSERT INTO categories (name, color, is_system_default) VALUES
('プレミアリーグ', '#E91E63', TRUE),
('セリエA', '#2196F3', TRUE),
('ラ・リーガ', '#FF9800', TRUE),
('ブンデスリーガ', '#FFC107', TRUE),
('WBC', '#4CAF50', TRUE),
('Netflix', '#E50914', TRUE),
('その他', '#9E9E9E', TRUE);
```

---

## API設計

### エンドポイント一覧

#### 1. Calendar API (`calendar-api`)

| メソッド | エンドポイント | 説明             | 認証 |
| -------- | -------------- | ---------------- | ---- |
| GET      | /events        | イベント一覧取得 | 必須 |
| GET      | /events/:id    | イベント詳細取得 | 必須 |
| POST     | /events        | イベント作成     | 必須 |
| PUT      | /events/:id    | イベント更新     | 必須 |
| DELETE   | /events/:id    | イベント削除     | 必須 |
| GET      | /events/search | イベント検索     | 必須 |

#### 2. Reminder API (`reminder-api`)

| メソッド | エンドポイント | 説明                 | 認証 |
| -------- | -------------- | -------------------- | ---- |
| GET      | /reminders     | リマインダー一覧取得 | 必須 |
| POST     | /reminders     | リマインダー作成     | 必須 |
| DELETE   | /reminders/:id | リマインダー削除     | 必須 |

#### 3. LINE Webhook API (`line-webhook`)

| メソッド | エンドポイント | 説明               | 認証         |
| -------- | -------------- | ------------------ | ------------ |
| POST     | /webhook       | LINEメッセージ受信 | LINE署名検証 |

#### 4. User API (`user-api`)

| メソッド | エンドポイント | 説明             | 認証 |
| -------- | -------------- | ---------------- | ---- |
| GET      | /profile       | プロフィール取得 | 必須 |
| PUT      | /profile       | プロフィール更新 | 必須 |

---

### API詳細仕様

#### GET /events - イベント一覧取得

**リクエスト**

```typescript
// Query Parameters
{
  start_date?: string;  // YYYY-MM-DD
  end_date?: string;    // YYYY-MM-DD
  category?: string;    // カテゴリでフィルター
  page?: number;        // ページ番号（デフォルト: 1）
  limit?: number;       // 1ページあたりの件数（デフォルト: 20）
}
```

**レスポンス**

```typescript
{
  success: true,
  data: {
    events: [
      {
        id: string;
        title: string;
        description: string | null;
        category: string;
        icon_url: string | null;
        start_datetime: string; // ISO 8601
        end_datetime: string;   // ISO 8601
        color: string | null;
        created_at: string;
        updated_at: string;
      }
    ],
    total: number;
    page: number;
    limit: number;
  }
}
```

---

#### POST /events - イベント作成

**リクエスト**

```typescript
{
  title: string;           // 必須、最大100文字
  description?: string;    // 任意、最大1000文字
  category: string;        // 必須
  icon_url?: string;       // 任意
  start_datetime: string;  // 必須、ISO 8601
  end_datetime: string;    // 必須、ISO 8601
  color?: string;          // 任意、HEX形式
  reminders?: number[];    // 任意、通知タイミング（分前）
}
```

**レスポンス**

```typescript
{
  success: true,
  data: {
    id: string;
    title: string;
    description: string | null;
    category: string;
    icon_url: string | null;
    start_datetime: string;
    end_datetime: string;
    color: string | null;
    created_at: string;
    updated_at: string;
  },
  message: "イベントを作成しました"
}
```

---

#### POST /webhook - LINEメッセージ受信

**リクエスト**

```typescript
// LINE Platform Webhook形式
{
  destination: string;
  events: [
    {
      type: "message";
      message: {
        type: "text";
        id: string;
        text: string;
      };
      timestamp: number;
      source: {
        type: "user";
        userId: string;
      };
      replyToken: string;
    }
  ]
}
```

**処理フロー**

1. LINE署名検証
2. ユーザー特定（LINE User IDからDB検索）
3. メッセージタイプ判定
    - イベント検索: 「今日」「明日」等のキーワード
    - イベント登録: 「登録」「追加」等のキーワード
4. Gemini APIで処理
5. LINE Messaging APIで返信

**レスポンス**

```typescript
{
    success: true
}
```

---

## 画面設計

### 画面一覧

1. **カレンダートップ画面** (`/calendar`)
    - 日/週/月表示切り替え
    - 今日の予定一覧
    - 今後のイベント一覧
    - 新規登録ボタン

2. **イベント登録画面** (`/calendar/new`)
    - イベント情報入力フォーム

3. **イベント詳細画面** (`/calendar/:id`)
    - イベント詳細表示
    - 編集/削除ボタン

4. **イベント編集画面** (`/calendar/:id/edit`)
    - イベント情報編集フォーム

5. **プロフィール画面** (`/profile`)
    - ユーザー情報表示
    - カテゴリカラー設定

---

### 画面詳細

#### 1. カレンダートップ画面

**パス**: `/calendar`

**コンポーネント構成**

```
CalendarPage (Server Component)
└─ CalendarClient (Client Component)
   ├─ CalendarHeader
   │  ├─ ViewToggle (日/週/月)
   │  └─ MonthSelector
   ├─ CalendarView
   │  ├─ DayView
   │  ├─ WeekView
   │  └─ MonthView
   ├─ TodayEvents
   │  └─ EventCard
   └─ UpcomingEvents
      └─ EventCard
```

**表示内容**

- カレンダー（日/週/月切り替え）
- 今日の予定（タイムライン形式）
- 今後のイベント（リスト形式）
- 新規登録ボタン（フローティングボタン）

---

#### 2. イベント登録画面

**パス**: `/calendar/new`

**コンポーネント構成**

```
EventNewPage (Server Component)
└─ EventFormClient (Client Component)
   └─ EventForm
      ├─ TitleInput
      ├─ DescriptionInput
      ├─ CategorySelect
      ├─ DateTimePicker
      └─ ReminderSettings
```

**入力フォーム**

- イベント名（テキスト入力）
- 内容（テキストエリア）
- カテゴリ（ドロップダウン）
- 日付（日付ピッカー）
- 開始時間（時間ピッカー）
- 終了時間（時間ピッカー）
- リマインダー（チェックボックス複数選択）

**バリデーション**

- リアルタイムバリデーション（React Hook Form + Zod）
- エラーメッセージ表示

**ボタン**

- イベントを作成（プライマリボタン）
- キャンセル（セカンダリボタン）

---

## 技術スタック

### フロントエンド

- **Next.js 15.3.2** - Reactフレームワーク（App Router）
- **React 19.0.0** - UIライブラリ
- **TypeScript 5** - 型安全性
- **Tailwind CSS 4** - スタイリング
- **React Query (TanStack Query) 5.85.5** - サーバーステート管理
- **React Hook Form 7.60.0** - フォーム管理
- **Zod 4.1.9** - バリデーション
- **date-fns** - 日付処理

### バックエンド

- **Supabase** - BaaS（認証、DB、ストレージ、Edge Functions）
- **PostgreSQL** - データベース
- **Drizzle ORM** - ORM
- **Hono** - Edge Functions用軽量フレームワーク
- **Deno** - Edge Functionsランタイム

### AI・外部API

- **Google Gemini API** - AI処理（メッセージ解析、Web検索）
- **LINE Messaging API** - メッセージ送受信
- **LINE Login** - 認証
- **LIFF SDK** - ミニアプリ連携

### 開発ツール

- **ESLint 9** - リンティング
- **Prettier 3.5.3** - コードフォーマット
- **Jest 30.1.3** - テスト

---

## 開発ロードマップ（改訂版）

### Phase 1: MVP開発（基本カレンダーアプリ） - 3週間

**目標**: LINE連携なしの通常のWebアプリとして動作するMVPを完成させる

#### Week 1: 基盤構築

- プロジェクトセットアップ
    - Next.js 15プロジェクト作成
    - TailwindCSS 4設定
    - ESLint/Prettier設定
- Supabase初期設定
    - Supabaseプロジェクト作成
    - データベース設計・マイグレーション実行
- 認証機能実装（Email/Password）
    - Supabase Auth統合
    - サインアップ/ログイン画面
    - セッション管理

**成果物**

- プロジェクト基盤完成
- DBスキーマ作成完了
- 基本認証フロー動作確認

**Week 1完了条件**

- ユーザー登録・ログインができること
- データベースにユーザーが保存されること

---

#### Week 2: イベント管理機能（バックエンド + API）

- イベントCRUD API実装
    - Supabase Edge Functions作成
    - Calendar API実装（GET/POST/PUT/DELETE）
    - Drizzle ORM設定
    - バリデーション実装（Zod）
- API動作テスト
    - Postman/Thunder Clientでテスト
    - エラーハンドリング確認

**成果物**

- Calendar API完成
- イベントCRUD機能動作確認

**Week 2完了条件**

- APIでイベントの作成・取得・更新・削除ができること
- バリデーションエラーが適切に返ること

---

#### Week 3: フロントエンド実装（カレンダーUI）

- カレンダートップ画面実装
    - 日/週/月表示切り替え
    - イベント一覧表示
    - カテゴリカラー表示
- イベント登録画面実装
    - フォーム実装（React Hook Form）
    - バリデーション（Zod）
    - カテゴリ選択
    - 日時ピッカー
- イベント詳細画面実装
- イベント編集画面実装
- イベント削除機能実装

**成果物**

- フルスタック機能完成
- カレンダーアプリとして動作

**Week 3完了条件**

- ブラウザでアプリが動作すること
- イベントの登録・表示・編集・削除ができること
- カレンダービューが正しく表示されること

---

#### Week 4: テスト・デバッグ・デプロイ

- ユニットテスト作成（必要に応じて）
- バグ修正
- UI/UX調整
- パフォーマンス最適化
- Vercel/Netlifyにデプロイ
- 動作確認

**成果物**

- **Phase 1 MVP版リリース**（通常のWebアプリとして完全動作）

**Phase 1完了後の状態**
✅ Email/Passwordでログイン可能
✅ イベントの登録・編集・削除が可能
✅ 日/週/月表示でカレンダーが表示される
✅ カテゴリごとに色分け表示される
❌ LINE連携なし
❌ AI機能なし

---

### Phase 2: AI機能実装 - 3週間

**目標**: Gemini APIを統合してAI検索・登録機能を追加

#### Week 5: AI基盤構築

- Gemini API統合
    - API Key取得・設定
    - Gemini APIクライアント実装
    - メッセージ解析ロジック実装
- Web検索機能実装（Gemini Web Search）

**成果物**

- AI処理基盤完成

---

#### Week 6: AIイベント検索機能

- アプリ内検索機能実装
    - 検索バー追加
    - 自然言語検索対応
    - 検索結果表示
- AI検索ロジック実装
    - 「今日の試合」「明日のイベント」等の解析
    - 検索クエリ生成
    - 結果の整形

**成果物**

- AIイベント検索機能完成

---

#### Week 7: AIイベント登録機能

- イベント情報抽出ロジック実装
    - Web検索から情報取得
    - 構造化データ生成
- 確認フロー実装
    - 複数候補表示
    - ユーザー承認UI
- イベント自動登録実装

**成果物**

- **Phase 2リリース**（AI機能追加）

**Phase 2完了後の状態**
✅ Phase 1の全機能
✅ アプリ内で自然言語検索が可能
✅ 自然言語でイベント登録が可能
❌ LINE連携なし（アプリ内のみで完結）

---

### Phase 3: LINE連携 - 4週間

**目標**: LINEミニアプリ化とMessaging API連携

#### Week 8: LINE開発環境構築

- LINE開発者アカウント作成
- LINE公式アカウント作成
- LIFFアプリ登録
- Messaging APIチャネル作成
- Webhook URL設定

**成果物**

- LINE開発環境完成

---

#### Week 9: LINE Login統合

- LINE Login SDK統合
- 既存認証システムとの統合
    - Email認証 + LINE認証の両対応
    - アカウント連携機能
- LIFF SDK統合
    - LINEアプリ内表示対応
    - プロフィール情報取得

**成果物**

- LINE Login機能完成

---

#### Week 10: Messaging API統合

- Webhook API実装
    - メッセージ受信処理
    - LINE署名検証
- メッセージ送信機能実装
    - Reply API
    - Push API
- AI検索・登録とMessaging APIの連携
    - LINEトークからの検索対応
    - LINEトークからの登録対応

**成果物**

- Messaging API連携完成

---

#### Week 11: リマインダー通知 + 最終調整

- リマインダー機能実装
    - リマインダー設定UI
    - Cron Jobs設定
    - LINE通知送信
- 最終テスト・調整
- UI/UX改善
- パフォーマンス最適化

**成果物**

- **Phase 3最終リリース**（LINEミニアプリ完成版）

**Phase 3完了後の状態（最終形）**
✅ Phase 1 + Phase 2の全機能
✅ LINE Loginでログイン可能
✅ LINEアプリ内で動作（LIFF）
✅ LINEトークからイベント検索・登録が可能
✅ LINEでリマインダー通知を受信

---

### 開発期間まとめ

| Phase    | 期間       | 主な機能           | リリース形態    |
| -------- | ---------- | ------------------ | --------------- |
| Phase 1  | 4週間      | 基本カレンダー機能 | 通常のWebアプリ |
| Phase 2  | 3週間      | AI機能             | AI搭載Webアプリ |
| Phase 3  | 4週間      | LINE連携           | LINEミニアプリ  |
| **合計** | **11週間** | -                  | 完全版          |

---

### Phase 1 (MVP) 優先実装推奨理由

1. **早期フィードバック取得**
    - 基本機能の動作を早期に確認できる
    - UIUXの改善点を早期に発見できる

2. **技術的リスク軽減**
    - LINE APIに依存せず開発・テストできる
    - 問題の切り分けが容易

3. **段階的な機能追加**
    - 各Phaseで明確な成果物がある
    - 各段階でユーザーテストが可能

4. **開発の柔軟性**
    - Phase 1完了後、Phase 2/3の優先度を見直せる
    - ユーザーフィードバックを反映しやすい

---

## 付録

### A. カテゴリ一覧

| カテゴリ名     | デフォルトカラー | アイコン |
| -------------- | ---------------- | -------- |
| プレミアリーグ | #E91E63          | ⚽       |
| セリエA        | #2196F3          | ⚽       |
| ラ・リーガ     | #FF9800          | ⚽       |
| ブンデスリーガ | #FFC107          | ⚽       |
| WBC            | #4CAF50          | ⚾       |
| Netflix        | #E50914          | 📺       |
| その他         | #9E9E9E          | 📅       |

---

### B. エラーコード一覧

| コード | 説明                   | HTTPステータス |
| ------ | ---------------------- | -------------- |
| E001   | 認証エラー             | 401            |
| E002   | 権限エラー             | 403            |
| E003   | リソースが見つからない | 404            |
| E004   | バリデーションエラー   | 422            |
| E005   | サーバーエラー         | 500            |
| E006   | LINE API エラー        | 502            |
| E007   | Gemini API エラー      | 502            |

---

### C. 環境変数一覧

#### Phase 1 (MVP) 必須環境変数

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Next.js
NEXT_PUBLIC_APP_URL=
```

#### Phase 2 追加環境変数

```env
# Gemini API
GEMINI_API_KEY=
```

#### Phase 3 追加環境変数

```env
# LINE
LINE_CHANNEL_ID=
LINE_CHANNEL_SECRET=
LINE_CHANNEL_ACCESS_TOKEN=
LIFF_ID=
```

---

## 改訂履歴

| バージョン | 日付       | 変更内容                                                                                                                                                                                                                                  | 作成者 |
| ---------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| 1.0        | 2025-10-07 | 初版作成                                                                                                                                                                                                                                  | Claude |
| 1.1        | 2025-10-07 | 開発アプローチを段階的リリース戦略に変更<br>- Phase 1: 通常のWebアプリ（Email認証）<br>- Phase 2: AI機能追加<br>- Phase 3: LINE連携<br>優先度を改訂（P0-MVP, P1-AI, P2-LINE, P3-Future）<br>開発ロードマップを11週間（3+3+4+1週）に再編成 | Claude |

---

**END OF SPECIFICATION**
