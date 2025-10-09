/**
 * AIテストページMain View
 */
import type { FC } from 'react'
import type { useAISearch } from '../hooks/useAISearch'
import type { useAIRegister } from '../hooks/useAIRegister'
import { AISearchView } from './AISearchView'
import { AIRegisterView } from './AIRegisterView'
import Link from 'next/link'

interface MainViewProps {
    searchHook: ReturnType<typeof useAISearch>
    registerHook: ReturnType<typeof useAIRegister>
}

export const MainView: FC<MainViewProps> = ({ searchHook, registerHook }) => {
    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto max-w-4xl px-4">
                {/* ヘッダー */}
                <div className="mb-8">
                    <div className="mb-4 flex items-center justify-between">
                        <h1 className="text-3xl font-bold text-gray-900">
                            🤖 AI機能テストページ
                        </h1>
                        <Link
                            href="/calendar"
                            className="rounded-lg bg-gray-600 px-4 py-2 text-white hover:bg-gray-700">
                            カレンダーに戻る
                        </Link>
                    </div>
                    <p className="text-gray-600">
                        Gemini
                        APIを使用したAIイベント検索・登録機能のテストページです。
                        <br />
                        自然言語でイベントを検索したり、登録したりできます。
                    </p>
                </div>

                {/* AIイベント検索セクション */}
                <div className="mb-8">
                    <AISearchView {...searchHook} />
                </div>

                {/* AIイベント登録セクション */}
                <div className="mb-8">
                    <AIRegisterView {...registerHook} />
                </div>

                {/* 使い方ガイド */}
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
                    <h3 className="mb-3 text-lg font-bold text-blue-900">
                        📖 使い方ガイド
                    </h3>
                    <div className="space-y-4 text-sm text-blue-800">
                        <div>
                            <h4 className="font-semibold">🔍 AI検索機能</h4>
                            <ul className="mt-1 ml-4 list-disc space-y-1">
                                <li>
                                    「今日の試合何がある」「明日のイベント教えて」などと入力
                                </li>
                                <li>
                                    AIが自然言語を解析して、該当するイベントを検索
                                </li>
                                <li>
                                    検索パラメータ（日付、カテゴリ、キーワード）が表示されます
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold">✨ AI登録機能</h4>
                            <ul className="mt-1 ml-4 list-disc space-y-1">
                                <li>
                                    「トットナムの試合を登録して」「Netflixの新作を追加」などと入力
                                </li>
                                <li>
                                    AIがイベント登録の候補を生成（現在は一般的な情報のみ）
                                </li>
                                <li>
                                    候補を選択して登録ボタンを押すとカレンダーに追加されます
                                </li>
                            </ul>
                        </div>
                        <div className="rounded-lg bg-orange-100 p-3">
                            <h4 className="font-semibold text-orange-900">
                                ⚠️ 現在の制限事項
                            </h4>
                            <ul className="mt-1 ml-4 list-disc space-y-1 text-orange-800">
                                <li>
                                    AI登録機能は実際のWeb検索を行わず、一般的な情報や例を提示します
                                </li>
                                <li>
                                    実際の試合日程や配信予定は取得できません
                                </li>
                                <li>将来的にWeb検索機能を統合する予定です</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
