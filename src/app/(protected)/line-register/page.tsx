import { Suspense } from 'react'
import DebugInfo from '../../DebugInfo'
import { LineRegisterClient } from './components/LineRegisterClient'

/**
 * LINE登録画面（LIFF専用）
 * @description
 * LINE経由でイベント候補を表示・登録するLIFF専用ページです。
 * LIFF SDKを使用するため、LineRegisterClientに委譲します。
 */
export default function LineRegisterPage() {
    return (
        <Suspense
            fallback={
                <div className="flex min-h-screen items-center justify-center bg-gray-50">
                    <div className="text-center">
                        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                        <p className="mt-4 text-gray-600">読み込み中...</p>
                    </div>
                </div>
            }>
            <LineRegisterClient />
            <DebugInfo />
        </Suspense>
    )
}
