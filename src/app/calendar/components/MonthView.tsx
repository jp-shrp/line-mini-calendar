import type { FC } from 'react'

interface MonthViewProps {
    displayMonth: Date
    selectedDate: Date
    onDateChange: (date: Date) => void
    onMonthChange: (date: Date) => void
}

/**
 * 月表示コンポーネント
 * 指定された月のカレンダーを表示
 */
const MonthView: FC<MonthViewProps> = ({
    displayMonth,
    selectedDate,
    onDateChange,
    onMonthChange,
}) => {
    const getMonthDates = (date: Date): Date[] => {
        const year = date.getFullYear()
        const month = date.getMonth()

        const firstDay = new Date(year, month, 1)
        const lastDay = new Date(year, month + 1, 0)

        const startDayOfWeek = firstDay.getDay()
        const endDate = lastDay.getDate()

        const dates: Date[] = []

        for (let i = 0; i < startDayOfWeek; i++) {
            const prevDate = new Date(year, month, -startDayOfWeek + i + 1)
            dates.push(prevDate)
        }

        for (let i = 1; i <= endDate; i++) {
            dates.push(new Date(year, month, i))
        }

        const remainingDays = 7 - (dates.length % 7)
        if (remainingDays < 7) {
            for (let i = 1; i <= remainingDays; i++) {
                dates.push(new Date(year, month + 1, i))
            }
        }

        return dates
    }

    const monthDates = getMonthDates(displayMonth)
    const weekdays = ['日', '月', '火', '水', '木', '金', '土']

    const handlePreviousMonth = () => {
        const previousMonth = new Date(displayMonth)
        previousMonth.setMonth(previousMonth.getMonth() - 1)
        onMonthChange(previousMonth)
    }

    const handleNextMonth = () => {
        const nextMonth = new Date(displayMonth)
        nextMonth.setMonth(nextMonth.getMonth() + 1)
        onMonthChange(nextMonth)
    }

    const handleToday = () => {
        const today = new Date()
        onDateChange(today)
        onMonthChange(today)
    }

    const isSelectedDate = (date: Date): boolean => {
        return (
            date.getFullYear() === selectedDate.getFullYear() &&
            date.getMonth() === selectedDate.getMonth() &&
            date.getDate() === selectedDate.getDate()
        )
    }

    const isToday = (date: Date): boolean => {
        const today = new Date()
        return (
            date.getFullYear() === today.getFullYear() &&
            date.getMonth() === today.getMonth() &&
            date.getDate() === today.getDate()
        )
    }

    const isCurrentMonth = (date: Date): boolean => {
        return date.getMonth() === displayMonth.getMonth()
    }

    return (
        <div className="rounded-lg bg-white p-4 shadow">
            <div className="mb-4 flex items-center justify-between">
                <button
                    onClick={handlePreviousMonth}
                    className="rounded px-3 py-1 text-gray-600 hover:bg-gray-100"
                    aria-label="前の月">
                    ‹
                </button>
                <div className="text-center">
                    <div className="text-lg font-bold">
                        {displayMonth.getFullYear()}年{' '}
                        {displayMonth.getMonth() + 1}月
                    </div>
                </div>
                <button
                    onClick={handleNextMonth}
                    className="rounded px-3 py-1 text-gray-600 hover:bg-gray-100"
                    aria-label="次の月">
                    ›
                </button>
            </div>
            <div className="mb-4 text-center">
                <button
                    onClick={handleToday}
                    className="rounded bg-blue-500 px-4 py-2 text-sm text-white hover:bg-blue-600">
                    今日
                </button>
            </div>
            <div className="mb-2 grid grid-cols-7 gap-2">
                {weekdays.map((day) => (
                    <div
                        key={day}
                        className="py-2 text-center text-sm font-semibold text-gray-600">
                        {day}
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
                {monthDates.map((date, index) => {
                    const selected = isSelectedDate(date)
                    const today = isToday(date)
                    const currentMonth = isCurrentMonth(date)

                    let dateClasses =
                        'aspect-square flex items-center justify-center rounded-lg cursor-pointer transition-colors'

                    if (selected) {
                        dateClasses += ' bg-blue-500 text-white font-bold'
                    } else if (today) {
                        dateClasses += ' bg-blue-100 text-blue-600 font-bold'
                    } else if (currentMonth) {
                        dateClasses += ' hover:bg-gray-100 text-gray-900'
                    } else {
                        dateClasses += ' text-gray-400 hover:bg-gray-50'
                    }

                    return (
                        <button
                            key={index}
                            onClick={() => onDateChange(date)}
                            className={dateClasses}>
                            {date.getDate()}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}

export default MonthView
