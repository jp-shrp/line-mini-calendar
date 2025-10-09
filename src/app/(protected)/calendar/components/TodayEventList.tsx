import EventCard from '@/src/app/(protected)/calendar/components/EventCard'
import { Event } from '@/src/models/Event'
import type { FC } from 'react'

interface TodayEventListProps {
    events: Event[]
}

const TodayEventList: FC<TodayEventListProps> = ({ events }) => {
    if (events.length === 0) {
        return null
    }

    return (
        <div className="mt-3 mb-8">
            <h2 className="mb-4 text-lg font-bold">今日の予定</h2>
            <div className="space-y-3">
                {events.map((event) => (
                    <EventCard key={event.id} event={event} />
                ))}
            </div>
        </div>
    )
}

export default TodayEventList
