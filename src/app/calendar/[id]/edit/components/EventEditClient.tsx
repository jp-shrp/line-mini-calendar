'use client'

import type { FC } from 'react'
import { useEventEdit } from '../hooks/useEventEdit'
import MainView from './MainView'

interface EventEditClientProps {
    eventId: string
}

/**
 * イベント編集Client Component
 *
 * @description
 * Hook+Viewパターンに従い、ビジネスロジックとViewを分離
 * useEventEditからビジネスロジックを取得し、MainViewに渡す
 */
const EventEditClient: FC<EventEditClientProps> = ({ eventId }) => {
    const hookData = useEventEdit(eventId)

    return <MainView {...hookData} />
}

export default EventEditClient
