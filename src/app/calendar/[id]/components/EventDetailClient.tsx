'use client'

import type { FC } from 'react'
import { useEventDetail } from '../hooks/useEventDetail'
import MainView from './MainView'

interface EventDetailClientProps {
    eventId: string
}

/**
 * イベント詳細Client Component
 *
 * @description
 * Hook+Viewパターンに従い、ビジネスロジックとViewを分離
 * useEventDetailからビジネスロジックを取得し、MainViewに渡す
 */
const EventDetailClient: FC<EventDetailClientProps> = ({ eventId }) => {
    const hookData = useEventDetail(eventId)

    return <MainView {...hookData} />
}

export default EventDetailClient
