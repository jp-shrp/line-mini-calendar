'use client'

import { useCalendar } from '@/src/app/(protected)/calendar/hooks/useCalendar'
import MainView from '@/src/app/(protected)/calendar/components/MainView'

export default function CalendarClient() {
    const hookItems = useCalendar()

    return <MainView {...hookItems} />
}
