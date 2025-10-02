import { ERROR_CODES, type ErrorCode } from '_shared/types/common/errors'

/**
 * エラーコードに対応する日本語メッセージのマッピング
 * フロントエンド・バックエンド両方で共通利用
 */
export const ERROR_MESSAGE_MAP: Record<
    ErrorCode,
    { title: string; message: string }
> = {
    // 認証・認可関連
    [ERROR_CODES.UNAUTHORIZED]: {
        title: '認証エラー',
        message: 'ログインが必要です。再度ログインしてください。',
    },
    [ERROR_CODES.FORBIDDEN]: {
        title: 'アクセス権限エラー',
        message: 'この操作を実行する権限がありません。',
    },
    [ERROR_CODES.TOKEN_EXPIRED]: {
        title: 'アクセス権限エラー',
        message: 'この操作を実行する権限がありません。',
    },

    // バリデーション関連
    [ERROR_CODES.VALIDATION_ERROR]: {
        title: '入力内容エラー',
        message: '入力内容に不備があります。内容をご確認ください。',
    },
    [ERROR_CODES.INVALID_REQUEST]: {
        title: '入力内容エラー',
        message: '入力内容に不備があります。内容をご確認ください。',
    },

    // リソース関連
    [ERROR_CODES.NOT_FOUND]: {
        title: 'データが見つかりません',
        message: '指定された情報が見つかりませんでした。',
    },
    [ERROR_CODES.ALREADY_EXISTS]: {
        title: 'データ重複エラー',
        message: '同じ内容が既に登録されています。',
    },

    [ERROR_CODES.INTERNAL_SERVER_ERROR]: {
        title: 'エラーが発生',
        message: 'エラーが発生しました。',
    },
}

/**
 * エラーコードから日本語メッセージを取得する
 * @param code エラーコード
 * @param customMessage カスタムメッセージ（指定した場合は優先）
 * @param customTitle カスタムタイトル（指定した場合は優先）
 * @returns タイトルとメッセージ
 */
export const getErrorMessage = (
    code: ErrorCode,
    customMessage?: string,
    customTitle?: string,
): { title: string; message: string } => {
    const defaultMessages =
        ERROR_MESSAGE_MAP[code] ||
        ERROR_MESSAGE_MAP[ERROR_CODES.INTERNAL_SERVER_ERROR]

    return {
        title: customTitle || defaultMessages.title,
        message: customMessage || defaultMessages.message,
    }
}
