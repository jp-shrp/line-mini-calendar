import type { FC } from 'react'

interface CalendarHeaderProps {
    displayMonth: Date
    onViewModeToggle: () => void
}

const CalendarHeader: FC<CalendarHeaderProps> = ({
    displayMonth,
    onViewModeToggle,
}) => {
    const year = displayMonth.getFullYear()
    const month = displayMonth.getMonth() + 1

    return (
        <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold">
                {year}年{month}月
            </h1>
            <button
                onClick={onViewModeToggle}
                className="rounded-full border-2 border-pink-500 px-4 py-1 text-sm font-medium text-pink-500 hover:bg-pink-50">
                月表示
            </button>
        </div>
    )
}

export default CalendarHeader
