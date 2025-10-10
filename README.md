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

### バックエンドはコーポレートサイト
