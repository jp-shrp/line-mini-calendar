import { useSupabaseQuery } from '@/src/hooks/useSupabaseQuery'
import { eventQueryKeys } from './query-key'
import type {
    EventsListResponse,
    EventDetailResponse,
    EventsQueryParams,
} from '@/supabase/functions/_shared/types/events-api-types'

/**
 * イベント一覧取得Query Hook
 * @param params クエリパラメータ（startDate, endDate, category, page, limit）
 * @returns イベント一覧データ
 */
export const useEventListQuery = (params?: EventsQueryParams) => {
    return useSupabaseQuery<EventsListResponse>({
        queryKey: [...eventQueryKeys.list(params || {})] as string[],
        functionName: 'calendar-api/events',
        params,
    })
}

/**
 * イベント詳細取得Query Hook
 * @param eventId イベントID
 * @param enabled クエリの有効化制御（デフォルト: true）
 * @returns イベント詳細データ
 */
export const useEventDetailQuery = (eventId: string, enabled = true) => {
    return useSupabaseQuery<EventDetailResponse>({
        queryKey: [...eventQueryKeys.detail(eventId)] as string[],
        functionName: `calendar-api/events/${eventId}`,
        enabled: enabled && !!eventId,
    })
}

/**
 * 今日のイベント一覧取得Query Hook
 * @returns 今日のイベント一覧データ
 */
export const useTodayEventsQuery = () => {
    const today = new Date()
    const startOfDay = new Date(today.setHours(0, 0, 0, 0))
    const endOfDay = new Date(today.setHours(23, 59, 59, 999))

    return useSupabaseQuery<EventsListResponse>({
        queryKey: [
            ...eventQueryKeys.list({
                startDate: startOfDay.toISOString(),
                endDate: endOfDay.toISOString(),
            }),
        ] as string[],
        functionName: 'calendar-api/events',
        params: {
            startDate: startOfDay.toISOString(),
            endDate: endOfDay.toISOString(),
        },
    })
}

/**
 * 今後のイベント一覧取得Query Hook
 * @param limit 取得件数（デフォルト: 5）
 * @returns 今後のイベント一覧データ
 */
export const useUpcomingEventsQuery = (limit = 5) => {
    const now = new Date()

    return useSupabaseQuery<EventsListResponse>({
        queryKey: [
            ...eventQueryKeys.list({
                startDate: now.toISOString(),
                limit,
            }),
        ] as string[],
        functionName: 'calendar-api/events',
        params: {
            startDate: now.toISOString(),
            limit,
        },
    })
}
