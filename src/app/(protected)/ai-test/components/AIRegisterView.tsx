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
    selectedCandidateIndex,
    registeredEvent,
    isGenerating,
    isRegistering,
    handleQueryChange,
    handleGenerateCandidates,
    handleSelectCandidate,
    handleConfirmRegister,
    handleClear,
}) => {
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
                <div className="flex gap-2">
                    <input
                        id="register-query"
                        type="text"
                        value={query}
                        onChange={(e) => handleQueryChange(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !isGenerating) {
                                handleGenerateCandidates()
                            }
                        }}
                        placeholder="例: トットナムの試合を登録して、Netflixの新作を追加"
                        className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none"
                        disabled={isGenerating || isRegistering}
                    />
                    <button
                        onClick={handleGenerateCandidates}
                        disabled={
                            isGenerating || isRegistering || !query.trim()
                        }
                        className="rounded-lg bg-green-600 px-6 py-2 text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-300">
                        {isGenerating ? '生成中...' : '候補を生成'}
                    </button>
                    {(registerResult || registeredEvent) && (
                        <button
                            onClick={handleClear}
                            disabled={isRegistering}
                            className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:bg-gray-100">
                            クリア
                        </button>
                    )}
                </div>
                <p className="mt-2 text-xs text-gray-500">
                    💡 ヒント:
                    「トットナムの試合を登録」「明日のNetflix新作を追加」などと入力してみてください
                </p>
                <p className="mt-1 text-xs text-orange-600">
                    ⚠️ 注意:
                    現在、AIは実際のイベント情報を検索できません。一般的な情報や例を提示します。
                </p>
            </div>

            {registerResult && !registeredEvent && (
                <div className="mt-6">
                    <div className="mb-4 rounded-lg bg-green-50 p-4">
                        <p className="text-sm font-medium text-green-900">
                            🤖 AI: {registerResult.aiMessage}
                        </p>
                    </div>

                    <div>
                        <h3 className="mb-3 text-lg font-semibold text-gray-900">
                            登録候補: {registerResult.candidates.length}件
                        </h3>

                        {registerResult.candidates.length === 0 && (
                            <p className="text-gray-500">
                                登録候補が生成できませんでした。クエリを変更してもう一度お試しください。
                            </p>
                        )}

                        <div className="space-y-3">
                            {registerResult.candidates.map(
                                (candidate, index) => (
                                    <div
                                        key={index}
                                        onClick={() =>
                                            handleSelectCandidate(index)
                                        }
                                        className={`cursor-pointer rounded-lg border p-4 transition-all ${
                                            selectedCandidateIndex === index
                                                ? 'border-green-500 bg-green-50 shadow-md'
                                                : 'border-gray-200 bg-white hover:border-green-300 hover:shadow-sm'
                                        }`}>
                                        <div className="flex items-start gap-3">
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
                                                        {candidate.title}
                                                    </h4>
                                                    {selectedCandidateIndex ===
                                                        index && (
                                                        <span className="rounded-full bg-green-600 px-2 py-1 text-xs text-white">
                                                            選択中
                                                        </span>
                                                    )}
                                                </div>
                                                {candidate.description && (
                                                    <p className="mt-1 text-sm text-gray-600">
                                                        {candidate.description}
                                                    </p>
                                                )}
                                                <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-500">
                                                    <span>
                                                        📅{' '}
                                                        {format(
                                                            new Date(
                                                                candidate.startDatetime
                                                            ),
                                                            'yyyy/MM/dd HH:mm'
                                                        )}{' '}
                                                        -{' '}
                                                        {format(
                                                            new Date(
                                                                candidate.endDatetime
                                                            ),
                                                            'HH:mm'
                                                        )}
                                                    </span>
                                                    <span className="rounded-full bg-gray-100 px-2 py-1">
                                                        {candidate.category}
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
                                                        {candidate.source}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )
                            )}
                        </div>

                        {registerResult.candidates.length > 0 && (
                            <div className="mt-4">
                                <button
                                    onClick={handleConfirmRegister}
                                    disabled={
                                        selectedCandidateIndex === null ||
                                        isRegistering
                                    }
                                    className="w-full rounded-lg bg-green-600 px-6 py-3 text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-300">
                                    {isRegistering
                                        ? '登録中...'
                                        : '選択した候補を登録'}
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
        </div>
    )
}
