/**
 * システム全体で使用するエラーコードの定数定義
 * 各APIで統一されたエラーハンドリングを行うために使用
 */
export const ERROR_CODES = {
    // 認証・認可関連
    UNAUTHORIZED: 'UNAUTHORIZED',
    FORBIDDEN: 'FORBIDDEN',
    TOKEN_EXPIRED: 'TOKEN_EXPIRED',

    // バリデーション関連
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    INVALID_REQUEST: 'INVALID_REQUEST',

    // データ関連
    NOT_FOUND: 'NOT_FOUND',
    ALREADY_EXISTS: 'ALREADY_EXISTS',

    // システム関連
    INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
} as const

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES]

/**
 * 標準化されたAPIエラーレスポンス形式
 * 全てのAPIエラーはこの形式で返却される
 */
export interface StandardApiError {
    title: string
    message: string
    code: ErrorCode
    status: number
    details?: any
}
