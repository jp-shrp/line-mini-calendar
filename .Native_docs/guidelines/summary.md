# 🚨 プロジェクトガイドライン - サマリ版

**このドキュメントは最優先で適用されるルールです。必ず遵守してください。**

詳細ドキュメント:

- 技術スタック → [`tech-stack.md`](./tech-stack.md)
- コーディング規約 → [`coding-standards.md`](./coding-standards.md)
- API設計 → [`api-design.md`](./api-design.md)
- データベース → [`database.md`](./database.md)
- ベストプラクティス → [`best-practices.md`](./best-practices.md)
- ローディング戦略 → [`loading-strategy.md`](./loading-strategy.md)

## 🔴 MUST - 絶対に守るべきルール

### 1. スタイリング

- ❌ **禁止**: StyleSheet.create(), インラインstyle属性
- ✅ **必須**: NativeWind/Tailwindクラスのみ使用

```tsx
// ❌ 禁止
<View style={{ padding: 16 }} />

// ✅ 正しい
<View className="p-4" />
```

### 2. 条件分岐

- ❌ **禁止**: TSXファイル内での三項演算子
- ✅ **必須**: Early returnパターンまたは論理演算子

```tsx
// ❌ 禁止
{
    isLoading ? <Loading /> : <Content />
}

// ✅ 正しい
if (isLoading) return <Loading />
return <Content />
```

### 3. デバッグコード

- ❌ **禁止**: console.log, console.error等の残留
- ✅ **必須**: 本番コードにデバッグコードを含めない

### 4. インポート

- ❌ **禁止**: 相対パス (../../components)
- ✅ **必須**: 絶対パス (@/components)
- ❌ **禁止**: 未使用のインポート

### 5. 型定義

- ❌ **禁止**: any型の使用
- ✅ **必須**: 明示的な型定義

### 6. エラーハンドリング

- ❌ **禁止**: throw errorによるクラッシュリスク
- ✅ **必須**: Result型パターン + ErrorBoundary

```tsx
// ❌ 禁止
if (!result.success) {
    throw new Error('Failed')
}

// ✅ 正しい
if (!result.success || !result.data) {
    return null // エラーはモーダル自動表示
}
```

## 📁 ディレクトリ構成

```
/
├── app/                # Expo Routerルート
│   ├── (tabs)/        # タブナビゲーション
│   ├── sample/        # サンプル画面
│   └── _layout.tsx    # ルートレイアウト
├── src/               # ソースコード
│   ├── components/    # 再利用可能コンポーネント
│   ├── hooks/         # カスタムフック
│   ├── contexts/      # コンテキスト
│   ├── lib/           # ユーティリティ
│   ├── constants/     # 定数定義
│   └── screens/       # 画面機能
│       └── sample/    # サンプル画面機能
├── api/               # API関連
│   └── {resource-name}/ # 各リソースAPI
├── db/                # データベース関連
├── types/             # 型定義
└── supabase/
    └── functions/
        ├── _shared/   # 共通コード
        └── {api-name}/ # 各APIエンドポイント
```

## 🏗️ アーキテクチャ原則

### Hook + View分離パターン（必須）

ロジック層とView層を分離し、テスタビリティと保守性を向上。

詳細実装例 → [`coding-standards.md#hook-view分離パターン`](./coding-standards.md)

### 単一責任原則

- 1コンポーネント = 1つの責務
- 1サービス = 1つのドメイン
- 1エンドポイント = 1つのリソース

## 🔧 技術スタック

技術選定の詳細、バージョン情報、設定方法 → [`tech-stack.md`](./tech-stack.md)

## 🎯 命名規則

- **コンポーネント**: PascalCase (`UserList.tsx`)
- **Hook**: camelCase + use prefix (`useUserList.ts`)
- **API**: kebab-case + 複数形 (`users-api`)
- **スキーマ**: snake_case (DB columns)

## ⚠️ エラーハンドリング

### フロントエンド

詳細は → [`coding-standards.md#エラーハンドリング`](./coding-standards.md)

### バックエンド

```tsx
// apiHandler + validatedApiHandlerパターン
app.post(
    '/',
    authMiddleware,
    validatedApiHandler(schema, async (c, validatedData) => {
        // try-catch不要、エラーは自動処理
        return c.json(result)
    })
)
```

## 📝 コミット前チェックリスト

1. [ ] console.log削除
2. [ ] 未使用import削除
3. [ ] TypeScript型エラーなし
4. [ ] ESLintエラーなし
5. [ ] Prettierフォーマット適用

## 📚 詳細ドキュメント

各詳細は以下のファイルを参照:

- `tech-stack.md` - 技術選定詳細
- `best-practices.md` - ベストプラクティス
- `api-design.md` - API設計ガイド
- `coding-standards.md` - コーディング規約詳細
- `database.md` - DB設計とマイグレーション
- `loading-strategy.md` - ローディング戦略ガイドライン

---

**重要**: このサマリに記載されたルールは、他のドキュメントよりも優先されます。
