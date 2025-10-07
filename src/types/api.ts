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
 * カスタムエラークラス
 * Edge Functionからのエラー情報（status等）を保持する
 * Next.jsのError Boundaryでシリアライズされてもデータが失われないようにmessageにJSON埋め込み
 */
export class CustomError extends Error {
    status?: number
    code?: string
    title?: string
    details?: any

    constructor(
        message: string,
        options?: {
            status?: number
            code?: string
            title?: string
            details?: any
        }
    ) {
        // エラー情報をJSON形式でmessageに埋め込む
        const errorData = {
            message,
            status: options?.status,
            code: options?.code,
            title: options?.title,
            details: options?.details,
        }
        super(`__CUSTOM_ERROR__${JSON.stringify(errorData)}__CUSTOM_ERROR__`)
        this.name = 'CustomError'
        this.status = options?.status
        this.code = options?.code
        this.title = options?.title
        this.details = options?.details
    }

    /**
     * messageからエラー情報を抽出する静的メソッド
     */
    static parseErrorMessage(errorMessage: string): {
        message: string
        status?: number
        code?: string
        title?: string
        details?: any
    } | null {
        const match = errorMessage.match(
            /__CUSTOM_ERROR__(.*?)__CUSTOM_ERROR__/
        )
        if (match && match[1]) {
            try {
                return JSON.parse(match[1])
            } catch {
                return null
            }
        }
        return null
    }
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
    error?: {
        title: string
        message: string
    }
    /**
     * カスタムエラーメッセージ
     * 指定された場合、エラー時にこのメッセージでErrorをthrowします
     * SSRでNext.jsのError Boundaryに委ねる場合に使用
     */
    customErrorMessage?: string
}
