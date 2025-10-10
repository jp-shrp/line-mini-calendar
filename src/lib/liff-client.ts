/**
 * LIFFクライアント
 * LIFF SDKまたはモックLIFFを環境に応じて提供
 */

import type { Liff } from '@line/liff'

/**
 * LIFFクライアントを取得
 * 開発環境ではモックLIFF、本番環境では実際のLIFF SDKを使用
 */
export async function getLiffClient(): Promise<Liff> {
    // サーバーサイドでは何もしない
    if (typeof window === 'undefined') {
        throw new Error('LIFF can only be used in the browser')
    }

    const isDevelopment = process.env.NODE_ENV === 'development'
    const useMockLiff =
        isDevelopment && process.env.NEXT_PUBLIC_USE_MOCK_LIFF === 'true'

    if (useMockLiff) {
        // モックLIFFを使用
        const { mockLiff, initMockLiff } = await import('./mock-liff')
        initMockLiff()
        return mockLiff
    }

    // 実際のLIFF SDKを使用
    const liff = (await import('@line/liff')).default
    return liff
}

/**
 * LIFFを初期化
 */
export async function initializeLiff(): Promise<Liff> {
    const liff = await getLiffClient()
    const liffId = process.env.NEXT_PUBLIC_LIFF_ID

    if (!liffId) {
        throw new Error('NEXT_PUBLIC_LIFF_ID is not defined')
    }

    try {
        await liff.init({ liffId })
        console.log('[LIFF] Initialized successfully')
        return liff
    } catch (error) {
        console.error('[LIFF] Initialization failed:', error)
        throw error
    }
}

/**
 * LIFFが有効かどうかを確認
 */
export function isLiffEnabled(): boolean {
    return process.env.NEXT_PUBLIC_ENABLE_LIFF === 'true'
}
