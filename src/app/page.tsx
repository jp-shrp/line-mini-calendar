import CalendarClient from '@/src/app/(protected)/calendar/components/CalendarClient'
import DebugInfo from './DebugInfo'

export default async function HomePage() {
    return (
        <>
            <CalendarClient />
            <DebugInfo />
        </>
    )
}
