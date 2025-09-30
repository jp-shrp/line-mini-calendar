# 開発ガイドライン

このドキュメントは、プロジェクト全体で一貫性のあるコード品質を保つための開発ガイドラインです。

## 🔴 MUST - 絶対に守るべきルール

### 1. スタイリング

- ❌ **禁止**: StyleSheet.create(), インラインstyle属性
- ✅ **必須**: TailwindCssクラスのみ使用

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

### 6. Form戦略（Model First）

- ✅ **必須**: Model firstアプローチでForm実装
- ✅ **必須**: バリデーションはModelに定義
- ✅ **必須**: リクエスト型はModelから取得
- ❌ **禁止**: コンポーネント内での独自スキーマ定義

```tsx
// ✅ 正しい: Model firstアプローチ
// models/samples/Item.ts
export const ItemSchema = z.object({
    id: z.number(),
    name: z
        .string()
        .min(1, '商品名は必須です')
        .max(100, '商品名は100文字以下で入力してください'),
    // ...その他のフィールド
})

// フォーム用型定義をModelで管理
export const CreateItemFormSchema = CreateItemSchema
export type ICreateItemForm = z.infer<typeof CreateItemFormSchema>

export const UpdateItemFormSchema = UpdateItemSchema.omit({ id: true })
export type IUpdateItemForm = z.infer<typeof UpdateItemFormSchema>

// ✅ 正しい: Form ComponentでModelの型を使用
import {
    CreateItemFormSchema,
    UpdateItemFormSchema,
    ICreateItemForm,
    IUpdateItemForm,
    IItemResponse,
} from '@/models/samples/Item'

const form = useForm<ICreateItemForm | IUpdateItemForm>({
    resolver: zodResolver(
        mode === 'create' ? CreateItemFormSchema : UpdateItemFormSchema
    ),
    defaultValues: getDefaultValues(),
})

// ❌ 間違い: コンポーネント内での独自スキーマ定義
const ItemFormSchema = CreateItemSchema.extend({
    isAvailable: z.boolean(), // Modelで定義すべき
})
```

**Form戦略の重要なポイント:**

1. **Model First**: すべての型・バリデーション・スキーマはModelで一元管理
2. **DRY原則**: 同一のバリデーションロジックを重複させない
3. **型安全性**: ModelからExportされた型のみを使用
4. **一貫性**: Create用とUpdate用の型を明確に分離
5. **保守性**: バリデーションルール変更時の影響を一箇所に限定

**高度なForm戦略 - Model Methodの活用:**

```tsx
// ✅ 正しい: ModelでbeforePostable/afterPostableを定義
export class Item extends Model implements IItem {
    convertCache: boolean

    constructor(data?: IIndexable) {
        super()
        this.fillable = fillable
        this.convertCache = this.convert
        if (data) {
            this.data = data
        }
    }

    beforePostable(): void {
        this.convert = false
    }

    afterPostable(res: IIndexable): void {
        this.convert = this.convertCache
    }
}

// ✅ 正しい: getPostable()を使用したForm簡略化
const item = new Item(initialData ?? {})

const getDefaultValues = (): ICreateItemForm | IUpdateItemForm => {
    if (mode === 'edit' && initialData) {
        return {
            ...item.getPostable(),
        } as IUpdateItemForm
    }
    return {
        ...item.getPostable(),
    } as ICreateItemForm
}

// ❌ 間違い: 手動でフィールドマッピング
const getDefaultValues = (): ItemFormData => {
    if (mode === 'edit' && initialData) {
        return {
            name: initialData.name,
            description: initialData.description || '',
            price: initialData.price,
            // ...すべてのフィールドを手動で指定
        }
    }
    // ...
}
```

**Model Methodsの利点:**

- **beforePostable**: API送信前の前処理（convert設定等）
- **afterPostable**: API送信後の後処理（convert設定復元等）
- **getPostable()**: フィールド手動指定を排除し、Modelが管理

**fillableの型制約:**

