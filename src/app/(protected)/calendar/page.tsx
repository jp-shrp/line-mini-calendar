import CalendarClient from '@/src/app/(protected)/calendar/components/CalendarClient'
import DebugInfo from '@/src/app/DebugInfo'

/**
 * カレンダートップ画面（SSR）
 * @description
 * SSRファーストのアプローチで実装
 * 動的な処理（React Query、ステート管理等）はCalendarClientコンポーネントに分離
 */
export default async function CalendarPage() {
    return (
        <>
            <CalendarClient />
            <DebugInfo />
        </>
    )
}
