import type { FC } from 'react'
import type { useLineRegister } from '../hooks/useLineRegister'
import type { AIEventCandidate } from '@/supabase/functions/_shared/types/ai-api-types'

/**
 * MainViewのProps型
 */
type MainViewProps = ReturnType<typeof useLineRegister>

/**
 * イベント候補カードコンポーネント
 */
const EventCandidateCard: FC<{
    candidate: AIEventCandidate
    index: number
    isSelected: boolean
    showCheckbox: boolean
    onToggle: (index: number) => void
}> = ({ candidate, index, isSelected, showCheckbox, onToggle }) => {
    const startDate = new Date(candidate.startDatetime)
    const endDate = new Date(candidate.endDatetime)

    const formatDateTime = (date: Date) => {
        return date.toLocaleString('ja-JP', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    return (
        <div
            className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
            onClick={() => showCheckbox && onToggle(index)}>
            <div className="flex items-start gap-3">
                {showCheckbox && (
                    <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggle(index)}
                        className="mt-1 h-5 w-5 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                        onClick={(e) => e.stopPropagation()}
                    />
                )}
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                        {candidate.title}
                    </h3>
                    {candidate.description && (
                        <p className="mt-1 text-sm text-gray-600">
                            {candidate.description}
                        </p>
                    )}
                    <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                        <span className="rounded bg-blue-100 px-2 py-1 text-blue-800">
                            {candidate.category}
                        </span>
                        <span>
                            {formatDateTime(startDate)} -{' '}
                            {formatDateTime(endDate)}
                        </span>
                    </div>
                    {candidate.isDuplicate && (
                        <p className="mt-2 text-xs text-amber-600">
                            ⚠️ {candidate.duplicateReason}
                        </p>
                    )}
                </div>
            </div>
        </div>
    )
}

/**
 * LINE登録画面のMainViewコンポーネント
 * @description
 * イベント候補の表示と選択UIを提供します
 */
export const MainView: FC<MainViewProps> = ({
    mode,
    isLoading,
    error,
    aiMessage,
    candidates,
    selectedIndexes,
    isRegistering,
    handleToggleCandidate,
    handleToggleAll,
    handleRegister,
}) => {
    // ローディング表示
    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                    <p className="mt-4 text-gray-600">読み込み中...</p>
                </div>
            </div>
        )
    }

    // エラー表示
    if (error) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
                <div className="max-w-md rounded-lg bg-white p-6 shadow-md">
                    <div className="mb-4 text-center text-4xl">❌</div>
                    <h2 className="mb-2 text-center text-xl font-bold text-gray-900">
                        エラーが発生しました
                    </h2>
                    <p className="text-center text-gray-600">{error}</p>
                </div>
            </div>
        )
    }

    // 候補なし
    if (candidates.length === 0) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
                <div className="max-w-md rounded-lg bg-white p-6 shadow-md">
                    <div className="mb-4 text-center text-4xl">📭</div>
                    <h2 className="mb-2 text-center text-xl font-bold text-gray-900">
                        イベント候補がありません
                    </h2>
                    <p className="text-center text-gray-600">
                        登録可能なイベントが見つかりませんでした
                    </p>
                </div>
            </div>
        )
    }

    const showCheckbox = mode === 'select'
    const allSelected = selectedIndexes.length === candidates.length
    const selectedCount = selectedIndexes.length

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            {/* ヘッダー */}
            <div className="bg-white p-4 shadow-sm">
                <h1 className="text-xl font-bold text-gray-900">
                    イベント登録
                </h1>
                {aiMessage && (
                    <p className="mt-2 text-sm text-gray-600">{aiMessage}</p>
                )}
            </div>

            {/* 全選択ボタン（selectモードのみ） */}
            {showCheckbox && (
                <div className="bg-white p-4">
                    <button
                        onClick={handleToggleAll}
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200">
                        <input
                            type="checkbox"
                            checked={allSelected}
                            onChange={handleToggleAll}
                            className="h-4 w-4 rounded border-gray-300"
                            onClick={(e) => e.stopPropagation()}
                        />
                        <span>
                            すべて選択 ({selectedCount}/{candidates.length})
                        </span>
                    </button>
                </div>
            )}

            {/* イベント候補リスト */}
            <div className="space-y-3 p-4">
                {candidates.map((candidate, index) => (
                    <EventCandidateCard
                        key={index}
                        candidate={candidate}
                        index={index}
                        isSelected={selectedIndexes.includes(index)}
                        showCheckbox={showCheckbox}
                        onToggle={handleToggleCandidate}
                    />
                ))}
            </div>

            {/* 固定フッター */}
            <div className="fixed right-0 bottom-0 left-0 bg-white p-4 shadow-lg">
                <button
                    onClick={handleRegister}
                    disabled={isRegistering || selectedCount === 0}
                    className="w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500">
                    {isRegistering
                        ? '登録中...'
                        : `${selectedCount}件のイベントを登録`}
                </button>
            </div>
        </div>
    )
}
