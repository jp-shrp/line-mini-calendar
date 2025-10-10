/**
 * LIFF SDK型定義
 * @see https://developers.line.biz/ja/reference/liff/
 */

import '@line/liff'

declare module '@line/liff' {
    export interface Liff {
        /**
         * LIFF初期化
         */
        init(config: { liffId: string }): Promise<void>

        /**
         * LIFF準備完了確認
         */
        ready: Promise<void>

        /**
         * LINEログイン状態確認
         */
        isLoggedIn(): boolean

        /**
         * LINE内ブラウザ判定
         */
        isInClient(): boolean

        /**
         * ログイン
         */
        login(config?: { redirectUri?: string }): void

        /**
         * ログアウト
         */
        logout(): void

        /**
         * アクセストークン取得
         */
        getAccessToken(): string | null

        /**
         * IDトークン取得
         */
        getIDToken(): string | null

        /**
         * デコードされたIDトークン取得
         */
        getDecodedIDToken(): {
            sub: string // LINE User ID
            name?: string
            picture?: string
            email?: string
        } | null

        /**
         * ユーザープロフィール取得
         */
        getProfile(): Promise<Profile>

        /**
         * LIFFアプリを閉じる
         */
        closeWindow(): void

        /**
         * OS情報取得
         */
        getOS(): 'ios' | 'android' | 'web'

        /**
         * 言語設定取得
         */
        getLanguage(): string

        /**
         * LIFFバージョン取得
         */
        getVersion(): string

        /**
         * 外部ブラウザでURLを開く
         */
        openWindow(params: { url: string; external?: boolean }): void

        /**
         * LINEトークにメッセージ送信
         */
        sendMessages(messages: Message[]): Promise<void>

        /**
         * 友だち追加状態確認
         */
        getFriendship(): Promise<{ friendFlag: boolean }>

        /**
         * 永続リンク作成
         */
        permanentLink: {
            createUrl(): string
            createUrlBy(url: string): string
            setExtraQueryParam(key: string, value: string): void
        }
    }

    export interface Profile {
        userId: string
        displayName: string
        pictureUrl?: string
        statusMessage?: string
    }

    export interface Message {
        type: 'text' | 'image' | 'video' | 'audio' | 'location' | 'sticker'
        text?: string
        // その他のメッセージタイプのプロパティ
    }

    export interface LiffError extends Error {
        code: string
    }
}

/**
 * グローバルなliffオブジェクトの型定義
 */
declare global {
    interface Window {
        liff: import('@line/liff').Liff
    }
}

export {}
