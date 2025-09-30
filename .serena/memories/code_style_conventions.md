# EIKO Direct - コードスタイル・命名規則

## TypeScript設定

- **Strict mode**: 有効
- **Target**: ES2017
- **Module**: ESNext (bundler resolution)
- **Path mapping**: `@/*` -> `./src/*`
- **JSX**: preserve

## ESLint設定

- **ベース**: next/core-web-vitals, next/typescript
- **特別ルール**:
    - unused-imports/no-unused-imports: error
    - 未使用変数: warn (`_`始まりは許容)
    - @typescript-eslint/no-explicit-any: off
    - @next/next/no-img-element: off
    - react-hooks関連: off

## Prettier設定

- **インデント**: スペース4つ (tabWidth: 4)
- **セミコロン**: なし (semi: false)
- **クォート**: シングル (singleQuote: true)
- **Trailing comma**: all
- **Bracket spacing**: true
- **Arrow parens**: always
- **JSX bracket same line**: true
- **Plugin**: prettier-plugin-tailwindcss

## ファイル・ディレクトリ構造

```
src/
├── app/                    # Next.js App Router
│   ├── (with-layout)/     # レイアウト有りページ
│   ├── (without-layout)/  # レイアウト無しページ
│   ├── context/           # React Context
│   ├── utils/             # ユーティリティ
│   └── sandbox/           # 開発・テスト用
├── components/            # 再利用可能コンポーネント
├── hooks/                 # カスタムフック
├── actions/               # サーバーアクション
├── models/                # データモデル・型定義
├── contexts/              # React Context
└── lib/                   # ライブラリ・ヘルパー
```

## 命名規則

- **ファイル**: kebab-case (例: user-list.tsx)
- **コンポーネント**: PascalCase
- **関数・変数**: camelCase
- **定数**: UPPER_SNAKE_CASE
- **型・インターフェース**: PascalCase
