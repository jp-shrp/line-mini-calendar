import type { FC } from 'react'
import type { Event } from '@/src/models/Event'

interface EventCardProps {
    event: Event
}

const EventCard: FC<EventCardProps> = ({ event }) => {
    return (
        <div className="flex items-start gap-3">
            <div className="flex w-16 flex-col items-center text-sm text-gray-600">
                <div>{event.startTime}</div>
                <div className="my-1 h-8 w-px bg-gray-300" />
                <div>{event.endTime}</div>
            </div>
            <div
                className={`flex flex-1 items-center gap-3 rounded-2xl ${event.color} p-4 text-white`}>
                {event.icon && (
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-white">
                        <span className="text-2xl">{event.icon}</span>
                    </div>
                )}
                <div className="flex-1 text-sm font-medium whitespace-pre-line">
                    {event.title}
                </div>
            </div>
        </div>
    )
}

export default EventCard
