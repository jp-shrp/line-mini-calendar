'use client'

import { useEventForm } from '../hooks/useEventForm'
import { MainView } from './MainView'

/**
 * イベントフォームのClient Component
 * @description
 * Hook+Viewパターンに従い、useEventFormでビジネスロジックを取得し、
 * MainViewにpropsとして渡します。
 */
export const EventFormClient = () => {
    const hookData = useEventForm()
    return <MainView {...hookData} />
}
