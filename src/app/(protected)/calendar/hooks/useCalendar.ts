import {
    useTodayEventsQuery,
    useUpcomingEventsQuery,
    useSelectedDateEventsQuery,
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

    // 選択日付のイベント一覧を取得
    const {
        data: selectedDateEventsData,
        isLoading: isSelectedDateEventsLoading,
        error: selectedDateEventsError,
    } = useSelectedDateEventsQuery(selectedDate)

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

    const selectedDateEvents = useMemo(
        () =>
            (selectedDateEventsData?.events || []).map(
                (event) => new Event(event)
            ),
        [selectedDateEventsData]
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
        selectedDateEvents,
        isTodayEventsLoading,
        isUpcomingEventsLoading,
        isSelectedDateEventsLoading,
        todayEventsError,
        upcomingEventsError,
        selectedDateEventsError,
        handleDateChange,
        handleMonthChange,
        handleViewModeChange,
    }
}
