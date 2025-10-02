import { z } from 'imports'

/**
 * ユーザー作成用のバリデーションスキーマ
 */
export const createUserSchema = z.object({
    email: z
        .string()
        .email('有効なメールアドレスを入力してください')
        .max(255, 'メールアドレスは255文字以内で入力してください'),
    name: z
        .string()
        .min(1, '名前を入力してください')
        .max(100, '名前は100文字以内で入力してください')
        .optional(),
    profileImage: z.string().url('有効なURLを入力してください').optional(),
})

/**
 * ユーザー更新用のバリデーションスキーマ
 */
export const updateUserSchema = z.object({
    email: z
        .string()
        .email('有効なメールアドレスを入力してください')
        .max(255, 'メールアドレスは255文字以内で入力してください')
        .optional(),
    name: z
        .string()
        .min(1, '名前を入力してください')
        .max(100, '名前は100文字以内で入力してください')
        .optional(),
    profileImage: z.string().url('有効なURLを入力してください').optional(),
})

/**
 * ユーザーID用のバリデーションスキーマ
 */
export const userIdSchema = z.object({
    id: z.string().uuid('有効なUUIDを入力してください'),
})

export type CreateUserRequest = z.infer<typeof createUserSchema>
export type UpdateUserRequest = z.infer<typeof updateUserSchema>
export type UserIdRequest = z.infer<typeof userIdSchema>
