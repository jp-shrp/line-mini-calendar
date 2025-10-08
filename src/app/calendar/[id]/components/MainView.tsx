import type { FC } from 'react'
import { formatJST } from '@/src/lib/date-utils'
import type { useEventDetail } from '../hooks/useEventDetail'
import { QueryStateHandler } from '@/src/components/QueryStateHandler'
import { Event } from '@/src/models/Event'

type MainViewProps = ReturnType<typeof useEventDetail>

/**
 * イベント詳細MainView Component
 *
 * @description
 * Presentational Component
 * Hook+Viewパターンに従い、表示ロジックのみを担当
 * QueryStateHandlerでエラーハンドリングを統一
 */
const MainView: FC<MainViewProps> = ({
    event,
    isLoading,
    error,
    handleEdit,
    handleOpenDeleteDialog,
    handleBack,
}) => {
    return (
        <QueryStateHandler
            data={event}
            isLoading={isLoading}
            error={error}
            useGlobalLoading={true}
            loadingMessage="イベント情報を読み込んでいます..."
            notFoundMessage="イベントが見つかりません">
            {(eventData) => {
                if (!eventData) {
                    return null
                }

                const eventModel = new Event(eventData)
                const startDate = formatJST(eventModel.startDatetime)
                const endDate = formatJST(eventModel.endDatetime)

                return (
                    <EventDetailContent
                        event={eventModel}
                        startDate={startDate}
                        endDate={endDate}
                        handleEdit={handleEdit}
                        handleOpenDeleteDialog={handleOpenDeleteDialog}
                        handleBack={handleBack}
                    />
                )
            }}
        </QueryStateHandler>
    )
}

/**
 * イベント詳細コンテンツコンポーネント
 */
const EventDetailContent: FC<{
    event: Event
    startDate: string
    endDate: string
    handleEdit: () => void
    handleOpenDeleteDialog: () => void
    handleBack: () => void
}> = ({
    event,
    startDate,
    endDate,
    handleEdit,
    handleOpenDeleteDialog,
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
                    <div className="flex gap-2">
                        <button
                            onClick={handleEdit}
                            className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                            編集
                        </button>
                        <button
                            onClick={handleOpenDeleteDialog}
                            className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700">
                            削除
                        </button>
                    </div>
                </div>

                {/* イベント詳細カード */}
                <div className="rounded-lg bg-white p-6 shadow-md">
                    {/* タイトル */}
                    <h1 className="mb-4 text-2xl font-bold text-gray-900">
                        {event.title}
                    </h1>

                    {/* カテゴリ */}
                    <div className="mb-4">
                        <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800">
                            {event.category}
                        </span>
                    </div>

                    {/* 日時 */}
                    <div className="mb-4 space-y-2">
                        <div className="flex items-center text-gray-700">
                            <span className="w-24 font-semibold">
                                開始日時:
                            </span>
                            <span>{startDate}</span>
                        </div>
                        <div className="flex items-center text-gray-700">
                            <span className="w-24 font-semibold">
                                終了日時:
                            </span>
                            <span>{endDate}</span>
                        </div>
                    </div>

                    {/* 説明 */}
                    {event.description && (
                        <div className="mb-4">
                            <h2 className="mb-2 font-semibold text-gray-900">
                                説明
                            </h2>
                            <p className="whitespace-pre-wrap text-gray-700">
                                {event.description}
                            </p>
                        </div>
                    )}

                    {/* カラー */}
                    {event.color && (
                        <div className="mb-4 flex items-center">
                            <span className="mr-2 font-semibold text-gray-900">
                                カラー:
                            </span>
                            <div
                                className="h-6 w-6 rounded border border-gray-300"
                                style={{ backgroundColor: event.color }}
                            />
                            <span className="ml-2 text-gray-700">
                                {event.color}
                            </span>
                        </div>
                    )}

                    {/* アイコンURL */}
                    {event.iconUrl && (
                        <div className="mb-4">
                            <span className="font-semibold text-gray-900">
                                アイコンURL:
                            </span>
                            <p className="break-all text-gray-700">
                                {event.iconUrl}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default MainView
