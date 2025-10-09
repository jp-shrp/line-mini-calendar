import type { FC } from 'react'
import type { ViewMode } from '@/src/app/(protected)/calendar/hooks/useCalendar'
import DayView from './DayView'
import WeekView from './WeekView'
import MonthView from './MonthView'

interface CalendarViewProps {
    viewMode: ViewMode
    selectedDate: Date
    displayMonth: Date
    onDateChange: (date: Date) => void
    onMonthChange: (date: Date) => void
}

/**
 * カレンダービューのコンテナコンポーネント
 * 日/週/月の表示を切り替える
 */
const CalendarView: FC<CalendarViewProps> = ({
    viewMode,
    selectedDate,
    displayMonth,
    onDateChange,
    onMonthChange,
}) => {
    if (viewMode === 'day') {
        return (
            <DayView selectedDate={selectedDate} onDateChange={onDateChange} />
        )
    }

    if (viewMode === 'week') {
        return (
            <WeekView selectedDate={selectedDate} onDateChange={onDateChange} />
        )
    }

    if (viewMode === 'month') {
        return (
            <MonthView
                displayMonth={displayMonth}
                selectedDate={selectedDate}
                onDateChange={onDateChange}
                onMonthChange={onMonthChange}
            />
        )
    }

    return null
}

export default CalendarView
