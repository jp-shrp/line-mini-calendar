# 技術スタック詳細

## 1. フロントエンド技術選定

### コアフレームワーク

- **Next.js 15.3.2** - React フレームワーク（App Router）
- **React 19.0.0** - UIライブラリ
- **TypeScript 5** - 型安全な開発環境

### スタイリング

- **Tailwind CSS 4** - ユーティリティファーストCSS
- **@tailwindcss/postcss** - PostCSS統合

### 状態管理・データフェッチング

- **React Query (TanStack Query) 5.85.5** - サーバーステート管理
- **Jotai 2.12.5** - アトミックな状態管理
- **React Hook Form 7.60.0** - フォーム管理
- **Zod 4.1.9** - スキーマバリデーション

## 2. バックエンド・データベース技術選定

### インフラストラクチャ

- **Supabase** - BaaS（認証、データベース、ストレージ）
- **Supabase Edge Functions** - サーバーレス関数
- **PostgreSQL** - データベース（Supabase経由）

### APIフレームワーク

- **Hono** - 軽量WebフレームワークをEdge Functionsで使用
- **Drizzle ORM** - TypeScript型安全なORM

## 3. 開発ツール

### コード品質

- **ESLint 9** - リンティング
- **Prettier 3.5.3** - コードフォーマッティング
- **eslint-plugin-unused-imports** - 未使用インポート検出

### テスト

- **Jest 30.1.3** - ユニットテスト
- **@testing-library/jest-dom** - DOM テスト
- **ts-jest** - TypeScript サポート

## 4. Next.js特有の機能活用

### 環境変数管理

```typescript
// 環境変数は .env.local に定義
// NEXT_PUBLIC_ プレフィックスでクライアント側にも公開可能
const apiUrl = process.env.NEXT_PUBLIC_API_URL
const secretKey = process.env.SECRET_KEY // サーバー側のみ
```

### サーバーアクション

```typescript
'use server'

export async function createUser(formData: FormData) {
    // サーバー側で実行される処理
}
```

### 画像最適化

```typescript
import Image from 'next/image'

<Image
    src="/path/to/image.jpg"
    alt="Description"
    width={500}
    height={300}
    priority
/>
```

## 5. 技術選定の理由

### Next.js 15を選択した理由

- App Routerによるモダンなルーティング
- Server ComponentsとClient Componentsの使い分け
- ビルトインのAPI Routes
- 優れたパフォーマンス最適化

### Tailwind CSS 4を選択した理由

- ユーティリティファーストの開発効率
- 一貫性のあるデザインシステム
- レスポンシブデザインの簡単な実装
- ダークモード対応の容易さ

### Supabaseを選択した理由

- リアルタイムデータベース機能
- 組み込み認証システム
- Edge Functionsによるサーバーレス実行
- PostgreSQLの堅牢性

### React Queryを選択した理由

- 強力なキャッシュ管理
- オプティミスティックアップデート
- バックグラウンド再フェッチ
- エラーハンドリングの統一

### Honoを選択した理由

- 軽量で高速
- TypeScript完全サポート
- Edge環境に最適化
- ミドルウェアの柔軟な構成

## 6. バージョン管理方針

### メジャーバージョンアップ

- 四半期ごとに検討
- 破壊的変更は慎重に評価
- 移行ガイドの作成必須

### セキュリティアップデート

- 即座に適用
- 自動化されたセキュリティスキャン導入

### 依存関係の管理

```json
// package.json
{
    "dependencies": {
        // 本番環境で必要なパッケージ
    },
    "devDependencies": {
        // 開発環境でのみ必要なパッケージ
    }
}
```

## 7. パフォーマンス考慮事項

### バンドルサイズ最適化

- Tree shakingの活用
- 動的インポートの使用
- 不要な依存関係の削除

```typescript
// 動的インポート
const DynamicComponent = dynamic(() => import('./HeavyComponent'), {
    loading: () => <p>Loading...</p>,
})
```

### 実行時パフォーマンス

- React.memoの適切な使用
- useMemo/useCallbackの活用
- Server Componentsの活用

## 8. 将来の技術選定候補

### 検討中の技術

- **React Server Components** - さらなる最適化
- **tRPC** - 型安全なAPI通信
- **Turborepo** - モノレポ管理

### 導入基準

1. コミュニティの成熟度
2. ドキュメントの充実度
3. 既存技術との互換性
4. パフォーマンスへの影響
5. 学習コスト
