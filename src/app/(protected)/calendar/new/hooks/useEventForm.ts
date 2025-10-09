import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useCallback } from 'react'
import { createEventSchema } from '@/supabase/functions/_shared/validations/eventsValidation'
import type { CreateEventFormData } from '@/src/app/(protected)/calendar/api/event-mutation'
import { useCreateEventMutation } from '@/src/app/(protected)/calendar/api/event-mutation'

/**
 * イベントフォームのビジネスロジックHook
 * @description
 * React Hook FormとReact Queryを統合し、
 * イベント作成のビジネスロジックを管理します
 */
export const useEventForm = () => {
    const router = useRouter()
    const createMutation = useCreateEventMutation()

    // React Hook Formの初期化
    const form = useForm<CreateEventFormData>({
        resolver: zodResolver(createEventSchema),
        mode: 'onChange',
        defaultValues: {
            title: '',
            description: undefined,
            category: '',
            iconUrl: undefined,
            startDatetime: '',
            endDatetime: '',
            color: undefined,
            reminders: undefined,
        },
    })

    // フォーム送信ハンドラー
    const handleSubmit = useCallback(
        async (data: CreateEventFormData) => {
            await createMutation.mutateAsync(data)
            router.push('/calendar')
        },
        [createMutation, router]
    )

    // キャンセルハンドラー
    const handleCancel = useCallback(() => {
        router.back()
    }, [router])

    return {
        form,
        isSubmitting: createMutation.isPending,
        handleSubmit: form.handleSubmit(handleSubmit),
        handleCancel,
    }
}
