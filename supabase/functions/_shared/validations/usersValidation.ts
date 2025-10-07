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
    displayName: z
        .string()
        .min(2, '表示名は2文字以上で入力してください')
        .max(100, '表示名は100文字以内で入力してください')
        .optional()
        .transform((val) => val || undefined),
    profileImage: z
        .string()
        .url('有効なURLを入力してください')
        .optional()
        .transform((val) => val || undefined),
})

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
    displayName: z
        .string()
        .min(2, '表示名は2文字以上で入力してください')
        .max(100, '表示名は100文字以内で入力してください')
        .optional(),
    profileImage: z
        .string()
        .url('有効なURLを入力してください')
        .optional()
        .transform((val) => val || undefined),
})

/**
 * ユーザーID用のバリデーションスキーマ
 */
export const userIdSchema = z.object({
    id: z.string().uuid('有効なUUIDを入力してください'),
})

/**
 * ユーザー作成フォームの型定義
 */
export type CreateUserFormData = z.infer<typeof createUserSchema>

/**
 * ユーザー更新フォームの型定義
 */
export type UpdateUserFormData = z.infer<typeof updateUserSchema>

/**
 * API用の型定義（下位互換性のため保持）
 */
export type CreateUserRequest = z.infer<typeof createUserSchema>
export type UpdateUserRequest = z.infer<typeof updateUserSchema>
export type UserIdRequest = z.infer<typeof userIdSchema>
