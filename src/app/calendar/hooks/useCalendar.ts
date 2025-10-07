import { useState, useCallback } from 'react'
import type { Event, UpcomingEvent } from '@/src/models/Event'

export const useCalendar = () => {
    const [selectedDate, setSelectedDate] = useState<Date>(new Date())
    const [displayMonth, setDisplayMonth] = useState<Date>(new Date())

    const todayEvents: Event[] = [
        {
            id: '1',
            title: 'プレミアリーグ\nトッテナム対アーセナル',
            startTime: '08:00',
            endTime: '10:00',
            icon: '⚽',
            color: 'bg-pink-500',
        },
        {
            id: '2',
            title: 'Netflix\n今際の国のアリス3期配信',
            startTime: '12:00',
            endTime: '14:00',
            icon: 'N',
            color: 'bg-pink-500',
        },
    ]

    const upcomingEvents: UpcomingEvent[] = [
        {
            id: '3',
            title: 'イベント名',
            startTime: '12:00',
            endTime: '16:00',
            color: 'bg-purple-500',
        },
        {
            id: '4',
            title: 'イベント名1',
            startTime: '12:00',
            endTime: '16:00',
            color: 'bg-purple-500',
        },
    ]

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
        handleDateChange,
        handleMonthChange,
        handleViewModeToggle,
    }
}
