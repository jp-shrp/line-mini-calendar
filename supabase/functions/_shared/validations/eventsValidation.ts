import { z } from 'zod'

/**
 * イベント作成時のバリデーションスキーマ
 *
 * @description
 * クライアント側のフォームバリデーションで使用
 * InsertEvent型をベースに、必須フィールドとバリデーションルールを定義
 */
export const createEventSchema = z
    .object({
        title: z
            .string()
            .min(1, 'イベント名を入力してください')
            .max(100, 'イベント名は100文字以内で入力してください'),
        description: z
            .string()
            .max(1000, '説明は1000文字以内で入力してください')
            .optional()
            .transform((val) => val || undefined),
        category: z
            .string()
            .min(1, 'カテゴリを選択してください')
            .max(50, 'カテゴリは50文字以内で入力してください'),
        iconUrl: z
            .string()
            //.url('有効なURLを入力してください')
            .optional()
            .transform((val) => val || undefined),
        startDatetime: z.string().min(1, '開始日時を入力してください'),
        endDatetime: z.string().min(1, '終了日時を入力してください'),
        color: z
            .string()
            .regex(
                /^#[0-9A-Fa-f]{6}$/,
                '有効なカラーコード（例: #FF5733）を入力してください'
            )
            .optional()
            .transform((val) => val || undefined),
        reminders: z
            .array(z.number())
            .optional()
            .transform((val) => val || undefined),
    })
    .refine(
        (data) => new Date(data.startDatetime) < new Date(data.endDatetime),
        {
            message: '終了日時は開始日時より後に設定してください',
            path: ['endDatetime'],
        }
    )

/**
 * イベント更新時のバリデーションスキーマ
 *
 * @description
 * イベント編集時のバリデーション
 * 更新時は全てのフィールドがオプショナル
 */
export const updateEventSchema = z
    .object({
        title: z
            .string()
            .min(1, 'イベント名を入力してください')
            .max(100, 'イベント名は100文字以内で入力してください')
            .optional(),
        description: z
            .string()
            .max(1000, '説明は1000文字以内で入力してください')
            .optional()
            .transform((val) => val || undefined),
        category: z
            .string()
            .min(1, 'カテゴリを選択してください')
            .max(50, 'カテゴリは50文字以内で入力してください')
            .optional(),
        iconUrl: z
            .string()
            //.url('有効なURLを入力してください')
            .optional()
            .transform((val) => val || undefined),
        startDatetime: z.string().optional(),
        endDatetime: z.string().optional(),
        color: z
            .string()
            .regex(
                /^#[0-9A-Fa-f]{6}$/,
                '有効なカラーコード（例: #FF5733）を入力してください'
            )
            .optional()
            .transform((val) => val || undefined),
    })
    .refine(
        (data) => {
            if (data.startDatetime && data.endDatetime) {
                return new Date(data.startDatetime) < new Date(data.endDatetime)
            }
            return true
        },
        {
            message: '終了日時は開始日時より後に設定してください',
            path: ['endDatetime'],
        }
    )

/**
 * イベントID用のバリデーションスキーマ
 */
export const eventIdSchema = z.object({
    id: z.string().uuid('有効なUUIDを入力してください'),
})

/**
 * イベント作成フォームの型定義
 */
export type CreateEventFormData = z.infer<typeof createEventSchema>

/**
 * イベント更新フォームの型定義
 */
export type UpdateEventFormData = z.infer<typeof updateEventSchema>

/**
 * API用の型定義
 */
export type CreateEventRequest = z.infer<typeof createEventSchema>
export type UpdateEventRequest = z.infer<typeof updateEventSchema>
export type EventIdRequest = z.infer<typeof eventIdSchema>
