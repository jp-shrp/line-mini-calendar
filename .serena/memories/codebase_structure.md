# EIKO Direct - コードベース構造

## ルートディレクトリ構造

```
eiko-direct/
├── .claude/              # Claude設定
├── .docker/              # Docker設定
├── .server/              # Express.jsモックサーバー
├── docs/                 # ドキュメント
├── public/               # 静的ファイル
├── src/                  # ソースコード
├── package.json          # プロジェクト設定
├── tsconfig.json         # TypeScript設定
├── next.config.ts        # Next.js設定
├── eslint.config.mjs     # ESLint設定
├── .prettierrc           # Prettier設定
├── Makefile              # Docker管理
└── CLAUDE.md             # Claude指示書
```

## src/ディレクトリ詳細

### app/ (Next.js App Router)

- `(with-layout)/`: ヘッダー・フッター有りページ
    - トップページ、商品一覧・詳細、マイページ系
    - ニュース、ヘルプ、会社情報系
- `(without-layout)/`: レイアウト無しページ
- `context/`: React Context関連
- `utils/`: ユーティリティ関数
- `sandbox/`: 開発・テスト用ページ

### components/

- 再利用可能なUIコンポーネント
- `about-icons/`: アイコン説明用コンポーネント
- 主要コンポーネント: Header, Footer, ProductCard, etc.

### hooks/

- カスタムフック
- `queryKeys.ts`: React Query用キー定義
- `useSearchFields.ts`: 検索フィールド管理
- `useImageSlider.ts`: 画像スライダー
- `useHorizontalScroll.ts`: 横スクロール

### actions/

- サーバーアクション
- 各エンティティ毎にアクション定義
- auth, product, user, favorite等

### models/

- データモデル・型定義
- `entities/`: 共通エンティティ
- 主要モデル: Product, News, Performance等

### lib/

- ライブラリ・ヘルパー関数
- API関連、バリデーション、ユーティリティ

### contexts/

- React Context定義
- LoadingContext等