```tsx
// ✅ 正しい: relationを含むfillable型定義
type IFillable = IUpdateItem & { detail: string }

const fillable = defineAllKeys<IFillable>()([
    'id',
    'name',
    'description',
    'price',
    'category',
    'imagePath',
    'stock',
    'isAvailable',
    'createdAt',
    'updatedAt',
    'detail', // relationもfillableで管理可能
])

// ❌ 間違い: 型制約なしのfillable定義
const fillable = [
    'id',
    'name',
    // ...存在しないフィールドも追加可能（型エラーなし）
    'nonExistentField', // 実行時エラーの原因
]
```

**fillable型制約の利点:**

- **型安全性**: 存在しないフィールドの指定を防止
- **IntelliSense**: 利用可能なフィールドの自動補完
- **リファクタリング**: フィールド名変更時の自動更新

### 7. SSRファースト

- ✅ **必須**: SSR前提のページから作成する
- ✅ **必須**: SSRページで動的な処理が必要な場合はcomponentに切り出しCSRで作成する

```tsx
// ✅ 正しい: SSRページコンポーネント
export default async function ProductPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    // サーバーサイドでデータフェッチ
    const product = await getProduct(id)

    return (
        <div className="p-4">
            <h1>{product.name}</h1>
            <p>{product.description}</p>
            {/* 動的な処理が必要な部分はClientComponentに分離 */}
            <ProductInteractionClient productId={product.id} />
        </div>
    )
}

// ✅ 正しい: 動的処理をCSRで分離
;('use client')
export function ProductInteractionClient({ productId }: { productId: string }) {
    const [favorite, setFavorite] = useState(false)

    return (
        <button onClick={() => setFavorite(!favorite)}>
            {favorite ? '❤️' : '🤍'} お気に入り
        </button>
    )
}
```

**SSR vs CSR 判断基準:**

- **SSR適用場面**:
    - 初期表示データが必要（商品詳細、記事内容など）
    - SEO重要コンテンツ（メタタグ、構造化データ）
    - 静的UI（ヘッダー、フッター、ナビゲーション）
    - パフォーマンス重視の初期表示

- **CSR適用場面**:
    - ユーザーインタラクション（ボタンクリック、フォーム操作）
    - リアルタイム更新（チャット、通知、ライブデータ）
    - フォーム入力・バリデーション
    - `useState`、`useEffect`等のReactフックが必要
    - ブラウザ専用API使用（localStorage、geolocation等）

### 8. SSRエラーハンドリング

- ✅ **必須**: SSRページコンポーネントではtry-catchを行わない
- ✅ **必須**: エラーハンドリングはNext.jsのError Boundaryに委ねる
- ✅ **必須**: Actionでは`customErrorMessage`付きでAPIを呼び出す
- ✅ **必須**: error.tsxでユーザーフレンドリーなエラー画面を提供

```tsx
// ✅ 正しい: SSRページでのエラーハンドリング
export default async function ProductListPage() {
    // try-catchは行わず、エラー時はNext.jsのError Boundaryに委ねる
    const products = await getProductsWithError('500') // エラー時は例外がthrowされる

    return (
        <div className="p-4">
            <h1>商品一覧</h1>
            {products.map((product) => (
                <div key={product.id}>{product.name}</div>
            ))}
        </div>
    )
}

// ✅ 正しい: Action関数での実装
export const getProductsWithError = async (
    errorType: '400' | '500'
): Promise<Product[]> => {
    const response = await apiClient.get<Product[]>('/api/products', {
        fallbackData: [],
        customErrorMessage: '商品の取得に失敗しました', // エラー時にthrowされる
    })
    return response
}

// ✅ 正しい: Error Boundary実装 (error.tsx)
;('use client')

interface ErrorPageProps {
    error: Error & { digest?: string }
    reset: () => void
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex min-h-[400px] flex-col items-center justify-center">
                <h1 className="text-4xl font-bold text-red-600">
                    エラーが発生しました
                </h1>
                <p className="mt-4 text-gray-600">
                    {error.message || 'データの取得に失敗しました'}
                </p>
                <button
                    onClick={reset}
                    className="mt-6 rounded-lg bg-blue-600 px-6 py-3 text-white">
                    再試行
                </button>
            </div>
        </div>
    )
}
```

**エラーハンドリングの流れ:**

