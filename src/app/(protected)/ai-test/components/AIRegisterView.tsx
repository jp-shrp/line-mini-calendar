/**
 * AIイベント登録View
 */
import type { FC } from 'react'
import type { useAIRegister } from '../hooks/useAIRegister'
import { format } from 'date-fns'
import Link from 'next/link'

type AIRegisterViewProps = ReturnType<typeof useAIRegister>

export const AIRegisterView: FC<AIRegisterViewProps> = ({
    query,
    registerResult,
    selectedCandidateIndexes,
    registeredEvent,
    registeredEvents,
    isGenerating,
    isRegistering,
    handleQueryChange,
    handleGenerateCandidates,
    handleToggleCandidateSelection,
    handleBatchRegister,
    handleClear,
}) => {
    /**
     * 日付を安全にフォーマットする
     */
    const formatDate = (
        dateString: string | Date,
        formatStr: string
    ): string => {
        try {
            const date =
                typeof dateString === 'string'
                    ? new Date(dateString)
                    : dateString
            // 無効な日付をチェック
            if (isNaN(date.getTime())) {
                return String(dateString) // 元の文字列をそのまま表示
            }
            return format(date, formatStr)
        } catch (error) {
            console.error('Date formatting error:', error, dateString)
            return String(dateString) // エラー時は元の文字列を表示
        }
    }

    return (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-bold text-gray-900">
                ✨ AIイベント登録
            </h2>

            <div className="mb-4">
                <label
                    htmlFor="register-query"
                    className="mb-2 block text-sm font-medium text-gray-700">
                    自然言語で登録してみましょう
                </label>
                <div className="mb-2">
                    <input
                        id="register-query"
                        type="text"
                        value={query}
                        onChange={(e) => handleQueryChange(e.target.value)}
                        placeholder="例: トットナムの試合を登録して、Netflixの新作を追加"
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none"
                        disabled={isGenerating || isRegistering}
                    />
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleGenerateCandidates}
                        disabled={
                            isGenerating || isRegistering || !query.trim()
                        }
                        className="flex-1 rounded-lg bg-green-600 px-6 py-3 text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-300">
                        {isGenerating ? '生成中...' : '候補を生成'}
                    </button>
                    {(registerResult || registeredEvent) && (
                        <button
                            onClick={handleClear}
                            disabled={isRegistering}
                            className="rounded-lg border border-gray-300 px-6 py-3 text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:bg-gray-100">
                            クリア
                        </button>
                    )}
                </div>
                <p className="mt-2 text-xs text-gray-500">
                    💡 ヒント:
                    「トットナムの試合を登録」「明日のNetflix新作を追加」などと入力してみてください
                </p>
                <p className="mt-1 text-xs text-green-600">
                    ✨ Web検索:
                    AIがGoogle検索を使用してリアルタイムのイベント情報を取得します
                </p>
            </div>

            {registerResult &&
                !registeredEvent &&
                registeredEvents.length === 0 && (
                    <div className="mt-6">
                        <div className="mb-4 rounded-lg bg-green-50 p-4">
                            <p className="text-sm font-medium text-green-900">
                                🤖 AI: {registerResult.aiMessage}
                            </p>
                        </div>

                        <div>
                            <div className="mb-3 flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    登録候補: {registerResult.candidates.length}
                                    件
                                </h3>
                                {selectedCandidateIndexes.length > 0 && (
                                    <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                                        {selectedCandidateIndexes.length}
                                        件選択中
                                    </span>
                                )}
                            </div>

                            {registerResult.candidates.length === 0 && (
                                <p className="text-gray-500">
                                    登録候補が生成できませんでした。クエリを変更してもう一度お試しください。
                                </p>
                            )}

                            <div className="space-y-3">
                                {registerResult.candidates.map(
                                    (candidate, index) => {
                                        const isSelected =
                                            selectedCandidateIndexes.includes(
                                                index
                                            )
                                        return (
                                            <div
                                                key={index}
                                                onClick={() =>
                                                    handleToggleCandidateSelection(
                                                        index
                                                    )
                                                }
                                                className={`cursor-pointer rounded-lg border p-4 transition-all ${
                                                    isSelected
                                                        ? 'border-green-500 bg-green-50 shadow-md'
                                                        : 'border-gray-200 bg-white hover:border-green-300 hover:shadow-sm'
                                                }`}>
                                                <div className="flex items-start gap-3">
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={() =>
                                                            handleToggleCandidateSelection(
                                                                index
                                                            )
                                                        }
                                                        className="mt-1 h-5 w-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                                                        onClick={(e) =>
                                                            e.stopPropagation()
                                                        }
                                                    />
                                                    <div
                                                        className="h-12 w-12 flex-shrink-0 rounded-lg"
                                                        style={{
                                                            backgroundColor:
                                                                candidate.color ||
                                                                '#9E9E9E',
                                                        }}
                                                    />
                                                    <div className="flex-1">
                                                        <div className="flex items-start justify-between">
                                                            <h4 className="font-semibold text-gray-900">
                                                                {
                                                                    candidate.title
                                                                }
                                                            </h4>
                                                            {isSelected && (
                                                                <span className="rounded-full bg-green-600 px-2 py-1 text-xs text-white">
                                                                    選択中
                                                                </span>
                                                            )}
                                                        </div>
                                                        {candidate.description && (
                                                            <p className="mt-1 text-sm text-gray-600">
                                                                {
                                                                    candidate.description
                                                                }
                                                            </p>
                                                        )}
                                                        <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-500">
                                                            <span>
                                                                📅{' '}
                                                                {formatDate(
                                                                    candidate.startDatetime,
                                                                    'yyyy/MM/dd HH:mm'
                                                                )}{' '}
                                                                -{' '}
                                                                {formatDate(
                                                                    candidate.endDatetime,
                                                                    'HH:mm'
                                                                )}
                                                            </span>
                                                            <span className="rounded-full bg-gray-100 px-2 py-1">
                                                                {
                                                                    candidate.category
                                                                }
                                                            </span>
                                                            {candidate.confidence !==
                                                                undefined && (
                                                                <span className="rounded-full bg-blue-100 px-2 py-1 text-blue-700">
                                                                    確信度:{' '}
                                                                    {Math.round(
                                                                        candidate.confidence *
                                                                            100
                                                                    )}
                                                                    %
                                                                </span>
                                                            )}
                                                        </div>
                                                        {candidate.source && (
                                                            <p className="mt-1 text-xs text-gray-400 italic">
                                                                情報源:{' '}
                                                                {
                                                                    candidate.source
                                                                }
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    }
                                )}
                            </div>

                            {registerResult.candidates.length > 0 && (
                                <div className="mt-4">
                                    <button
                                        onClick={handleBatchRegister}
                                        disabled={
                                            selectedCandidateIndexes.length ===
                                                0 || isRegistering
                                        }
                                        className="w-full rounded-lg bg-green-600 px-6 py-3 text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-300">
                                        {isRegistering
                                            ? '登録中...'
                                            : `選択した${selectedCandidateIndexes.length}件を一括登録`}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

            {registeredEvent && (
                <div className="mt-6">
                    <div className="rounded-lg bg-green-100 p-6 text-center">
                        <div className="mb-4 text-4xl">✅</div>
                        <h3 className="mb-2 text-lg font-bold text-green-900">
                            イベントを登録しました！
                        </h3>
                        <p className="mb-4 text-sm text-green-700">
                            「{registeredEvent.title}
                            」をカレンダーに追加しました
                        </p>
                        <div className="flex justify-center gap-3">
                            <Link
                                href="/calendar"
                                className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700">
                                カレンダーで確認
                            </Link>
                            <button
                                onClick={handleClear}
                                className="rounded-lg border border-green-600 px-4 py-2 text-green-600 hover:bg-green-50">
                                続けて登録
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {registeredEvents.length > 0 && (
                <div className="mt-6">
                    <div className="rounded-lg bg-green-100 p-6">
                        <div className="mb-4 text-center text-4xl">✅</div>
                        <h3 className="mb-2 text-center text-lg font-bold text-green-900">
                            {registeredEvents.length}
                            件のイベントを一括登録しました！
                        </h3>
                        <div className="mb-4 space-y-2">
                            {registeredEvents.map((event, index) => (
                                <div
                                    key={index}
                                    className="rounded-lg bg-white p-3">
                                    <p className="font-medium text-gray-900">
                                        ✓ {event.title}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        {formatDate(
                                            event.startDatetime,
                                            'yyyy/MM/dd HH:mm'
                                        )}
                                    </p>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-center gap-3">
                            <Link
                                href="/calendar"
                                className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700">
                                カレンダーで確認
                            </Link>
                            <button
                                onClick={handleClear}
                                className="rounded-lg border border-green-600 px-4 py-2 text-green-600 hover:bg-green-50">
                                続けて登録
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
