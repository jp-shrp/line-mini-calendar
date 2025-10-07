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
    // 日付文字列を固定化（日付が変わるまで同じ値を返す）
    const dateRange = useMemo(() => {
        const now = new Date()
        const year = now.getFullYear()
        const month = String(now.getMonth() + 1).padStart(2, '0')
        const day = String(now.getDate()).padStart(2, '0')

        const startOfDay = `${year}-${month}-${day}T00:00:00.000Z`
        const endOfDay = `${year}-${month}-${day}T23:59:59.999Z`

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
    // 現在日時を固定化（分単位で固定して安定化）
    const startDate = useMemo(() => {
        const now = new Date()
        const year = now.getFullYear()
        const month = String(now.getMonth() + 1).padStart(2, '0')
        const day = String(now.getDate()).padStart(2, '0')
        const hours = String(now.getHours()).padStart(2, '0')
        const minutes = String(now.getMinutes()).padStart(2, '0')

        return `${year}-${month}-${day}T${hours}:${minutes}:00.000Z`
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
