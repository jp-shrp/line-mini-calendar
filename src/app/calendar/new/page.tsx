import { EventFormClient } from './components/EventFormClient'

/**
 * イベント登録画面（SSR）
 * @description
 * イベントの新規登録を行う画面です。
 * Server Componentとして初期表示を高速化し、
 * 動的な処理はEventFormClientに委譲します。
 */
export default function EventNewPage() {
    return (
        <div className="min-h-screen bg-gray-50 px-4 py-8">
            <div className="mx-auto max-w-2xl">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">
                        新規イベント登録
                    </h1>
                    <p className="mt-2 text-sm text-gray-600">
                        イベントの詳細情報を入力してください
                    </p>
                </div>

                <div className="rounded-lg bg-white p-6 shadow-md">
                    <EventFormClient />
                </div>
            </div>
        </div>
    )
}
