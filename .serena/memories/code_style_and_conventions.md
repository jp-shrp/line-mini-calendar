# コードスタイルと規約

## 重要: `.docs/guideline.md`の遵守が必須

すべての開発において`.docs/guideline.md`の内容を**MUST**（必ず）遵守すること。

## 基本原則

1. **単一責任原則**に則りコードを作成
2. 日本語で応答・コメント記述
3. DRY原則を重視し必ず守ること

## スタイリング規則（MUST）

- ✅ **必須**: TailwindCSSクラスのみ使用
- ❌ **禁止**: `StyleSheet.create()`, インライン`style`属性

```tsx
// ❌ 禁止
<View style={{ padding: 16 }} />

// ✅ 正しい
<View className="p-4" />
```

## 条件分岐規則（MUST）

- ✅ **必須**: Early returnパターンまたは論理演算子
- ❌ **禁止**: TSXファイル内での三項演算子

```tsx
// ❌ 禁止
{isLoading ? <Loading /> : <Content />}

// ✅ 正しい
if (isLoading) return <Loading />
return <Content />
```

## インポート規則（MUST）

- ✅ **必須**: 絶対パス (`@/components`)
- ❌ **禁止**: 相対パス (`../../components`)
- ❌ **禁止**: 未使用のインポート

## 型定義規則（MUST）

- ✅ **必須**: 明示的な型定義
- ❌ **禁止**: `any`型の使用
- ✅ **必須**: Schema Firstアプローチ（Drizzle ORM → Zod → 型定義）

## コンポーネント設計（MUST）

### Hook+View分離パターン
すべてのClient Componentで必須適用:

```tsx
// hooks
const useFeature = () => {
    const [state, setState] = useState()
    return { state, setState }
}

// view
const MainView: FC<ReturnType<typeof useFeature>> = ({ state, setState }) => {
    return <div>{state}</div>
}

// component
export const Feature = () => {
    const hookItems = useFeature()
    return <MainView {...hookItems} />
}
```

## SSR/CSR戦略（MUST）

- ✅ **必須**: SSR前提でページ作成
- ✅ **必須**: 動的処理が必要な場合はCSRコンポーネントに分離

**SSR適用**: 初期データ、SEO重要、静的UI
**CSR適用**: インタラクション、リアルタイム、フォーム、Reactフック使用

## エラーハンドリング（MUST）

### SSR
- try-catchは行わない
- Next.jsのError Boundaryに委ねる
- `error.tsx`でエラー画面提供

### CSR
- `QueryStateHandler`コンポーネント活用
- `useSupabaseQuery`で自動エラーハンドリング

## デバッグコード（MUST）

- ❌ **禁止**: `console.log`, `console.error`の残留
- ✅ **必須**: 本番コードにデバッグコードを含めない

## 命名規則

### フロントエンド
- Client Component: `FeatureClient.tsx`
- Hook: `useFeature.ts`
- Query: `useFeatureQuery.ts`

### バックエンド
- リソース名: 複数形、ハイフン区切り（例: `users-api`）
- テーブル名: 複数形、snake_case（例: `users`, `order_items`）
- カラム名: snake_case（例: `created_at`, `is_active`）
- 外部キー: `{テーブル名単数形}_id`（例: `user_id`）