import { Event } from '@/src/models/Event'
import { useRouter } from 'next/navigation'
import type { FC } from 'react'

interface EventCardProps {
    event: Event
}

const EventCard: FC<EventCardProps> = ({ event }) => {
    const router = useRouter()

    const handleClick = () => {
        router.push(`/calendar/${event.id}`)
    }

    return (
        <div className="flex items-start gap-3">
            <div className="flex w-16 flex-col items-center text-sm text-gray-600">
                <div>{event.startTime}</div>
                <div className="my-1 h-8 w-px bg-gray-300" />
                <div>{event.endTime}</div>
            </div>
            <button
                onClick={handleClick}
                className={`flex flex-1 cursor-pointer items-center gap-3 rounded-2xl bg-[${event.colorClass}] p-4 text-white transition-opacity hover:opacity-90`}>
                {event.icon && (
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-white">
                        <span className="text-2xl">{event.icon}</span>
                    </div>
                )}
                <div className="flex-1 text-left text-sm font-medium whitespace-pre-line">
                    {event.title}
                </div>
            </button>
        </div>
    )
}

export default EventCard
