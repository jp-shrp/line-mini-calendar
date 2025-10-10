/**
 * モックLIFF実装
 * 開発環境でLINEログインをシミュレートするためのモック
 */

import type { Liff, Profile, Message } from '@line/liff'

/**
 * モックLIFFクライアント
 */
class MockLiff implements Partial<Liff> {
    private _isLoggedIn = false
    private _isInitialized = false
    private _mockProfile: Profile = {
        userId: 'U1234567890abcdef',
        displayName: 'テストユーザー',
        pictureUrl: 'https://via.placeholder.com/150',
        statusMessage: 'モックLIFFユーザー',
    }

    /**
     * LIFF初期化（モック）
     */
    async init(config: { liffId: string }): Promise<void> {
        console.log('[MockLIFF] Initializing with', config)
        await new Promise((resolve) => setTimeout(resolve, 300))
        this._isInitialized = true
        // 開発環境では自動的にログイン状態にする
        this._isLoggedIn = true
        console.log('[MockLIFF] Initialized successfully')
    }

    /**
     * LIFF準備完了Promise（モック）
     */
    get ready(): Promise<void> {
        return Promise.resolve()
    }

    /**
     * ログイン状態確認（モック）
     */
    isLoggedIn(): boolean {
        return this._isLoggedIn
    }

    /**
     * LINE内ブラウザ判定（モック）
     * 開発環境では常にfalse
     */
    isInClient(): boolean {
        return false
    }

    /**
     * ログイン（モック）
     */
    login(config?: { redirectUri?: string }): void {
        console.log('[MockLIFF] Login called with', config)
        this._isLoggedIn = true
        console.log('[MockLIFF] Login successful')
    }

    /**
     * ログアウト（モック）
     */
    logout(): void {
        console.log('[MockLIFF] Logout called')
        this._isLoggedIn = false
    }

    /**
     * アクセストークン取得（モック）
     */
    getAccessToken(): string | null {
        if (!this._isLoggedIn) return null
        return 'mock_access_token_' + Date.now()
    }

    /**
     * IDトークン取得（モック）
     */
    getIDToken(): string | null {
        if (!this._isLoggedIn) return null
        return 'mock_id_token_' + Date.now()
    }

    /**
     * デコードされたIDトークン取得（モック）
     */
    getDecodedIDToken(): {
        sub: string
        name?: string
        picture?: string
        email?: string
    } | null {
        if (!this._isLoggedIn) return null
        return {
            sub: this._mockProfile.userId,
            name: this._mockProfile.displayName,
            picture: this._mockProfile.pictureUrl,
            email: 'mock.user@example.com',
        }
    }

    /**
     * ユーザープロフィール取得（モック）
     */
    async getProfile(): Promise<Profile> {
        if (!this._isLoggedIn) {
            throw new Error('Not logged in')
        }
        await new Promise((resolve) => setTimeout(resolve, 100))
        return this._mockProfile
    }

    /**
     * LIFFアプリを閉じる（モック）
     */
    closeWindow(): void {
        console.log('[MockLIFF] closeWindow called')
    }

    /**
     * OS情報取得（モック）
     */
    getOS(): 'ios' | 'android' | 'web' {
        return 'web'
    }

    /**
     * 言語設定取得（モック）
     */
    getLanguage(): string {
        return 'ja'
    }

    /**
     * LIFFバージョン取得（モック）
     */
    getVersion(): string {
        return '2.27.2-mock'
    }

    /**
     * 外部ブラウザでURLを開く（モック）
     */
    openWindow(params: { url: string; external?: boolean }): void {
        console.log('[MockLIFF] openWindow called with', params)
        window.open(params.url, '_blank')
    }

    /**
     * LINEトークにメッセージ送信（モック）
     */
    async sendMessages(messages: Message[]): Promise<void> {
        console.log('[MockLIFF] sendMessages called with', messages)
        await new Promise((resolve) => setTimeout(resolve, 300))
        console.log('[MockLIFF] Messages sent successfully')
    }

    /**
     * 友だち追加状態確認（モック）
     */
    async getFriendship(): Promise<{ friendFlag: boolean }> {
        await new Promise((resolve) => setTimeout(resolve, 100))
        return { friendFlag: true }
    }

    /**
     * 永続リンク作成（モック）
     */
    permanentLink = {
        createUrl: (): string => {
            return `https://liff.line.me/mock-liff-id${window.location.pathname}`
        },
        createUrlBy: (url: string): string => {
            return `https://liff.line.me/mock-liff-id${url}`
        },
        setExtraQueryParam: (key: string, value: string): void => {
            console.log('[MockLIFF] setExtraQueryParam called with', key, value)
        },
    }
}

/**
 * モックLIFFインスタンスをエクスポート
 */
export const mockLiff = new MockLiff() as unknown as Liff

/**
 * モックLIFFの初期化
 * グローバルなwindow.liffにモックを設定
 */
export function initMockLiff(): void {
    if (typeof window !== 'undefined') {
        ;(window as any).liff = mockLiff
        console.log('[MockLIFF] Mock LIFF initialized on window.liff')
    }
}

export default mockLiff
