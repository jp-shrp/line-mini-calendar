'use client'

import { useCalendar } from '@/src/app/calendar/hooks/useCalendar'
import MainView from '@/src/app/calendar/components/MainView'
import { useAuth } from '@/src/contexts/AuthContext'

export default function CalendarClient() {
    const { isAuthenticated, isLoading } = useAuth()

    // 認証が完了するまでローディング表示
    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="text-center">
                    <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
                    <p className="text-gray-600">認証中...</p>
                </div>
            </div>
        )
    }

    // 認証されていない場合はエラー表示
    if (!isAuthenticated) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="text-center">
                    <p className="mb-4 text-red-600">認証が必要です</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                        再読み込み
                    </button>
                </div>
            </div>
        )
    }

    const hookItems = useCalendar()
    return <MainView {...hookItems} />
}
