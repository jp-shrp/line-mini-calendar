import { useCallback, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { formatJST } from '@/src/lib/date-utils'
import { updateEventSchema } from '@/supabase/functions/_shared/validations/eventsValidation'
import type { UpdateEventFormData } from '@/src/app/(protected)/calendar/api/event-mutation'
import { useUpdateEventMutation } from '@/src/app/(protected)/calendar/api/event-mutation'
import { useEventDetailQuery } from '@/src/app/(protected)/calendar/api/event-query'

/**
 * イベント編集のビジネスロジックHook
 *
 * @description
 * React Hook FormとReact Queryを統合し、
 * イベント編集のビジネスロジックを管理します
 * Hook+Viewパターンに従い、ビジネスロジックを分離
 *
 * @param eventId イベントID
 */
export const useEventEdit = (eventId: string) => {
    const router = useRouter()

    // イベント詳細取得Query
    const { data, isLoading: isLoadingEvent } = useEventDetailQuery(eventId)

    // イベント更新Mutation
    const updateMutation = useUpdateEventMutation(eventId)

    // React Hook Formの初期化
    const form = useForm<UpdateEventFormData>({
        resolver: zodResolver(updateEventSchema),
        mode: 'onChange',
        defaultValues: {
            title: '',
            description: undefined,
            category: '',
            iconUrl: undefined,
            startDatetime: '',
            endDatetime: '',
            color: undefined,
        },
    })

    // イベントデータ取得後にフォームに初期値を設定
    useEffect(() => {
        if (data?.event) {
            const event = data.event

            // datetime-local形式に変換（YYYY-MM-DDTHH:mm）
            // 日本時間に変換してからフォーマット
            const formatDatetimeLocal = (datetime: Date | string) => {
                return formatJST(datetime, "yyyy-MM-dd'T'HH:mm")
            }

            form.reset({
                title: event.title,
                description: event.description || undefined,
                category: event.category,
                iconUrl: event.iconUrl || undefined,
                startDatetime: formatDatetimeLocal(event.startDatetime),
                endDatetime: formatDatetimeLocal(event.endDatetime),
                color: event.color || undefined,
            })
        }
    }, [data, form])

    // フォーム送信ハンドラー
    const handleSubmit = useCallback(
        async (formData: UpdateEventFormData) => {
            await updateMutation.mutateAsync(formData)
            router.push(`/calendar/${eventId}`)
        },
        [updateMutation, router, eventId]
    )

    // キャンセルハンドラー
    const handleCancel = useCallback(() => {
        router.back()
    }, [router])

    return {
        form,
        event: data?.event,
        isLoadingEvent,
        isSubmitting: updateMutation.isPending,
        handleSubmit: form.handleSubmit(handleSubmit),
        handleCancel,
    }
}
