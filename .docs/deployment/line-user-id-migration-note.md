# LINE User ID マイグレーション ノート

**作成日**: 2025-10-16
**対象**: `users`テーブルの`line_user_id`カラム

---

## 概要

LINE Messaging API連携機能の実装において、`users`テーブルに`line_user_id`カラムが必要です。

## マイグレーション状況

### 結論

**新しいマイグレーションファイルは不要です。**

`line_user_id`カラムは既に以下のマイグレーションファイルで実装済みです:

- **ファイル**: `supabase/migrations/20251010064300_maigrate.sql`
- **作成日**: 2025-10-10

### 既存のスキーマ定義

```sql
create table "public"."users" (
    "id" uuid not null,
    "line_user_id" character varying(255),  -- ← 既に存在
    "display_name" character varying(100),
    "profile_image" text,
    "email" character varying(255),
    "auth0_id" text,
    "auth_method" auth_method default 'anonymous'::auth_method,
    "created_at" timestamp without time zone not null default now(),
    "updated_at" timestamp without time zone not null default now()
);
```

### 制約

`line_user_id`カラムには以下の制約が設定されています:

```sql
-- UNIQUE制約
CREATE UNIQUE INDEX users_line_user_id_unique ON public.users USING btree (line_user_id);

-- 制約の有効化
alter table "public"."users" add constraint "users_line_user_id_unique" UNIQUE using index "users_line_user_id_unique";
```

### トリガー関数での対応

`sync_auth_user_to_public_users()`関数も既に`line_user_id`に対応しています:

```sql
CREATE OR REPLACE FUNCTION public.sync_auth_user_to_public_users()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO public.users (
            id,
            email,
            display_name,
            profile_image,
            line_user_id,  -- ← 対応済み
            auth0_id,
            created_at,
            updated_at
        ) VALUES (
            NEW.id,
            NEW.email,
            COALESCE(NEW.raw_user_meta_data->>'display_name', NULL),
            COALESCE(NEW.raw_user_meta_data->>'profile_image', NULL),
            COALESCE(NEW.raw_user_meta_data->>'line_user_id', NULL),  -- ← 対応済み
            COALESCE(NEW.raw_user_meta_data->>'auth0_id', NULL),
            NOW(),
            NOW()
        )
        ON CONFLICT (id) DO NOTHING;
        RETURN NEW;

    ELSIF TG_OP = 'UPDATE' THEN
        UPDATE public.users
        SET
            email = NEW.email,
            display_name = COALESCE(NEW.raw_user_meta_data->>'display_name', display_name),
            profile_image = COALESCE(NEW.raw_user_meta_data->>'profile_image', profile_image),
            line_user_id = COALESCE(NEW.raw_user_meta_data->>'line_user_id', line_user_id),  -- ← 対応済み
            auth0_id = COALESCE(NEW.raw_user_meta_data->>'auth0_id', auth0_id),
            updated_at = NOW()
        WHERE id = NEW.id;
        RETURN NEW;

    ELSIF TG_OP = 'DELETE' THEN
        DELETE FROM public.users WHERE id = OLD.id;
        RETURN OLD;

    END IF;

    RETURN NULL;
END;
$function$
;
```

---

## 確認方法

### ローカル環境での確認

```bash
# Supabaseローカル環境を起動
supabase start

# PostgreSQLに接続してカラム確認
psql postgresql://postgres:postgres@localhost:54322/postgres

# カラム情報を確認
SELECT column_name, data_type, is_nullable, character_maximum_length
FROM information_schema.columns
WHERE table_name = 'users' AND column_name = 'line_user_id';

# 制約情報を確認
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'users' AND constraint_name LIKE '%line_user_id%';
```

**期待される出力**:

```
 column_name  |     data_type     | is_nullable | character_maximum_length
--------------+-------------------+-------------+-------------------------
 line_user_id | character varying | YES         |                     255
(1 row)

     constraint_name      | constraint_type
--------------------------+-----------------
 users_line_user_id_unique| UNIQUE
(1 row)
```

### 本番環境での確認

```bash
# Supabase Dashboardで確認
# 1. https://app.supabase.com/ にアクセス
# 2. プロジェクトを選択
# 3. Table Editor → users テーブル → Columns
# 4. "line_user_id" カラムが存在し、UNIQUE制約がついていることを確認
```

---

## まとめ

- ✅ `line_user_id`カラムは既に存在
- ✅ `VARCHAR(255)`型で定義済み
- ✅ `UNIQUE`制約が設定済み
- ✅ トリガー関数で自動同期対応済み
- ✅ **新しいマイグレーションファイルの作成は不要**

---

**作成者**: Claude Code
**最終更新**: 2025-10-16