1. **Action関数**: `customErrorMessage`付きでAPI呼び出し、エラー時は例外throw
2. **SSRページ**: try-catchは行わず、例外をNext.jsに委ねる
3. **Error Boundary**: error.tsxでエラーをキャッチし、ユーザーフレンドリーな画面表示

### 9. ディレクトリ構成

- ✅ **必須**: 以下の標準ディレクトリ構成に従う

```
feature-name/
├── page.tsx          # Next.js App Router Page Component
├── error.tsx         # Error Boundary (必要に応じて)
├── components/       # UI Components
│   ├── FeatureClient.tsx    # Client Component (useHookを呼び出し)
│   ├── MainView.tsx         # Presentational Component
│   └── SubComponent.tsx     # 機能固有のコンポーネント
├── hooks/           # Custom Hooks
│   └── useFeature.ts       # Business Logic Hook
├── api/             # API関連
│   ├── query-key.ts        # React Query Keys
│   └── feature-query.ts    # Query Functions
└── [id]/            # 動的ルート (必要に応じて)
    ├── page.tsx
    ├── components/
    ├── hooks/
    └── api/
```

**命名規則:**

- **Client Component**: `FeatureClient.tsx` (useHookを呼び出し、MainViewにpropsを渡す)
- **Hook**: `useFeature.ts` (APIクエリーフックを呼び出し、ビジネスロジックを処理)
- **Query**: `useFeatureQuery.ts` (React Queryを使用したAPI呼び出し)
- **Query Key**: クエリキーは階層構造で定義

**Hook+View分離パターン（Propsの簡略化）:**

**パターンA: 1ファイル内でhookとviewを分離**

```tsx
// components/UserList.tsx
import { useOnLoading } from '@/contexts/OnLoadingContext'

const useUserList = () => {
    const [users, setUsers] = useState<User[]>([])
    const { onLoad } = useOnLoading()

    const fetchUsers = async () => {
        await onLoad(async () => {
            // fetch logic
        })
    }

    return {
        users,
        fetchUsers,
    }
}

const MainView: FC<ReturnType<typeof useUserList>> = ({
    users,
    fetchUsers,
}) => {
    return (
        <View className="flex-1 p-4">
            {users.map((user) => (
                <Text key={user.id}>{user.name}</Text>
            ))}
        </View>
    )
}

export const UserList = () => {
    const hookItems = useUserList()
    return <MainView {...hookItems} />
}
```

**パターンB: hookとviewを完全に分離**

```tsx
// hooks/useUserDetail.ts
import { useOnLoading } from '@/contexts/OnLoadingContext'

export const useUserDetail = (userId: string) => {
    const [user, setUser] = useState<User | null>(null)
    const { onLoad } = useOnLoading()

    const fetchUser = async () => {
        await onLoad(async () => {
            // fetch logic
        })
    }

    return {
        user,
        fetchUser,
    }
}

// components/UserDetail.tsx
import { useUserDetail } from './hooks/useUserDetail'

const MainView: FC<ReturnType<typeof useUserDetail>> = ({
    user,
    fetchUser,
}) => {
    if (!user) return <Text>User not found</Text>

    return (
        <View className="flex-1 p-4">
            <Text className="text-xl font-bold">{user.name}</Text>
            <Text className="text-gray-600">{user.email}</Text>
        </View>
    )
}

export const UserDetail = ({ userId }: { userId: string }) => {
    const hookItems = useUserDetail(userId)
    return <MainView {...hookItems} />
}
```

**React Query統合パターン:**

