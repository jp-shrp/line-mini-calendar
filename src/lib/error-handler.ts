import type { StandardApiError, ValidationErrorDetail } from '@/src/types/api'

/**
 * StandardApiError形式かどうかを判定する型ガード
 */
export function isStandardApiError(error: unknown): error is StandardApiError {
    return (
        error !== null &&
        typeof error === 'object' &&
        'title' in error &&
        'message' in error &&
        'code' in error &&
        'status' in error
    )
}

/**
 * バリデーションエラー（422）かどうかを判定
 */
export function isValidationError(error: unknown): boolean {
    return isStandardApiError(error) && error.status === 422
}

/**
 * バリデーションエラーの詳細を抽出
 */
export function extractValidationErrors(
    error: unknown
): ValidationErrorDetail[] | undefined {
    if (!isStandardApiError(error)) return undefined

    const details = (error as any)?.details
    if (Array.isArray(details)) {
        return details as ValidationErrorDetail[]
    }
    return undefined
}

/**
 * エラーレスポンスをパースしてStandardApiError形式に変換
 */
export async function parseErrorResponse(
    response: Response
): Promise<StandardApiError> {
    try {
        const data = await response.json()

        if (isStandardApiError(data)) {
            return data
        }

        // StandardApiError形式でない場合は変換
        return {
            title: data.title || 'エラーが発生しました',
            message: data.message || 'システムで問題が発生しました',
            code: data.code || 'UNKNOWN_ERROR',
            status: response.status,
            details: data.details,
        }
    } catch {
        // JSONパースに失敗した場合
        return {
            title: 'エラーが発生しました',
            message: 'システムで問題が発生しました',
            code: 'PARSE_ERROR',
            status: response.status,
        }
    }
}

/**
 * 認証エラー（401, 403）かどうかを判定
 */
export function isAuthError(error: unknown): boolean {
    if (!isStandardApiError(error)) return false
    return error.status === 401 || error.status === 403
}

/**
 * エラーメッセージを整形して返す
 */
export function getErrorMessage(error: unknown): string {
    if (isStandardApiError(error)) {
        return error.message
    }

    if (error instanceof Error) {
        return error.message
    }

    return 'システムで問題が発生しました'
}
