import { z } from 'zod'

/**
 * サンプルユーザー作成時のバリデーションスキーマ
 * API側とクライアント側で共通使用
 *
 * @description
 * - クライアント側: フォームバリデーション
 * - API側: リクエストバリデーション
 */
export const createSampleUserSchema = z.object({
    email: z
        .string()
        .min(1, 'メールアドレスを入力してください')
        .email('有効なメールアドレスを入力してください')
        .max(255, 'メールアドレスは255文字以内で入力してください'),
    name: z
        .string()
        .min(1, '名前を入力してください')
        .min(2, '名前は2文字以上で入力してください')
        .max(100, '名前は100文字以内で入力してください')
        .optional()
        .transform((val) => val || undefined),
    profileImage: z.string().optional(),
})

/**
 * サンプルユーザー更新時のバリデーションスキーマ
 * API側とクライアント側で共通使用
 */
export const updateSampleUserSchema = z.object({
    name: z
        .string()
        .min(1, '名前を入力してください')
        .min(2, '名前は2文字以上で入力してください')
        .max(100, '名前は100文字以内で入力してください')
        .optional(),
    profileImage: z.string().optional(),
})

/**
 * サンプルユーザー作成時の型定義
 */
export type CreateSampleUserFormData = z.infer<typeof createSampleUserSchema>

/**
 * サンプルユーザー更新時の型定義
 */
export type UpdateSampleUserFormData = z.infer<typeof updateSampleUserSchema>
