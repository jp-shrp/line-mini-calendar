/**
 * Supabase Edge Functions用の型定義
 */

/**
 * StandardApiErrorインターフェース
 * Edge Functionsから返却されるエラー形式
 */
export interface StandardApiError {
    title: string
    message: string
    code: string
    status: number
    details?: any
}

/**
 * 成功レスポンスの型
 */
export interface SuccessResponse<T = unknown> {
    success: true
    data: T
    message?: string
}

/**
 * バリデーションエラーの詳細
 */
export interface ValidationErrorDetail {
    field: string
    message: string
}

/**
 * Edge Function呼び出しオプション
 */
export interface EdgeFunctionOptions {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
    params?: Record<string, any>
    headers?: Record<string, string>
    skipAuth?: boolean
}
