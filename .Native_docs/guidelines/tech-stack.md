# 技術スタック詳細

## 1. フロントエンド技術選定

### コアフレームワーク

- **Expo SDK 53** - React Nativeのフレームワーク
- **React Native 0.79.6** - クロスプラットフォームモバイルアプリ開発
- **React 19.0.0** - UIライブラリ
- **TypeScript 5.8.3** - 型安全な開発環境
- **Expo Router 5** - ファイルベースのルーティング

### スタイリング

- **NativeWind 4.1.23** - Tailwind CSSベースのスタイリング
- **Tailwind CSS 3.4.17** - ユーティリティファーストCSS

### 状態管理・データフェッチング

- **React Query (TanStack Query) 5.85.9** - サーバーステート管理
- **Jotai 2.13.1** - アトミックな状態管理
- **React Hook Form 7.62.0** - フォーム管理
- **Zod 4.1.5** - スキーマバリデーション

## 2. バックエンド・データベース技術選定

### インフラストラクチャ

- **Supabase** - BaaS（認証、データベース、ストレージ）
- **Supabase Edge Functions** - サーバーレス関数
- **PostgreSQL** - データベース（Supabase経由）

### APIフレームワーク

- **Hono 4.7.6** - 軽量WebフレームワークをEdge Functionsで使用
- **Drizzle ORM 0.41.0** - TypeScript型安全なORM

## 3. 開発ツール

### コード品質

- **ESLint 9.25.0** - リンティング
- **Prettier** - コードフォーマッティング

### ビルド・デプロイ

- **EAS Build** - Expoのビルドサービス
- **Vercel** - Webアプリのホスティング（必要に応じて）

## 4. Expo特有の機能活用

### 環境変数管理

```typescript
import Constants from 'expo-constants'
const apiUrl = Constants.expoConfig?.extra?.apiUrl
```

### セキュアストレージ

```typescript
import * as SecureStore from 'expo-secure-store'
await SecureStore.setItemAsync('token', value)
```

### 画像最適化

```typescript
import { Image } from 'expo-image';
<Image
  source={{ uri }}
  placeholder={blurhash}
  contentFit="cover"
  transition={1000}
/>
```

## 5. 技術選定の理由

### Expo SDK 53を選択した理由

- React Nativeの設定の複雑さを軽減
- OTAアップデート機能
- 豊富なネイティブAPIへの簡単なアクセス
- EAS Buildによる効率的なビルドプロセス

### NativeWindを選択した理由

- Tailwind CSSの開発効率をReact Nativeで実現
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

### 実行時パフォーマンス

- React.memoの適切な使用
- useMemo/useCallbackの活用
- 仮想化リストの実装

## 8. 将来の技術選定候補

### 検討中の技術

- **Expo Router v4** - より高度なルーティング機能
- **Tamagui** - パフォーマンス重視のUIライブラリ
- **tRPC** - 型安全なAPI通信

### 導入基準

1. コミュニティの成熟度
2. ドキュメントの充実度
3. 既存技術との互換性
4. パフォーマンスへの影響
5. 学習コスト
