import { LineRegisterClient } from './components/LineRegisterClient'

/**
 * LINE登録画面（LIFF専用）
 * @description
 * LINE経由でイベント候補を表示・登録するLIFF専用ページです。
 * LIFF SDKを使用するため、LineRegisterClientに委譲します。
 */
export default function LineRegisterPage() {
    return <LineRegisterClient />
}
