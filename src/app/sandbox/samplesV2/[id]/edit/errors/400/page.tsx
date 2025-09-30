import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ItemEdit400Client } from './components/ItemEdit400Client'

export default async function ItemEdit400Page({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id: idParam } = await params
    const id = parseInt(idParam)

    if (isNaN(id)) {
        notFound()
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">
                    編集データ取得400エラー
                </h1>
                <p className="mt-2 text-gray-600">
                    編集フォーム表示用データ取得時の400エラーテスト（CSR）
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
                        href={`/sandbox/samplesV2/${id}`}
                        className="rounded bg-green-100 px-3 py-2 text-sm text-green-700 hover:bg-green-200">
                        ✅ 詳細（正常系）
                    </Link>
                    <Link
                        href={`/sandbox/samplesV2/${id}/edit`}
                        className="rounded bg-yellow-100 px-3 py-2 text-sm text-yellow-700 hover:bg-yellow-200">
                        ✏️ 編集（正常系）
                    </Link>
                    <Link
                        href={`/sandbox/samplesV2/${id}/edit/errors/400`}
                        className="rounded bg-red-100 px-3 py-2 text-sm text-red-700 hover:bg-red-200">
                        ❌ 編集データ取得400エラー（現在のページ）
                    </Link>
                </div>
            </div>

            <ItemEdit400Client id={id.toString()} />
        </div>
    )
}
