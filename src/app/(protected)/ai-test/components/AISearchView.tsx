/**
 * AIイベント検索View
 */
import type { FC } from 'react'
import type { useAISearch } from '../hooks/useAISearch'
import { format } from 'date-fns'

type AISearchViewProps = ReturnType<typeof useAISearch>

export const AISearchView: FC<AISearchViewProps> = ({
    query,
    searchResult,
    isSearching,
    handleQueryChange,
    handleSearch,
    handleClear,
}) => {
    return (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-bold text-gray-900">
                🔍 AIイベント検索
            </h2>

            <div className="mb-4">
                <label
                    htmlFor="search-query"
                    className="mb-2 block text-sm font-medium text-gray-700">
                    自然言語で検索してみましょう
                </label>
                <div className="flex gap-2">
                    <input
                        id="search-query"
                        type="text"
                        value={query}
                        onChange={(e) => handleQueryChange(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !isSearching) {
                                handleSearch()
                            }
                        }}
                        placeholder="例: 今日の試合何がある、今週のイベント教えて"
                        className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                        disabled={isSearching}
                    />
                    <button
                        onClick={handleSearch}
                        disabled={isSearching || !query.trim()}
                        className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300">
                        {isSearching ? '検索中...' : '検索'}
                    </button>
                    {searchResult && (
                        <button
                            onClick={handleClear}
                            className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50">
                            クリア
                        </button>
                    )}
                </div>
                <p className="mt-2 text-xs text-gray-500">
                    💡 ヒント:
                    「今日の試合」「明日のイベント」「今週のNetflix」などと入力してみてください
                </p>
            </div>

            {searchResult && (
                <div className="mt-6">
                    <div className="mb-4 rounded-lg bg-blue-50 p-4">
                        <p className="text-sm font-medium text-blue-900">
                            🤖 AI: {searchResult.aiMessage}
                        </p>
                        {searchResult.searchParams && (
                            <div className="mt-2 text-xs text-blue-700">
                                <p>検索パラメータ:</p>
                                <ul className="ml-4 list-disc">
                                    {searchResult.searchParams.startDate && (
                                        <li>
                                            開始日:{' '}
                                            {
                                                searchResult.searchParams
                                                    .startDate
                                            }
                                        </li>
                                    )}
                                    {searchResult.searchParams.endDate && (
                                        <li>
                                            終了日:{' '}
                                            {searchResult.searchParams.endDate}
                                        </li>
                                    )}
                                    {searchResult.searchParams.category && (
                                        <li>
                                            カテゴリ:{' '}
                                            {searchResult.searchParams.category}
                                        </li>
                                    )}
                                    {searchResult.searchParams.keywords &&
                                        searchResult.searchParams.keywords
                                            .length > 0 && (
                                            <li>
                                                キーワード:{' '}
                                                {searchResult.searchParams.keywords.join(
                                                    ', '
                                                )}
                                            </li>
                                        )}
                                </ul>
                            </div>
                        )}
                    </div>

                    <div>
                        <h3 className="mb-3 text-lg font-semibold text-gray-900">
                            検索結果: {searchResult.total}件
                        </h3>

                        {searchResult.events.length === 0 && (
                            <p className="text-gray-500">
                                該当するイベントが見つかりませんでした
                            </p>
                        )}

                        <div className="space-y-3">
                            {searchResult.events.map((event) => (
                                <div
                                    key={event.id}
                                    className="rounded-lg border border-gray-200 bg-white p-4 hover:shadow-md">
                                    <div className="flex items-start gap-3">
                                        <div
                                            className="h-12 w-12 flex-shrink-0 rounded-lg"
                                            style={{
                                                backgroundColor:
                                                    event.color || '#9E9E9E',
                                            }}
                                        />
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-gray-900">
                                                {event.title}
                                            </h4>
                                            {event.description && (
                                                <p className="mt-1 text-sm text-gray-600">
                                                    {event.description}
                                                </p>
                                            )}
                                            <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-500">
                                                <span>
                                                    📅{' '}
                                                    {format(
                                                        new Date(
                                                            event.startDatetime
                                                        ),
                                                        'yyyy/MM/dd HH:mm'
                                                    )}{' '}
                                                    -{' '}
                                                    {format(
                                                        new Date(
                                                            event.endDatetime
                                                        ),
                                                        'HH:mm'
                                                    )}
                                                </span>
                                                <span className="rounded-full bg-gray-100 px-2 py-1">
                                                    {event.category}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
