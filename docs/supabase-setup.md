# Supabase セットアップガイド

## 概要

このプロジェクトでは、Next.js × Supabaseの構成を使用しています。
`db/supabase.ts` にSupabaseクライアントの設定が含まれています。

## 環境変数の設定

`.env`ファイルに以下の環境変数を設定してください：

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:74321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### ローカル開発環境の場合

ローカルでSupabaseを起動している場合、URLは `http://127.0.0.1:74321` になります。
`supabase/config.toml` で設定されたポート番号を使用してください。

### 本番環境の場合

Supabaseプロジェクトダッシュボードから以下の情報を取得してください：
- Project URL → `NEXT_PUBLIC_SUPABASE_URL`
- anon/public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- service_role key → `SUPABASE_SERVICE_ROLE_KEY`

## Supabaseクライアントの使用方法

### クライアントサイドでの使用

```typescript
import { getSupabaseClient } from '@/db/supabase'

export default function MyComponent() {
  const supabase = getSupabaseClient()

  // Supabaseの操作
  const { data, error } = await supabase
    .from('table_name')
    .select('*')
}
```

### サーバーサイドでの使用（Server Actions / API Routes）

```typescript
import { createSupabaseClient } from '@/db/supabase'

export async function serverAction() {
  const supabase = createSupabaseClient()

  // Supabaseの操作
  const { data, error } = await supabase
    .from('table_name')
    .select('*')
}
```

### 管理者権限でのアクセス（Edge Functions / Server Actions）

```typescript
import { createSupabaseAdminClient } from '@/db/supabase'

export async function adminAction() {
  const supabase = createSupabaseAdminClient()

  // RLS（Row Level Security）をバイパスした操作が可能
  const { data, error } = await supabase
    .from('table_name')
    .select('*')
}
```

## 主な機能

### `getSupabaseClient()`
- クライアントサイドで使用するSupabaseクライアント
- シングルトンパターンで管理され、ブラウザ環境では1つのインスタンスを共有
- 自動的にCookieを通じてセッション管理を行う

### `createSupabaseClient()`
- サーバーサイドで使用するSupabaseクライアント
- 毎回新しいクライアントインスタンスを作成
- ブラウザ環境でも使用可能

### `createSupabaseAdminClient()`
- 管理者権限でSupabaseにアクセスするクライアント
- Row Level Security（RLS）をバイパス可能
- Edge FunctionsやServer Actionsで使用
- `SUPABASE_SERVICE_ROLE_KEY`が必要

## 注意事項

1. **セキュリティ**
   - `SUPABASE_SERVICE_ROLE_KEY`は絶対にクライアントサイドで使用しないでください
   - 管理者クライアントはサーバーサイドのみで使用してください

2. **認証**
   - クライアントサイドの認証は自動的にCookieで管理されます
   - サーバーサイドでは適切にセッションを取得して使用してください

3. **型安全性**
   - Supabaseの型定義を使用することを推奨します
   - 必要に応じて `supabase gen types typescript` コマンドで型を生成してください

## トラブルシューティング

### エラー: "SUPABASE_SERVICE_ROLE_KEY is not defined"
- `.env`ファイルに`SUPABASE_SERVICE_ROLE_KEY`が設定されているか確認してください
- サーバーサイドでのみ使用可能な環境変数です

### 接続エラー
- `NEXT_PUBLIC_SUPABASE_URL`が正しく設定されているか確認してください
- ローカル開発の場合、Supabaseが起動しているか確認してください
  ```bash
  supabase status
  ```

### 型エラー
- `@supabase/ssr`パッケージがインストールされているか確認してください
  ```bash
  yarn add @supabase/ssr
  ```
