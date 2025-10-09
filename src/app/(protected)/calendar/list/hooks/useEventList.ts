import { useEventListQuery } from '@/src/app/(protected)/calendar/api/event-query'
import { Event } from '@/src/models/Event'
import { useCallback, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

/**
 * イベント一覧画面のビジネスロジックHook
 * @returns イベント一覧画面に必要なステートとハンドラー
 */
export const useEventList = () => {
    const router = useRouter()
    const [page, setPage] = useState(1)
    const limit = 20

    // イベント一覧を取得
    const { data, isLoading, error } = useEventListQuery({
        page,
        limit,
    })

    // APIデータをモデルクラスでマッピング
    const events = useMemo(
        () => (data?.events || []).map((event) => new Event(event)),
        [data]
    )

    const totalPages = useMemo(() => {
        if (!data?.total) return 1
        return Math.ceil(data.total / limit)
    }, [data?.total, limit])

    const handlePageChange = useCallback((newPage: number) => {
        setPage(newPage)
    }, [])

    const handleBack = useCallback(() => {
        router.back()
    }, [router])

    return {
        events,
        isLoading,
        error,
        page,
        totalPages,
        handlePageChange,
        handleBack,
    }
}
