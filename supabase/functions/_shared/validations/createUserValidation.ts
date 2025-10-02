import { z } from 'zod'

/**
 * ユーザー作成時のバリデーションスキーマ
 *
 * @description
 * クライアント側のフォームバリデーションで使用
 * InsertUser型をベースに、必須フィールドとバリデーションルールを定義
 */
export const createUserSchema = z.object({
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
})

/**
 * ユーザー作成フォームの型定義
 */
export type CreateUserFormData = z.infer<typeof createUserSchema>

/**
 * ユーザー更新時のバリデーションスキーマ
 *
 * @description
 * 更新時は全てのフィールドがオプショナル
 */
export const updateUserSchema = z.object({
    email: z
        .string()
        .email('有効なメールアドレスを入力してください')
        .max(255, 'メールアドレスは255文字以内で入力してください')
        .optional(),
    name: z
        .string()
        .min(2, '名前は2文字以上で入力してください')
        .max(100, '名前は100文字以内で入力してください')
        .optional(),
    profileImage: z.string().url('有効なURLを入力してください').optional(),
})

export type UpdateUserFormData = z.infer<typeof updateUserSchema>
