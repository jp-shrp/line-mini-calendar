import type { FC } from 'react'

interface WeekdayCalendarProps {
    selectedDate: Date
    displayMonth: Date
    onDateChange: (date: Date) => void
    onMonthChange: (date: Date) => void
}

const WeekdayCalendar: FC<WeekdayCalendarProps> = ({
    selectedDate,
    displayMonth,
    onDateChange,
}) => {
    const weekdays = ['Mo', 'Tu', 'Wed', 'Th', 'Fr', 'Sa', 'Su']

    const getWeekDates = () => {
        const current = new Date(displayMonth)
        current.setDate(18)
        const dates = []

        for (let i = 0; i < 7; i++) {
            const date = new Date(current)
            date.setDate(18 + i)
            dates.push(date)
        }

        return dates
    }

    const weekDates = getWeekDates()

    const isSelectedDate = (date: Date) => {
        return (
            date.getDate() === selectedDate.getDate() &&
            date.getMonth() === selectedDate.getMonth() &&
            date.getFullYear() === selectedDate.getFullYear()
        )
    }

    const isToday = (date: Date) => {
        const today = new Date()
        return (
            date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear()
        )
    }

    return (
        <div className="mb-8">
            <div className="grid grid-cols-7 gap-2">
                {weekDates.map((date, index) => {
                    const dayNumber = date.getDate()
                    const isSelected = isSelectedDate(date)
                    const isTodayDate = isToday(date)

                    return (
                        <div key={index} className="text-center">
                            <div className="mb-2 text-xs text-gray-500">
                                {weekdays[index]}
                            </div>
                            <button
                                onClick={() => onDateChange(date)}
                                className={`relative h-12 w-12 rounded-lg text-lg font-medium transition-colors ${
                                    isSelected
                                        ? 'bg-pink-500 text-white'
                                        : 'text-gray-800 hover:bg-gray-100'
                                }`}>
                                {dayNumber}
                                {isTodayDate && !isSelected && (
                                    <div className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 transform rounded-full bg-pink-500" />
                                )}
                            </button>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default WeekdayCalendar