```tsx
// ✅ 正しいパターン: API + Hook + Component 統合

// 1. Query Keys定義 (api/query-key.ts)
export const featureQueryKeys = {
    all: ['feature'] as const,
    items: () => [...featureQueryKeys.all, 'items'] as const,
    lists: () => [...featureQueryKeys.items(), 'list'] as const,
    list: (filters: Record<string, unknown>) =>
        [...featureQueryKeys.lists(), { filters }] as const,
    details: () => [...featureQueryKeys.items(), 'detail'] as const,
    detail: (id: number) => [...featureQueryKeys.details(), id] as const,
}

// 2. Query Hook定義 (api/feature-query.ts)
import { useQuery, UseQueryOptions } from '@tanstack/react-query'

// 基本的なQuery Hook
export const useFeatureListQuery = <TData = Feature[],>(
    options?: Omit<
        UseQueryOptions<
            Feature[],
            Error,
            TData,
            ReturnType<typeof featureQueryKeys.lists>
        >,
        'queryKey' | 'queryFn'
    >
) => {
    return useQuery({
        queryKey: featureQueryKeys.lists(),
        queryFn: () => getFeatureList(),
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        ...options,
    })
}

// パラメータ付きQuery Hook
export const useFeatureDetailQuery = <TData = Feature | null,>(
    id: number,
    options?: Omit<
        UseQueryOptions<
            Feature | null,
            Error,
            TData,
            ReturnType<typeof featureQueryKeys.detail>
        >,
        'queryKey' | 'queryFn'
    >
) => {
    return useQuery({
        queryKey: featureQueryKeys.detail(id),
        queryFn: () => getFeatureDetail(id),
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        ...options,
    })
}

// エラーハンドリング付きQuery Hook
export const useFeatureWithErrorQuery = <TData = Feature[],>(
    errorType: '400' | '500',
    options?: Omit<
        UseQueryOptions<
            Feature[],
            Error,
            TData,
            ReturnType<typeof featureQueryKeys.lists>
        >,
        'queryKey' | 'queryFn'
    >
) => {
    return useQuery({
        queryKey: featureQueryKeys.lists(),
        queryFn: () => getFeatureWithError(errorType),
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        retry: false, // エラー時はリトライしない
        ...options,
    })
}

// 3. Business Logic Hook (hooks/useFeature.ts)
const useFeature = () => {
    const { data, isLoading, error, refetch } = useFeatureListQuery()

    return {
        items: data || [],
        isLoading,
        error,
        refetch,
    }
}

// 4. Client Component (components/FeatureClient.tsx)
const FeatureClient = () => {
    const hookData = useFeature()
    return <MainView {...hookData} />
}
```

**Business Logic Hook (use○○) の実装パターン:**

Business Logic Hookは以下の要素を組み合わせて実装します：

1. **useState**: コンポーネント固有の状態管理
2. **React Query Hooks**: API呼び出しとキャッシュ管理
3. **useCallback**: ハンドラー関数の最適化
4. **ビジネスロジック関数**: UI操作に必要な処理
5. **統一された戻り値**: UI表示に必要なすべての値・関数

```tsx
// ✅ 正しい Business Logic Hook の実装例
export const useItemEdit = (id: number) => {
    // 1. コンポーネント固有の状態
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState<Error | null>(null)

    // 2. React Query Hook呼び出し
    const {
        data: item,
        isLoading,
        error: fetchError,
        refetch,
    } = useItemDetailQuery(id)

    // 3. ビジネスロジック関数（useCallbackで最適化）
    const handleSubmit = useCallback(
        async (formData: Partial<IItemResponse>) => {
            setIsSubmitting(true)
            setSubmitError(null)

            try {
                // API呼び出し処理
                const result = await apiClient.put(`/items/${id}`, formData)

                // 成功時の処理
                await refetch()
                return { success: true, data: result }
            } catch (error) {
                const errorObj = error as Error
                setSubmitError(errorObj)
                return { success: false, error: errorObj }
            } finally {
                setIsSubmitting(false)
            }
        },
        [id, refetch]
    )

    const handleRetry = useCallback(async () => {
        return refetch()
    }, [refetch])

    // 4. UI表示に必要なすべての値・関数を返す
    return {
        // データ関連
        data: item,
        isLoading,
        error: fetchError,

        // フォーム送信関連
        isSubmitting,
        submitError,

        // ハンドラー関数
        handleSubmit,
        handleRetry,
        refetch,
    }
}
```

**Mutation Hook外出しパターン:**

Mutation処理も同様に`api/〇〇-query.ts`に外出しすることで、コードの再利用性と保守性を向上させることができます。

