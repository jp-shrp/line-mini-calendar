import { useMemo } from 'react'
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
        retry: 0,
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
        retry: 0,
    })
}

/**
 * 今日のイベント一覧取得Query Hook
 * @returns 今日のイベント一覧データ
 */
export const useTodayEventsQuery = () => {
    const dateRange = useMemo(() => {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const startOfDay = today.toISOString()

        const endToday = new Date()
        endToday.setHours(23, 59, 59, 999)
        const endOfDay = endToday.toISOString()

        return { startOfDay, endOfDay }
    }, [])

    return useSupabaseQuery<EventsListResponse>({
        queryKey: [
            ...eventQueryKeys.list({
                startDate: dateRange.startOfDay,
                endDate: dateRange.endOfDay,
            }),
        ] as string[],
        functionName: 'calendar-api/events',
        params: {
            startDate: dateRange.startOfDay,
            endDate: dateRange.endOfDay,
        },
        retry: 0,
    })
}

/**
 * 今後のイベント一覧取得Query Hook
 * @param limit 取得件数（デフォルト: 5）
 * @returns 今後のイベント一覧データ
 */
export const useUpcomingEventsQuery = (limit = 5) => {
    const startDate = useMemo(() => {
        return new Date().toISOString()
    }, [])

    return useSupabaseQuery<EventsListResponse>({
        queryKey: [
            ...eventQueryKeys.list({
                startDate,
                limit,
            }),
        ] as string[],
        functionName: 'calendar-api/events',
        params: {
            startDate,
            limit,
        },
        retry: 0,
    })
}
