import type { FC } from 'react'
import type { useEventList } from '../hooks/useEventList'
import { QueryStateHandler } from '@/src/components/QueryStateHandler'
import UpcomingEventCard from '@/src/app/calendar/components/UpcomingEventCard'

type MainViewProps = ReturnType<typeof useEventList>

/**
 * イベント一覧MainView Component
 *
 * @description
 * Presentational Component
 * Hook+Viewパターンに従い、表示ロジックのみを担当
 * QueryStateHandlerでエラーハンドリングを統一
 */
const MainView: FC<MainViewProps> = ({
    events,
    isLoading,
    error,
    page,
    totalPages,
    handlePageChange,
    handleBack,
}) => {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="mx-auto max-w-2xl p-4">
                {/* ヘッダー */}
                <div className="mb-6 flex items-center justify-between">
                    <button
                        onClick={handleBack}
                        className="text-blue-600 hover:text-blue-800">
                        ← 戻る
                    </button>
                    <h1 className="text-xl font-bold">イベント一覧</h1>
                    <div className="w-16" />
                </div>

                <QueryStateHandler
                    data={events}
                    isLoading={isLoading}
                    error={error}
                    useGlobalLoading={true}
                    loadingMessage="イベント一覧を読み込んでいます..."
                    notFoundMessage="イベントが見つかりません">
                    {(eventList) => {
                        if (!eventList || eventList.length === 0) {
                            return (
                                <div className="text-center text-gray-600">
                                    イベントがありません
                                </div>
                            )
                        }

                        return (
                            <>
                                {/* イベントリスト */}
                                <div className="mb-6 space-y-3">
                                    {eventList.map((event) => (
                                        <UpcomingEventCard
                                            key={event.id}
                                            event={event}
                                        />
                                    ))}
                                </div>

                                {/* ページネーション */}
                                {totalPages > 1 && (
                                    <div className="flex items-center justify-center gap-2">
                                        <button
                                            onClick={() =>
                                                handlePageChange(page - 1)
                                            }
                                            disabled={page === 1}
                                            className="rounded-lg bg-blue-600 px-4 py-2 text-white disabled:cursor-not-allowed disabled:bg-gray-300">
                                            前へ
                                        </button>
                                        <span className="text-sm text-gray-600">
                                            {page} / {totalPages}
                                        </span>
                                        <button
                                            onClick={() =>
                                                handlePageChange(page + 1)
                                            }
                                            disabled={page === totalPages}
                                            className="rounded-lg bg-blue-600 px-4 py-2 text-white disabled:cursor-not-allowed disabled:bg-gray-300">
                                            次へ
                                        </button>
                                    </div>
                                )}
                            </>
                        )
                    }}
                </QueryStateHandler>
            </div>
        </div>
    )
}

export default MainView
