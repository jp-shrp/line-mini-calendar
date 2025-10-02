/**
 * 成功レスポンスのインターフェース
 * @template T - dataフィールドの型
 */
export interface ISuccessResponse<T = unknown> {
    success: true
    data: T
    message?: string
}

/**
 * 成功レスポンスを生成するクラス
 * @template T - dataフィールドの型
 *
 * @example
 * ```typescript
 * // 基本的な使用例
 * return new SuccessResponse({
 *     data: { id: 1, name: 'User' }
 * })
 *
 * // メッセージ付き
 * return new SuccessResponse({
 *     data: users,
 *     message: 'ユーザー一覧を取得しました'
 * })
 * ```
 */
export class SuccessResponse<T = unknown> {
    private response: ISuccessResponse<T>

    constructor(options: { data: T; message?: string }) {
        this.response = {
            success: true,
            data: options.data,
            message: options.message || 'success',
        }
    }

    /**
     * JSONレスポンスオブジェクトを返す
     */
    toJSON(): ISuccessResponse<T> {
        return this.response
    }

    /**
     * レスポンスデータを取得
     */
    getData(): ISuccessResponse<T> {
        return this.response
    }
}
