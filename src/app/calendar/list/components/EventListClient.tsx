'use client'

import { useEventList } from '@/src/app/calendar/list/hooks/useEventList'
import MainView from '@/src/app/calendar/list/components/MainView'

export default function EventListClient() {
    const hookItems = useEventList()
    return <MainView {...hookItems} />
}