```tsx
// ✅ パターン1: api/〇〇-query.tsでMutation Hook定義

// api/samples-query.ts
import {
    useApiMutation,
    UseApiMutationFormOptions,
} from '@/lib/universal-api-client'
import { createItem, updateItem } from '@/actions/ItemAction'
import {
    ICreateItemForm,
    IUpdateItemForm,
    IItemResponse,
} from '@/models/samples/Item'

// Create用のMutation Hook
export const useCreateItemMutation = <
    TForm extends FieldValues = ICreateItemForm,
>(
    form: UseFormReturn<TForm>,
    options?: Omit<UseApiMutationFormOptions<IItemResponse, TForm>, 'action'>
) => {
    return useApiMutation(form, {
        action: async (data: TForm) => {
            return (await createItem(data as unknown as ICreateItemForm)) as any
        },
        ...options,
    })
}

// Update用のMutation Hook
export const useUpdateItemMutation = <
    TForm extends FieldValues = IUpdateItemForm & { id: number },
>(
    form: UseFormReturn<TForm>,
    options?: Omit<UseApiMutationFormOptions<IItemResponse, TForm>, 'action'>
) => {
    return useApiMutation(form, {
        action: async (data: TForm) => {
            const updateData = data as unknown as IUpdateItemForm & {
                id: number
            }
            return (await updateItem({ ...updateData } as IUpdateItem)) as any
        },
        ...options,
    })
}

// コンポーネントでの使用例
// components/ItemForm.tsx
import {
    useCreateItemMutation,
    useUpdateItemMutation,
} from '../api/samples-query'

const itemMutation =
    mode === 'create'
        ? useCreateItemMutation(form, { onSuccess: handleSuccess })
        : useUpdateItemMutation(form, { onSuccess: handleSuccess })
```

```tsx
// ✅ パターン2: コンポーネント内でuseApiMutation直接使用（シンプルな場合）

// components/ItemForm422.tsx
import { useApiMutation } from '@/lib/universal-api-client'

const editMutation = useApiMutation(form, {
    action: async (formData: ItemEditFormData) => {
        return await updateWithValidationError(formData)
    },
    onSuccess: (_data) => {
        // 成功処理
    },
    onError: (_error) => {
        // エラーハンドリング
    },
})
```

**外出しパターンの使い分け:**

- **api/〇〇-query.ts使用**: 複数のコンポーネントで共通利用、複雑なロジック、DRY原則重視
- **コンポーネント内直接使用**: 単一コンポーネント限定、シンプルなロジック、テスト用途

**React Query 高度な設定パターン:**

```tsx
// パラメータ付き + オプション設定のQuery Hook統合パターン
export const useFeatureAdvancedQuery = <TData = Feature[],>(
    params?: {
        limit?: number
        offset?: number
        enabled?: boolean
    },
    options?: Omit<
        UseQueryOptions<
            Feature[],
            Error,
            TData,
            ReturnType<typeof featureQueryKeys.list>
        >,
        'queryKey' | 'queryFn' | 'enabled'
    >
) => {
    const { limit, offset, enabled = true } = params || {}

    return useQuery({
        queryKey: featureQueryKeys.list({ limit, offset }),
        queryFn: () => getFeatureList(limit, offset),
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        enabled,
        ...options,
    })
}

// 使用例: 条件付きクエリー実行
const { data, isLoading, error } = useFeatureAdvancedQuery(
    {
        limit: 10,
        offset: 0,
        enabled: false, // 初期状態では無効
    },
    {
        retry: 3,
        retryDelay: 1000,
    }
)
```

**React Query refetchエラーハンドリング:**

```tsx
// ✅ 正しい: refetchエラーをonLoadでハンドリングする場合
const { refetch: loadMore, error: loadMoreError } = useItemsWithErrorQuery(
    '400',
    5,
    5,
    {
        enabled: false,
    }
)

const handleLoadMore = async () => {
    await onLoad(async () => {
        const result = await loadMore()

        // React Queryのrefetchは例外をthrowしないため、手動でエラーチェック
        if (result.error) {
            throw result.error
        }

        return result
    })
}

// ❌ 間違い: refetchエラーがonLoadでキャッチされない
const handleLoadMoreIncorrect = async () => {
    await onLoad(async () => {
        await loadMore() // エラーが発生してもthrowされない
    })
}
```

**重要な注意点:**

- React Queryの`refetch`はエラーが発生しても例外をthrowしない
- `onLoad`でエラーモーダルを表示したい場合は、手動でエラーチェックが必要
- `result.error`が存在する場合は明示的に`throw`すること

