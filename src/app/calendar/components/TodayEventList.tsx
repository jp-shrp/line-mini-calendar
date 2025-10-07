import type { FC } from 'react'
import { Event } from '@/src/models/Event'
import EventCard from '@/src/app/calendar/components/EventCard'

interface TodayEventListProps {
    events: Event[]
}

const TodayEventList: FC<TodayEventListProps> = ({ events }) => {
    if (events.length === 0) {
        return null
    }

    return (
        <div className="mb-8">
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
