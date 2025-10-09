import type { FC } from 'react'
import { Event } from '@/src/models/Event'
import UpcomingEventCard from '@/src/app/(protected)/calendar/components/UpcomingEventCard'
import Link from 'next/link'

interface UpcomingEventListProps {
    events: Event[]
}

const UpcomingEventList: FC<UpcomingEventListProps> = ({ events }) => {
    if (events.length === 0) {
        return null
    }

    return (
        <div className="mb-8">
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold">今後のイベント</h2>
                <Link
                    href="/calendar/list"
                    className="text-sm text-gray-600 hover:text-gray-800">
                    全て表示
                </Link>
            </div>
            <p className="mb-4 text-sm text-gray-600">
                明日以降に予定しているイベント
            </p>
            <div className="space-y-3">
                {events.map((event) => (
                    <UpcomingEventCard key={event.id} event={event} />
                ))}
            </div>
        </div>
    )
}

export default UpcomingEventList