### 10. CSRデータ取得エラーハンドリング

- ✅ **必須**: CSRでのデータ取得にはQueryStateHandlerを使用する
- ✅ **必須**: エラー表示が必要な場合は`suppressErrorThrow={true}`を設定 (default = false)
- ✅ **必須**: カスタムエラーUIが必要な場合は`errorComponent`を使用

```tsx
// ✅ 正しい: QueryStateHandlerを使用したCSRエラーハンドリング

// Client Component
'use client'

import { QueryStateHandler } from '@/components/QueryStateHandler'
import { useDataQuery } from './api/data-query'

const DataClient = ({ id }: { id: string }) => {
    const { data, isLoading, error } = useDataQuery(id, '400') // エラーテスト用

    return (
        <QueryStateHandler
            data={data}
            isLoading={isLoading}
            error={error}
            suppressErrorThrow={true} // エラーを画面表示する場合
            useGlobalLoading={false}
            loadingMessage="データを読み込み中..."
            errorComponent={
                <div className="rounded-lg border border-red-200 bg-red-50 p-6">
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100">
                                <span className="text-red-600">⚠️</span>
                            </div>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-lg font-semibold text-red-800">
                                データ取得エラー
                            </h3>
                            <p className="mt-2 text-red-600">
                                データの取得に失敗しました。
                            </p>
                            <p className="mt-2 text-sm text-red-500">
                                エラー詳細:{' '}
                                {error?.message || '予期しないエラー'}
                            </p>
                        </div>
                    </div>
                </div>
            }>
            {(data) => (
                <div>
                    <h1>データ表示</h1>
                    {data && <p>{data.name}</p>}
                </div>
            )}
        </QueryStateHandler>
    )
}

// SSR Page Component
export default async function DataPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params

    return (
        <div className="container mx-auto px-4 py-8">
            <h1>データページ</h1>
            <DataClient id={id} />
        </div>
    )
}
```

**CSRエラーハンドリングパターン:**

1. **SSRページ**: 静的UIの表示、paramsの解決、Client Componentの呼び出し
2. **Client Component**: QueryStateHandlerでデータ取得とエラーハンドリング
3. **QueryStateHandler**: 統一されたローディング・エラー・成功状態の管理

**suppressErrorThrow使用ガイドライン:**

- `suppressErrorThrow={true}`: カスタムエラーUIを表示したい場合
- `suppressErrorThrow={false}` (デフォルト): エラーモーダル表示やError Boundaryに委ねる場合

## 🟡 SHOULD - 推奨ルール

### 1. コンポーネント設計

- 単一責任原則に従う
- 再利用可能性を考慮した設計
- Props の型定義を明確にする
- Hook+View分離パターンの活用（上記パターンA/Bを使い分け）
- `ReturnType<typeof useCustomHook>`によるProps型の自動推論

### 2. ファイル構成・組織化

- 機能ごとにディレクトリを分ける
- util, component, hook の適切な切り出し
- 共通処理の積極的な再利用
- パターンAは小〜中規模なコンポーネントに適用
- パターンBは大規模・複雑なコンポーネントに適用

### 3. エラーハンドリング

- 適切なエラーバウンダリの設置
- ユーザーフレンドリーなエラーメッセージ
- エラーログの適切な出力

## 🟢 NICE TO HAVE - あると良いルール

### 1. パフォーマンス

- メモ化の適切な使用
- 不要な再レンダリングの回避
- 遅延読み込みの活用

### 2. アクセシビリティ

- セマンティックなHTML要素の使用
- 適切なaria属性の設定
- キーボードナビゲーションの対応

### 3. テスト

- 単体テストの作成
- 統合テストの実装
- E2Eテストの考慮

## チェックリスト

開発完了前に以下を確認してください：

- [ ] `yarn format` が正常に完了する
- [ ] `yarn type-check` でエラーがない
- [ ] `yarn lint` でエラーがない
- [ ] `yarn test` が全て通る
- [ ] 上記のMUSTルールをすべて遵守している
- [ ] DRY原則を守っている
- [ ] 適切なdocumentationが作成・更新されている
