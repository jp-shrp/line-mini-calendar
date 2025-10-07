# 推奨コマンド一覧

## 開発サーバー起動

```bash
yarn dev                # フロントエンド開発サーバー起動 (ポート: 8081)
```

## コード品質チェック（タスク完了時に必須実行）

```bash
yarn format             # Prettierでコードフォーマット
yarn type-check         # TypeScriptの型チェック
yarn lint               # ESLintでリンティング
yarn test               # Jestでテスト実行
```

**重要**: タスク完了後、**必ず**上記4つのコマンドを実行すること

## ビルド・本番

```bash
yarn build              # プロダクションビルド
yarn start              # プロダクションサーバー起動
```

## テスト関連

```bash
yarn test               # テスト実行
yarn test:watch         # ウォッチモードでテスト
yarn test:coverage      # カバレッジ付きテスト
```

## データベース関連

### マイグレーション
```bash
yarn make:migration {name}         # マイグレーション生成
yarn make:migration:custom {name}  # カスタムマイグレーション生成
yarn db:migrate                    # マイグレーション実行
yarn db:migrate:test               # テスト環境でマイグレーション
yarn db:drop                       # マイグレーション削除
```

### Supabaseローカル
```bash
make db-start           # Supabase起動
make db-stop            # Supabase停止
make db-reset           # Supabaseリセット
```

### Edge Functions
```bash
make function name={name}  # 新規Function作成
make fn-start              # Functions起動
make set-env               # 環境変数設定
```

## Git関連

### コミットメッセージルール
- フォーマット: `{タスクID}: メッセージ`
- 例: `LIN-42: カレンダーUI実装`
- 自動生成メッセージ（🤖 Generated with...）は含めない
- Co-Authored-Byも不要

## モックサーバー（開発用）

```bash
yarn mock:install       # モックサーバー依存関係インストール
yarn mock:dev           # モックサーバー起動
yarn mock:build         # モックサーバービルド
yarn mock:start         # モックサーバー本番起動
```

## システムコマンド（Darwin/macOS）

```bash
ls                      # ファイル一覧表示
cd {path}              # ディレクトリ移動
grep {pattern}         # 文字列検索
find {path}            # ファイル検索
git status             # Git状態確認
git log                # コミット履歴確認
```