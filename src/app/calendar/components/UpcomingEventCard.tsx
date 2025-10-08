import { Event } from '@/src/models/Event'
import { useRouter } from 'next/navigation'
import type { FC } from 'react'

interface UpcomingEventCardProps {
    event: Event
}

const UpcomingEventCard: FC<UpcomingEventCardProps> = ({ event }) => {
    const router = useRouter()

    const handleClick = () => {
        router.push(`/calendar/${event.id}`)
    }

    return (
        <button
            onClick={handleClick}
            className={`flex items-center gap-4 rounded-2xl bg-[${event.colorClass}] w-full cursor-pointer p-4 text-white transition-opacity hover:opacity-90`}>
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
            <div className="flex-1 text-left">
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
        </button>
    )
}

export default UpcomingEventCard
