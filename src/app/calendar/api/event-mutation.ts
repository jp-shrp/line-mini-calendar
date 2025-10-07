import { useSupabaseMutation } from '@/src/hooks/useSupabaseMutation'
import type { EventDetailResponse } from '@/supabase/functions/_shared/types/events-api-types'

/**
 * イベント作成フォームデータの型
 */
export interface CreateEventFormData {
    title: string
    description?: string
    category: string
    iconUrl?: string
    startDatetime: string
    endDatetime: string
    color?: string
    reminders?: number[]
}

/**
 * イベント更新フォームデータの型
 */
export interface UpdateEventFormData {
    title?: string
    description?: string
    category?: string
    iconUrl?: string
    startDatetime?: string
    endDatetime?: string
    color?: string
}

/**
 * イベント作成Mutation Hook
 * @returns イベント作成のmutation関数とステート
 */
export const useCreateEventMutation = () => {
    return useSupabaseMutation<EventDetailResponse, CreateEventFormData>({
        functionName: 'calendar-api/events',
        method: 'POST',
        invalidateQueries: ['events'], // 作成後にイベント関連のキャッシュを再取得
    })
}

/**
 * イベント更新Mutation Hook
 * @param eventId イベントID
 * @returns イベント更新のmutation関数とステート
 */
export const useUpdateEventMutation = (eventId: string) => {
    return useSupabaseMutation<EventDetailResponse, UpdateEventFormData>({
        functionName: `calendar-api/events/${eventId}`,
        method: 'PUT',
        invalidateQueries: ['events'], // すべてのイベントキャッシュを無効化
    })
}

/**
 * イベント削除Mutation Hook
 * @param eventId イベントID
 * @returns イベント削除のmutation関数とステート
 */
export const useDeleteEventMutation = (eventId: string) => {
    return useSupabaseMutation<{ id: string }, void>({
        functionName: `calendar-api/events/${eventId}`,
        method: 'DELETE',
        invalidateQueries: ['events'], // すべてのイベントキャッシュを無効化
    })
}
