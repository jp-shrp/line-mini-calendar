'use client'

import type { FC } from 'react'
import type { ViewMode } from '@/src/app/(protected)/calendar/hooks/useCalendar'

interface CalendarHeaderProps {
    displayMonth: Date
    viewMode: ViewMode
    onViewModeChange: (mode: ViewMode) => void
}

const CalendarHeader: FC<CalendarHeaderProps> = ({
    displayMonth,
    viewMode,
    onViewModeChange,
}) => {
    const year = displayMonth.getFullYear()
    const month = displayMonth.getMonth() + 1

    const getViewModeLabel = (mode: ViewMode): string => {
        if (mode === 'day') return '日表示'
        if (mode === 'week') return '週表示'
        if (mode === 'month') return '月表示'
        return ''
    }

    const handleViewModeClick = () => {
        if (viewMode === 'day') {
            onViewModeChange('week')
            return
        }
        if (viewMode === 'week') {
            onViewModeChange('month')
            return
        }
        if (viewMode === 'month') {
            onViewModeChange('day')
            return
        }
    }

    return (
        <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold">
                {year}年{month}月
            </h1>
            <button
                onClick={handleViewModeClick}
                className="rounded-full border-2 border-pink-500 px-4 py-1 text-sm font-medium text-pink-500 hover:bg-pink-50">
                {getViewModeLabel(viewMode)}
            </button>
        </div>
    )
}

export default CalendarHeader
