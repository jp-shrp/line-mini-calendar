import Link from 'next/link'
import { notFound } from 'next/navigation'
import { use } from 'react'
import { ItemEditClient } from './components/ItemEditClient'

export default function ItemEditPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id: idParam } = use(params)
    const id = parseInt(idParam)

    if (isNaN(id)) {
        notFound()
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">
                    商品編集（CSR）
                </h1>
                <p className="mt-2 text-gray-600">
                    クライアントサイドレンダリングでのデータ取得・編集フォーム
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
                        ✏️ 編集（現在のページ）
                    </Link>
                    <Link
                        href={`/sandbox/samplesV2/${id}/edit/errors/400`}
                        className="rounded bg-red-100 px-3 py-2 text-sm text-red-700 hover:bg-red-200">
                        ❌ 編集データ取得400エラー
                    </Link>
                    <Link
                        href={`/sandbox/samplesV2/${id}/edit/errors/500`}
                        className="rounded bg-red-100 px-3 py-2 text-sm text-red-700 hover:bg-red-200">
                        ❌ 編集データ取得500エラー
                    </Link>
                    <Link
                        href={`/sandbox/samplesV2/${id}/edit/errors/422`}
                        className="rounded bg-red-100 px-3 py-2 text-sm text-red-700 hover:bg-red-200">
                        ❌ バリデーションエラー（422）
                    </Link>
                </div>
            </div>

            <div className="mb-8 rounded-lg bg-yellow-50 p-4">
                <h2 className="text-lg font-semibold text-yellow-800">
                    編集フォーム（CSR）
                </h2>
                <p className="mt-1 text-sm text-yellow-600">
                    商品データをクライアントサイドで取得し、編集フォームを表示します
                </p>
            </div>

            <ItemEditClient id={id} />
        </div>
    )
}
