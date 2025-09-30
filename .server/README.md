# Eiko Direct Mock Server

Express.jsで構築されたmockサーバーです。

## 機能

- **ヘルスチェック**: `/health`
- **ユーザー管理API**: `/api/users`
- **認証API**: `/api/auth`

## セットアップ

### 依存関係のインストール

```bash
# ルートディレクトリから
npm run mock:install

# または .serverディレクトリで直接
cd .server && npm install
```

## 起動方法

### 開発モード（Hot Reload）

```bash
# ルートディレクトリから
npm run mock:dev

# または .serverディレクトリで直接
cd .server && npm run dev
```

## API エンドポイント

### ヘルスチェック

```
GET /health
```

**レスポンス:**

```json
{
    "status": "OK",
    "timestamp": "2024-09-17T08:00:00.000Z"
}
```

### ユーザー管理

#### 全ユーザー取得

```
GET /api/users
```

#### 特定ユーザー取得

```
GET /api/users/:id
```

#### ユーザー作成

```
POST /api/users
Content-Type: application/json

{
  "name": "ユーザー名",
  "email": "email@example.com"
}
```

### 認証

#### ログイン

```
POST /api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password"
}
```

#### ログアウト

```
POST /api/auth/logout
```

#### ユーザー情報取得

```
GET /api/auth/me
Authorization: Bearer mock-jwt-token
```

## デフォルトポート

- **開発**: 3001
- 環境変数 `MOCK_PORT` で変更可能

## テストアカウント

- **Email**: test@example.com
- **Password**: password
