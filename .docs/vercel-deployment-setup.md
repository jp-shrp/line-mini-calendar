# Vercel デプロイメント設定ガイド

このドキュメントでは、GitHub ActionsからVercelへの自動デプロイを設定する手順を説明します。

## 📋 事前準備

### 1. Vercel プロジェクトの作成

1. [Vercel](https://vercel.com/)にログイン
2. 新規プロジェクトを作成
3. GitHubリポジトリと連携（または手動デプロイ用に設定）

### 2. Vercel Token の取得

1. Vercel Dashboard → **Settings** → **Tokens**
2. **Create Token** をクリック
3. トークン名を入力（例: `github-actions-deploy`）
4. トークンをコピーして安全に保存

### 3. Vercel プロジェクト情報の取得

以下の情報をVercel Dashboardから取得します:

- **Project ID**: プロジェクト設定ページのURLまたは設定画面で確認
- **Org ID**: Vercel Dashboardの設定ページで確認

#### 確認方法

```bash
# ローカルでVercel CLIを使用して確認
npx vercel link

# .vercel/project.jsonに以下の情報が保存されます
{
  "projectId": "prj_xxxxxxxxxxxxx",
  "orgId": "team_xxxxxxxxxxxxx"
}
```

## 🔑 GitHub Secrets の設定

GitHubリポジトリに以下のSecretsを設定してください。

### Settings → Secrets and variables → Actions → New repository secret

| Secret名            | 説明                 | 取得方法                             |
| ------------------- | -------------------- | ------------------------------------ |
| `VERCEL_TOKEN`      | Vercel APIトークン   | Vercel Dashboard → Settings → Tokens |
| `VERCEL_ORG_ID`     | Vercel組織ID         | `.vercel/project.json`の`orgId`      |
| `VERCEL_PROJECT_ID` | VercelプロジェクトID | `.vercel/project.json`の`projectId`  |

### 環境変数の設定（オプション）

Vercel Dashboard → Project Settings → Environment Variablesで必要な環境変数を設定:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_LIFF_ID`
- その他プロジェクトで必要な環境変数

**重要**: 環境変数は環境ごと（Production / Preview / Development）に設定してください。

## 🚀 デプロイメントの仕組み

### 1. developブランチ → Preview環境

- `develop`ブランチにpushすると自動的にPreview環境へデプロイ
- テスト用の環境として利用

```yaml
# トリガー条件
on:
    push:
        branches:
            - develop
```

### 2. mainブランチ → Production環境

- `main`ブランチにpushすると自動的にProduction環境へデプロイ
- 本番環境として利用

```yaml
# トリガー条件
on:
    push:
        branches:
            - main
```

### 3. Pull Request → PR Preview環境

- Pull Request作成時に自動的にPreview環境へデプロイ
- PRのレビュー用として利用

```yaml
# トリガー条件
on:
    pull_request:
        types:
            - opened
            - synchronize
            - reopened
```

## 📁 プロジェクト構成

### GitHub Actions ワークフロー

```
.github/
└── workflows/
    └── vercel-deploy.yml
```

### Vercel 設定ファイル

```
vercel.json
```

**vercel.jsonの内容:**

```json
{
    "buildCommand": "npm run build",
    "devCommand": "npm run dev",
    "installCommand": "npm install",
    "framework": "nextjs",
    "outputDirectory": ".next"
}
```

## 🔧 デプロイメントの手動実行

### ローカルからデプロイ

```bash
# Preview環境へデプロイ
npx vercel

# Production環境へデプロイ
npx vercel --prod
```

### GitHub Actionsから手動実行

1. GitHub → **Actions** タブ
2. **Vercel Deployment** ワークフローを選択
3. **Run workflow** をクリック
4. デプロイしたいブランチを選択して実行

## 🐛 トラブルシューティング

### エラー: "Error: No token provided"

**原因**: `VERCEL_TOKEN`が設定されていない

**解決方法**:

1. GitHubリポジトリの Settings → Secrets → Actions
2. `VERCEL_TOKEN`を追加

### エラー: "Error: Failed to load project settings"

**原因**: `VERCEL_ORG_ID`または`VERCEL_PROJECT_ID`が不正

**解決方法**:

1. ローカルで`npx vercel link`を実行
2. `.vercel/project.json`から正しいIDを取得
3. GitHubのSecretsを更新

### デプロイが失敗する

**確認事項**:

1. ビルドコマンド(`npm run build`)がローカルで成功するか確認
2. 環境変数が正しく設定されているか確認
3. Vercel Dashboardでビルドログを確認

### 環境変数が反映されない

**解決方法**:

1. Vercel Dashboard → Project Settings → Environment Variables
2. 対象の環境（Production / Preview / Development）に環境変数が設定されているか確認
3. 設定後、再度デプロイを実行

## 📚 参考リンク

- [Vercel CLI Documentation](https://vercel.com/docs/cli)
- [Vercel GitHub Actions Integration](https://vercel.com/docs/deployments/git/vercel-for-github)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

## ✅ セットアップチェックリスト

- [ ] Vercelプロジェクトを作成
- [ ] Vercel Tokenを取得
- [ ] Vercel Project IDとOrg IDを取得
- [ ] GitHub Secretsに`VERCEL_TOKEN`を設定
- [ ] GitHub Secretsに`VERCEL_ORG_ID`を設定（必要に応じて）
- [ ] GitHub Secretsに`VERCEL_PROJECT_ID`を設定（必要に応じて）
- [ ] Vercel Dashboardで環境変数を設定
- [ ] ローカルで`npm run build`が成功することを確認
- [ ] developブランチへpushしてPreview環境のデプロイを確認
- [ ] mainブランチへpushしてProduction環境のデプロイを確認
