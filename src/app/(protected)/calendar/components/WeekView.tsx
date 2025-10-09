import type { FC } from 'react'

interface WeekViewProps {
    selectedDate: Date
    onDateChange: (date: Date) => void
}

/**
 * 週表示コンポーネント
 * 選択された日付を含む週の7日間を表示
 */
const WeekView: FC<WeekViewProps> = ({ selectedDate, onDateChange }) => {
    const getWeekDates = (date: Date): Date[] => {
        const dayOfWeek = date.getDay()
        const startOfWeek = new Date(date)
        startOfWeek.setDate(date.getDate() - dayOfWeek)

        return Array.from({ length: 7 }, (_, i) => {
            const day = new Date(startOfWeek)
            day.setDate(startOfWeek.getDate() + i)
            return day
        })
    }

    const weekDates = getWeekDates(selectedDate)
    const weekdays = ['日', '月', '火', '水', '木', '金', '土']

    const handlePreviousWeek = () => {
        const previousWeek = new Date(selectedDate)
        previousWeek.setDate(previousWeek.getDate() - 7)
        onDateChange(previousWeek)
    }

    const handleNextWeek = () => {
        const nextWeek = new Date(selectedDate)
        nextWeek.setDate(nextWeek.getDate() + 7)
        onDateChange(nextWeek)
    }

    const handleToday = () => {
        onDateChange(new Date())
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

    return (
        <div className="rounded-lg bg-white p-4 shadow">
            <div className="mb-4 flex items-center justify-between">
                <button
                    onClick={handlePreviousWeek}
                    className="rounded px-3 py-1 text-gray-600 hover:bg-gray-100"
                    aria-label="前の週">
                    ‹
                </button>
                <div className="text-center">
                    <div className="text-lg font-bold">
                        {weekDates[0].getFullYear()}年{' '}
                        {weekDates[0].getMonth() + 1}月
                    </div>
                </div>
                <button
                    onClick={handleNextWeek}
                    className="rounded px-3 py-1 text-gray-600 hover:bg-gray-100"
                    aria-label="次の週">
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
            <div className="grid grid-cols-7 gap-2">
                {weekDates.map((date, index) => {
                    const selected = isSelectedDate(date)
                    const today = isToday(date)

                    let dateClasses =
                        'flex flex-col items-center rounded-lg p-3 cursor-pointer transition-colors'

                    if (selected) {
                        dateClasses += ' bg-blue-500 text-white'
                    } else if (today) {
                        dateClasses += ' bg-blue-100 text-blue-600'
                    } else {
                        dateClasses += ' hover:bg-gray-100'
                    }

                    return (
                        <button
                            key={index}
                            onClick={() => onDateChange(date)}
                            className={dateClasses}>
                            <div className="text-xs">{weekdays[index]}</div>
                            <div className="text-lg font-bold">
                                {date.getDate()}
                            </div>
                        </button>
                    )
                })}
            </div>
            <div className="mt-4 space-y-2">
                {Array.from({ length: 24 }, (_, hour) => (
                    <div key={hour} className="flex border-b border-gray-100">
                        <div className="w-16 py-2 text-sm text-gray-500">
                            {String(hour).padStart(2, '0')}:00
                        </div>
                        <div className="grid flex-1 grid-cols-7 gap-1">
                            {weekDates.map((_, dayIndex) => (
                                <div
                                    key={dayIndex}
                                    className="border-l border-gray-100 py-2"></div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default WeekView
