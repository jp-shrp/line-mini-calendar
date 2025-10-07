/**
 * Categories API関連の型定義
 * クライアント側とEdge Functions側で共通利用
 * Schema firstアプローチで型を生成
 */

import type {
    InsertCategory,
    SelectCategory,
    UpdateCategory,
} from '_shared/schemas/categories'

// Schemaから生成された型を再エクスポート
export type Category = SelectCategory

// APIクエリパラメータの型定義
export interface CategoriesQueryParams {
    includeSystemDefaults?: boolean // システムデフォルトカテゴリを含むか
}

// API固有のレスポンス型定義
export interface CategoriesListResponse {
    categories: Category[]
    total: number
}

export interface CategoryDetailResponse {
    category: Category
}

// API固有の入力型定義（Schemaの型をベースに拡張）
export type CreateCategoryInput = Omit<
    InsertCategory,
    'id' | 'userId' | 'isSystemDefault' | 'createdAt'
>
export type UpdateCategoryInput = Omit<
    UpdateCategory,
    'id' | 'userId' | 'isSystemDefault' | 'createdAt'
>
