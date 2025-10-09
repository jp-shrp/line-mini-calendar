import {
    useTodayEventsQuery,
    useUpcomingEventsQuery,
} from '@/src/app/(protected)/calendar/api/event-query'
import { Event } from '@/src/models/Event'
import { useCallback, useMemo, useState } from 'react'

export type ViewMode = 'day' | 'week' | 'month'

/**
 * カレンダー画面のビジネスロジックHook
 * @returns カレンダー画面に必要なステートとハンドラー
 */
export const useCalendar = () => {
    const [selectedDate, setSelectedDate] = useState<Date>(new Date())
    const [displayMonth, setDisplayMonth] = useState<Date>(new Date())
    const [viewMode, setViewMode] = useState<ViewMode>('month')

    // 今日のイベント一覧を取得
    const {
        data: todayEventsData,
        isLoading: isTodayEventsLoading,
        error: todayEventsError,
    } = useTodayEventsQuery()

    // 今後のイベント一覧を取得（最大5件）
    const {
        data: upcomingEventsData,
        isLoading: isUpcomingEventsLoading,
        error: upcomingEventsError,
    } = useUpcomingEventsQuery(5)

    // APIデータをモデルクラスでマッピング
    const todayEvents = useMemo(
        () => (todayEventsData?.events || []).map((event) => new Event(event)),
        [todayEventsData]
    )

    const upcomingEvents = useMemo(
        () =>
            (upcomingEventsData?.events || []).map((event) => new Event(event)),
        [upcomingEventsData]
    )

    const handleDateChange = useCallback((date: Date) => {
        setSelectedDate(date)
    }, [])

    const handleMonthChange = useCallback((date: Date) => {
        setDisplayMonth(date)
    }, [])

    const handleViewModeChange = useCallback((mode: ViewMode) => {
        setViewMode(mode)
    }, [])

    return {
        selectedDate,
        displayMonth,
        viewMode,
        todayEvents,
        upcomingEvents,
        isTodayEventsLoading,
        isUpcomingEventsLoading,
        todayEventsError,
        upcomingEventsError,
        handleDateChange,
        handleMonthChange,
        handleViewModeChange,
    }
}
