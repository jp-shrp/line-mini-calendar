import EventCard from '@/src/app/(protected)/calendar/components/EventCard'
import { Event } from '@/src/models/Event'
import { format } from '@/src/lib/date-utils'
import type { FC } from 'react'

interface SelectedDateEventListProps {
    events: Event[]
    selectedDate: Date
}

const SelectedDateEventList: FC<SelectedDateEventListProps> = ({
    events,
    selectedDate,
}) => {
    const today = new Date()
    const isToday =
        selectedDate.getFullYear() === today.getFullYear() &&
        selectedDate.getMonth() === today.getMonth() &&
        selectedDate.getDate() === today.getDate()

    if (isToday) {
        return null
    }

    const formattedDate = format(selectedDate, 'M月d日（E）')

    if (events.length === 0) {
        return (
            <div className="mt-3 mb-8">
                <h2 className="mb-4 text-lg font-bold">
                    {formattedDate}の予定
                </h2>
                <p className="text-gray-500">予定がありません</p>
            </div>
        )
    }

    return (
        <div className="mt-3 mb-8">
            <h2 className="mb-4 text-lg font-bold">{formattedDate}の予定</h2>
            <div className="space-y-3">
                {events.map((event) => (
                    <EventCard key={event.id} event={event} />
                ))}
            </div>
        </div>
    )
}

export default SelectedDateEventList
