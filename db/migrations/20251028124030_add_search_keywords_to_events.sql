-- Custom SQL migration file, put your code below! --

-- カスタムマイグレーション: eventsテーブルにsearch_keywordsカラムを追加
-- 目的: AI検索時の関連キーワード検索を可能にする

-- search_keywordsカラムを追加
ALTER TABLE "events" ADD COLUMN "search_keywords" text;

-- 既存データのsearch_keywordsをNULLとして設定（既にNULLなので不要だが明示的に記載）
-- COMMENT: 既存レコードには後からAIで生成したキーワードを追加する運用とする