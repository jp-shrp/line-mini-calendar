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
            <div className="flex w-32 flex-col items-center text-sm text-gray-600">
                <div className="text-xs">{event.startDate}</div>
                <div className="font-medium">{event.startTime}</div>
                <div className="my-1 h-8 w-px bg-gray-300" />
                <div className="text-xs">{event.endDate}</div>
                <div className="font-medium">{event.endTime}</div>
            </div>
            <button
                onClick={handleClick}
                style={{ background: event.colorClass }} // guideline違反ではあるが、動的colorなので必要
                className={`flex flex-1 cursor-pointer items-center gap-3 rounded-2xl p-4 text-white transition-opacity hover:opacity-90`}>
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
