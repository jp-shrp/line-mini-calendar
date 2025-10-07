import { useState, useCallback, useMemo } from 'react'
import {
    useTodayEventsQuery,
    useUpcomingEventsQuery,
} from '@/src/app/calendar/api/event-query'
import type { Event, UpcomingEvent } from '@/src/models/Event'

/**
 * APIイベントを画面表示用のEvent型に変換
 */
const convertToEvent = (apiEvent: {
    id: string
    title: string
    startDatetime: Date
    endDatetime: Date
    iconUrl: string | null
    color: string | null
}): Event => {
    const startTime = new Date(apiEvent.startDatetime).toLocaleTimeString(
        'ja-JP',
        {
            hour: '2-digit',
            minute: '2-digit',
        }
    )
    const endTime = new Date(apiEvent.endDatetime).toLocaleTimeString('ja-JP', {
        hour: '2-digit',
        minute: '2-digit',
    })

    return {
        id: apiEvent.id,
        title: apiEvent.title,
        startTime,
        endTime,
        icon: apiEvent.iconUrl || undefined,
        color: apiEvent.color || 'bg-gray-500',
    }
}

/**
 * APIイベントを画面表示用のUpcomingEvent型に変換
 */
const convertToUpcomingEvent = (apiEvent: {
    id: string
    title: string
    startDatetime: Date
    endDatetime: Date
    color: string | null
}): UpcomingEvent => {
    const startTime = new Date(apiEvent.startDatetime).toLocaleTimeString(
        'ja-JP',
        {
            hour: '2-digit',
            minute: '2-digit',
        }
    )
    const endTime = new Date(apiEvent.endDatetime).toLocaleTimeString('ja-JP', {
        hour: '2-digit',
        minute: '2-digit',
    })

    return {
        id: apiEvent.id,
        title: apiEvent.title,
        startTime,
        endTime,
        color: apiEvent.color || 'bg-gray-500',
    }
}

/**
 * カレンダー画面のビジネスロジックHook
 * @returns カレンダー画面に必要なステートとハンドラー
 */
export const useCalendar = () => {
    const [selectedDate, setSelectedDate] = useState<Date>(new Date())
    const [displayMonth, setDisplayMonth] = useState<Date>(new Date())

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

    // APIデータを画面表示用の型に変換
    const todayEvents = useMemo(
        () => (todayEventsData?.events || []).map(convertToEvent),
        [todayEventsData]
    )

    const upcomingEvents = useMemo(
        () => (upcomingEventsData?.events || []).map(convertToUpcomingEvent),
        [upcomingEventsData]
    )

    const handleDateChange = useCallback((date: Date) => {
        setSelectedDate(date)
    }, [])

    const handleMonthChange = useCallback((date: Date) => {
        setDisplayMonth(date)
    }, [])

    const handleViewModeToggle = useCallback(() => {
        // 月表示切り替えロジック（今後実装）
    }, [])

    return {
        selectedDate,
        displayMonth,
        todayEvents,
        upcomingEvents,
        isTodayEventsLoading,
        isUpcomingEventsLoading,
        todayEventsError,
        upcomingEventsError,
        handleDateChange,
        handleMonthChange,
        handleViewModeToggle,
    }
}
