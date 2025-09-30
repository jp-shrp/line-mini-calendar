# EIKO Direct - 推奨コマンド

## 開発環境セットアップ

```bash
# 環境設定ファイルのコピー
cp .env.example .env

# 依存関係のインストール
yarn

# Dockerコンテナ起動
make up

# モックサーバー依存関係インストール
npm run mock:install
```

## 開発サーバー起動

```bash
# メイン開発サーバー起動 (ポート8081)
yarn dev

# モックサーバー開発モード
npm run mock:dev
```

## ビルド・デプロイ

```bash
# プロダクションビルド
yarn build

# プロダクション起動
yarn start

# モックサーバービルド・起動
npm run mock:build
npm run mock:start
```

## 品質チェック・フォーマット

```bash
# リント実行
yarn lint

# 型チェック
yarn type-check

# コードフォーマット
yarn format
```

## Docker管理

```bash
# コンテナ起動
make up

# コンテナ停止・削除
make down

# コンテナ接続
make connect
```

## システムコマンド (macOS)

```bash
# ファイル一覧
ls -la

# ディレクトリ移動
cd <path>

# ファイル検索
find . -name "*.tsx"

# 文字列検索
grep -r "searchTerm" src/

# Git操作
git status
git add .
git commit -m "message"
git push
```
