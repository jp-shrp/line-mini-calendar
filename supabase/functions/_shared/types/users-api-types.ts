/**
 * Users API関連の型定義
 * クライアント側とEdge Functions側で共通利用
 * Schema firstアプローチで型を生成
 */

import type { InsertUser, SelectUser, UpdateUser } from '_shared/schemas/users'

// Schemaから生成された型を再エクスポート
export type User = SelectUser

// API固有のレスポンス型定義
export interface UsersListResponse {
    users: User[]
    total: number
    page: number
    pageSize: number
}

export interface UserDetailResponse {
    user: User
}

// API固有の入力型定義（Schemaの型をベースに拡張）
export type CreateUserInput = Omit<InsertUser, 'id' | 'createdAt' | 'updatedAt'>
export type UpdateUserInput = UpdateUser
