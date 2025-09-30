import { getItemsWithLimit } from '@/actions/ItemAction'
import Link from 'next/link'
import { SamplesV2Client } from './components/SamplesV2Client'

export default async function SamplesV2Page() {
    const initialItems = await getItemsWithLimit(5, 0)

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">
                    Universal API Client サンプルV2
                </h1>
                <p className="mt-2 text-gray-600">
                    API/画面定義確認サンプル - SSR/CSR/エラーハンドリング
                </p>
            </div>

            <div className="mb-8 rounded-lg bg-blue-50 p-4">
                <h2 className="mb-4 text-xl font-semibold text-blue-900">
                    テストページ一覧
                </h2>
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
                    <Link
                        href="/sandbox/samplesV2"
                        className="rounded bg-blue-100 px-3 py-2 text-sm text-blue-700 hover:bg-blue-200">
                        📋 メイン（正常系）
                    </Link>
                    <Link
                        href="/sandbox/samplesV2/errors/400"
                        className="rounded bg-red-100 px-3 py-2 text-sm text-red-700 hover:bg-red-200">
                        ❌ リスト400エラー
                    </Link>
                    <Link
                        href="/sandbox/samplesV2/errors/more/400"
                        className="rounded bg-red-100 px-3 py-2 text-sm text-red-700 hover:bg-red-200">
                        ❌ もっと見る400エラー
                    </Link>
                    <Link
                        href="/sandbox/samplesV2/errors/500"
                        className="rounded bg-red-100 px-3 py-2 text-sm text-red-700 hover:bg-red-200">
                        ❌ リスト500エラー
                    </Link>
                </div>
            </div>

            <SamplesV2Client initialItems={initialItems} />
        </div>
    )
}
