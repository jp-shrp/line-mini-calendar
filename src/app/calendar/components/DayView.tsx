import type { FC } from 'react'

interface DayViewProps {
    selectedDate: Date
    onDateChange: (date: Date) => void
}

/**
 * 日表示コンポーネント
 * 選択された日付の詳細を表示
 */
const DayView: FC<DayViewProps> = ({ selectedDate, onDateChange }) => {
    const year = selectedDate.getFullYear()
    const month = selectedDate.getMonth() + 1
    const day = selectedDate.getDate()
    const dayOfWeek = ['日', '月', '火', '水', '木', '金', '土'][
        selectedDate.getDay()
    ]

    const handlePreviousDay = () => {
        const previousDay = new Date(selectedDate)
        previousDay.setDate(previousDay.getDate() - 1)
        onDateChange(previousDay)
    }

    const handleNextDay = () => {
        const nextDay = new Date(selectedDate)
        nextDay.setDate(nextDay.getDate() + 1)
        onDateChange(nextDay)
    }

    const handleToday = () => {
        onDateChange(new Date())
    }

    return (
        <div className="rounded-lg bg-white p-4 shadow">
            <div className="mb-4 flex items-center justify-between">
                <button
                    onClick={handlePreviousDay}
                    className="rounded px-3 py-1 text-gray-600 hover:bg-gray-100"
                    aria-label="前の日">
                    ‹
                </button>
                <div className="text-center">
                    <div className="text-sm text-gray-500">
                        {year}年{month}月
                    </div>
                    <div className="text-2xl font-bold">
                        {day}日 ({dayOfWeek})
                    </div>
                </div>
                <button
                    onClick={handleNextDay}
                    className="rounded px-3 py-1 text-gray-600 hover:bg-gray-100"
                    aria-label="次の日">
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
            <div className="space-y-2">
                {Array.from({ length: 24 }, (_, hour) => (
                    <div key={hour} className="flex border-b border-gray-100">
                        <div className="w-16 py-2 text-sm text-gray-500">
                            {String(hour).padStart(2, '0')}:00
                        </div>
                        <div className="flex-1 py-2"></div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default DayView
