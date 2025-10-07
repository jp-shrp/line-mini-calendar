# プロジェクト概要

## プロジェクト名
line-mini-calendar (EIKO Direct)

## プロジェクトの目的
LINEミニアプリとして動作するカレンダーアプリケーション。
ユーザーがイベントやスケジュールを管理できる。

## 技術スタック

### フロントエンド
- **Next.js 15.3.2** (App Router)
- **React 19.0.0**
- **TypeScript 5**
- **Tailwind CSS 4** (スタイリング)
- **React Query (TanStack Query) 5.85.5** (サーバーステート管理)
- **Jotai 2.12.5** (アトミックステート管理)
- **React Hook Form 7.60.0** (フォーム管理)
- **Zod 4.1.9** (バリデーション)
- **react-calendar 6.0.0** (カレンダーUI)

### バックエンド
- **Supabase** (BaaS)
- **Supabase Edge Functions** (Hono使用)
- **PostgreSQL** (Drizzle ORMで管理)
- **Drizzle ORM 0.41.0**

### 開発ツール
- **ESLint 9** + **Prettier 3.5.3**
- **Jest 30.1.3** (テストフレームワーク)
- **Playwright** (E2Eテスト)

## プロジェクト構造

```
line-mini-calendar/
├── src/                    # フロントエンドソース
│   ├── app/               # Next.js App Router
│   ├── components/        # 共通コンポーネント
│   ├── hooks/             # カスタムHooks
│   ├── contexts/          # Reactコンテキスト
│   ├── models/            # データモデル
│   ├── lib/               # ユーティリティ
│   └── types/             # 型定義
├── supabase/              # Supabaseバックエンド
│   └── functions/         # Edge Functions
│       ├── _shared/       # 共有コード
│       ├── auth-api/      # 認証API
│       └── samples-api/   # サンプルAPI
├── db/                    # データベース関連
├── .docs/                 # ドキュメント
│   └── guideline.md       # 開発ガイドライン (重要)
└── .tasks/                # タスク管理
