export const enumToPgEnum = (
    myEnum: Record<string, string | number>
): [string, ...string[]] => {
    return Object.values(myEnum).map(
        (value: string | number) => `${value}`
    ) as [string, ...string[]]
}

export type Nullable<T> = {
    [K in keyof T]?: T[K] | null
}

/**
 * base64文字列をUint8Arrayに変換する関数（Deno用）
 * @param base64 base64形式のデータURI文字列
 * @returns { binary: Uint8Array, mimeType: string }
 */
export function base64ToUint8Array(base64: string): {
    binary: Uint8Array
    mimeType: string
} {
    const matches = base64.match(/^data:(.+);base64,(.+)$/)

    if (!matches || matches.length !== 3) {
        throw new Error('Invalid base64 string format')
    }

    const mimeType = matches[1]
    const decoded = atob(matches[2]) // base64デコード（文字列）
    const binary = new Uint8Array(decoded.length)

    for (let i = 0; i < decoded.length; i++) {
        binary[i] = decoded.charCodeAt(i)
    }

    return { binary, mimeType }
}

export function safeFileName(original: string): string {
    const ext = original.split('.').pop() ?? 'png'
    const base = original
        .replace(/\.[^/.]+$/, '') // 拡張子を除去
        .replace(/\s+/g, '-') // スペースをハイフンに
        .replace(/[^\w\-]/g, '') // 非英数字・ハイフン以外を削除
        .toLowerCase()

    return `${base}-${Date.now()}.${ext}`
}
