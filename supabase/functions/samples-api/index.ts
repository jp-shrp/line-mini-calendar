import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import {
    apiHandler,
    createBadRequestError,
    createInternalServerError,
    initApi,
    type Variables,
} from '../_shared/middlewares/middleware.ts'

// サブAPIのインポート
import samplesUsersApi from './samples-users-api.ts'

// 型拡張 - Honoのコンテキストにユーザー情報を追加

export type SamplesVariables = Variables & {
    user: any
    supabase: any
}

// 共通初期化関数を使ってAPIアプリケーションを初期化
const app = initApi<{ Variables: SamplesVariables }>('/samples-api')

// テスト用エラーエンドポイント
app.get(
    '/test-error/400',
    apiHandler(async (c) => {
        throw createBadRequestError('これはテスト用の400エラーです')
    })
)

app.get(
    '/test-error/500',
    apiHandler(async (c) => {
        throw createInternalServerError(
            'これはテスト用の500エラーです。システムエラーをシミュレートしています。'
        )
    })
)

// GETリクエストで動的にエラータイプを指定できるエンドポイント
app.get(
    '/error-test',
    apiHandler(async (c) => {
        const errorType = c.req.query('errorType')

        if (errorType === '400') {
            throw createBadRequestError(
                'これはテスト用の400エラーです。不正なリクエストをシミュレートしています。'
            )
        } else if (errorType === '500') {
            throw createInternalServerError(
                'これはテスト用の500エラーです。システムエラーをシミュレートしています。'
            )
        }

        return c.json({
            message: 'エラーテスト用エンドポイントです',
            errorType: errorType || 'none',
        })
    })
)

// POSTリクエストで動的にエラータイプを指定できるエンドポイント
app.post(
    '/error-test',
    apiHandler(async (c) => {
        const body = await c.req.json()
        const { errorType } = body

        if (errorType === '400') {
            throw createBadRequestError(
                'これはテスト用の400エラーです。不正なリクエストをシミュレートしています。'
            )
        } else if (errorType === '500') {
            throw createInternalServerError(
                'これはテスト用の500エラーです。システムエラーをシミュレートしています。'
            )
        }

        return c.json({
            message: 'エラーテスト用エンドポイントです',
            errorType: errorType || 'none',
        })
    })
)

// ルート定義
app.get(
    '/',
    apiHandler(async (c) => {
        return c.json({
            message: 'Samples API is running',
            timestamp: new Date().toISOString(),
        })
    })
)

// サブAPIをルーティング
app.route('/users', samplesUsersApi)

// Deno Edge Functions用のexport
Deno.serve(app.fetch)
