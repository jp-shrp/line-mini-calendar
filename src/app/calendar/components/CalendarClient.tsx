'use client'

import { useCalendar } from '@/src/app/calendar/hooks/useCalendar'
import MainView from '@/src/app/calendar/components/MainView'

export default function CalendarClient() {
    const hookItems = useCalendar()
    return <MainView {...hookItems} />
}
