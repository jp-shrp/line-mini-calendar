import {
    apiHandler,
    createApiError,
    createNotFoundError,
    validatedApiHandler,
} from '_shared/middlewares/middleware'
import { getPaginationInfoFromRequest } from '_shared/paginationUtility'
import { users } from '_shared/schemas/users'
import { SuccessResponse } from '_shared/types/responses'
import {
    createSampleUserSchema,
    updateSampleUserSchema,
    type CreateSampleUserFormData,
    type UpdateSampleUserFormData,
} from '_shared/validations/samplesValidation'
import { db } from 'db'
import { desc, eq } from 'drizzle-orm'
import { Hono } from 'hono'
import type { SamplesVariables } from './index.ts'

const samplesUsersApi = new Hono<{ Variables: SamplesVariables }>()

/**
 * GET /samples-api/users
 * ユーザー一覧を取得
 */
samplesUsersApi.get(
    '/',
    apiHandler(async (c) => {
        // ページネーションパラメータの取得
        const paginationInfo = getPaginationInfoFromRequest(c)

        // ユーザー一覧を取得
        const usersList = await db
            .select()
            .from(users)
            .limit(paginationInfo.limit)
            .offset(paginationInfo.offset)
            .orderBy(desc(users.updatedAt))

        // 総件数を取得
        const totalResult = await db.select({ count: users.id }).from(users)
        const total = totalResult.length

        return new SuccessResponse({
            data: {
                users: usersList,
                pagination: {
                    page: paginationInfo.currentPage,
                    limit: paginationInfo.limit,
                    total,
                    totalPages: Math.ceil(total / paginationInfo.limit),
                },
            },
            message: 'ユーザー一覧を取得しました',
        })
    })
)

/**
 * GET /samples-api/users/:id
 * 特定のユーザー詳細を取得
 */
samplesUsersApi.get(
    '/:id',
    apiHandler(async (c) => {
        const userId = c.req.param('id')

        // ユーザーを取得
        const result = await db
            .select()
            .from(users)
            .where(eq(users.id, userId))
            .limit(1)

        if (!result[0]) {
            throw createNotFoundError('ユーザーが見つかりません')
        }

        return new SuccessResponse({
            data: {
                user: result[0],
            },
            message: 'ユーザー詳細を取得しました',
        })
    })
)

/**
 * POST /samples-api/users
 * 新規ユーザーを作成
 */
samplesUsersApi.post(
    '/',
    validatedApiHandler(
        createSampleUserSchema,
        async (_c, validatedData: CreateSampleUserFormData) => {
            // メールアドレスの重複チェック
            const existing = await db
                .select()
                .from(users)
                .where(eq(users.email, validatedData.email))
                .limit(1)

            if (existing.length > 0) {
                throw createApiError(
                    'VALIDATION_ERROR',
                    400,
                    'このメールアドレスは既に使用されています'
                )
            }

            // ユーザーを作成
            const newUser = await db
                .insert(users)
                .values({
                    email: validatedData.email,
                    name: validatedData.name,
                    profileImage: validatedData.profileImage,
                })
                .returning()

            return new SuccessResponse({
                data: {
                    user: newUser[0],
                },
                message: 'ユーザーを作成しました',
            })
        }
    )
)

/**
 * PUT /samples-api/users/:id
 * ユーザー情報を更新
 */
samplesUsersApi.put(
    '/:id',
    validatedApiHandler(
        updateSampleUserSchema,
        async (c, validatedData: UpdateSampleUserFormData) => {
            const userId = c.req.param('id')

            // ユーザーの存在確認
            const existing = await db
                .select()
                .from(users)
                .where(eq(users.id, userId))
                .limit(1)

            if (!existing[0]) {
                throw createNotFoundError('ユーザーが見つかりません')
            }

            // 更新データの準備（undefined値を除外）
            const updateData: Partial<{
                name: string
                profileImage: string
                updatedAt: Date
            }> = {}
            if (validatedData.name !== undefined) {
                updateData.name = validatedData.name
            }
            if (validatedData.profileImage !== undefined) {
                updateData.profileImage = validatedData.profileImage
            }

            // 更新実行
            const updatedUser = await db
                .update(users)
                .set({
                    ...updateData,
                    updatedAt: new Date(),
                })
                .where(eq(users.id, userId))
                .returning()

            return new SuccessResponse({
                data: {
                    user: updatedUser[0],
                },
                message: 'ユーザー情報を更新しました',
            })
        }
    )
)

/**
 * DELETE /samples-api/users/:id
 * ユーザーを削除
 */
samplesUsersApi.delete(
    '/:id',
    apiHandler(async (c) => {
        const userId = c.req.param('id')

        // ユーザーの存在確認
        const existing = await db
            .select()
            .from(users)
            .where(eq(users.id, userId))
            .limit(1)

        if (!existing[0]) {
            throw createNotFoundError('ユーザーが見つかりません')
        }

        // 削除実行
        await db.delete(users).where(eq(users.id, userId))

        return new SuccessResponse({
            data: {
                deleted: true,
                userId,
            },
            message: 'ユーザーを削除しました',
        })
    })
)

export default samplesUsersApi
