'use client'

import { useEventList } from '@/src/app/(protected)/calendar/list/hooks/useEventList'
import MainView from '@/src/app/(protected)/calendar/list/components/MainView'

export default function EventListClient() {
    const hookItems = useEventList()
    return <MainView {...hookItems} />
}
