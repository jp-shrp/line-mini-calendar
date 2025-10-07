import type { FC } from 'react'
import { Event } from '@/src/models/Event'

interface UpcomingEventCardProps {
    event: Event
}

const UpcomingEventCard: FC<UpcomingEventCardProps> = ({ event }) => {
    return (
        <div
            className={`flex items-center gap-4 rounded-2xl ${event.colorClass} p-4 text-white`}>
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-white">
                <svg
                    className="h-6 w-6 text-purple-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                </svg>
            </div>
            <div className="flex-1">
                <div className="mb-1 font-medium">{event.title}</div>
                <div className="flex items-center gap-2 text-sm opacity-90">
                    <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                    <span>
                        {event.startTime} - {event.endTime}
                    </span>
                </div>
            </div>
        </div>
    )
}

export default UpcomingEventCard
