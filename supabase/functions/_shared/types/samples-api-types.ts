import { PaginationInfo } from '_shared/paginationUtility'
import type { InsertUser, SelectUser, UpdateUser } from '_shared/schemas/users'

// Schemaから生成された型を再エクスポート
export type SampleUser = SelectUser

// API固有の入力型定義（Schemaの型をベースに拡張）
export type CreateSampleUserInput = Omit<
    InsertUser,
    'id' | 'created_at' | 'updated_at'
>
export type UpdateSampleUserInput = Partial<
    Omit<UpdateUser, 'id' | 'created_at' | 'updated_at'>
>

// レスポンス型定義
export interface SampleUsersListResponse {
    success: boolean
    data: {
        users: SampleUser[]
        pagination: PaginationInfo
    }
    message: string
}

export interface SampleUserDetailResponse {
    success: boolean
    data: {
        user: SampleUser
    }
    message: string
}

export interface SampleUserCreateResponse {
    success: boolean
    data: {
        user: SampleUser
    }
    message: string
}

export interface SampleUserUpdateResponse {
    success: boolean
    data: {
        user: SampleUser
    }
    message: string
}

export interface SampleUserDeleteResponse {
    success: boolean
    data: {
        deleted: boolean
        userId: string
    }
    message: string
}
