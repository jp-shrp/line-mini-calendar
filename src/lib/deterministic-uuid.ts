/**
 * 決定論的UUID生成
 * デバイス固有の情報から一意のUUIDを生成します
 */

/**
 * 文字列からハッシュ値を生成
 */
async function generateHash(input: string): Promise<string> {
    const encoder = new TextEncoder()
    const data = encoder.encode(input)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

/**
 * ハッシュ値をUUID v4形式に変換
 */
function formatAsUUID(hash: string): string {
    // UUID v4の形式: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
    // 4 = version 4
    // y = 8, 9, a, or b (variant bits)
    const formatted =
        hash.slice(0, 8) +
        '-' +
        hash.slice(8, 12) +
        '-' +
        '4' +
        hash.slice(13, 16) +
        '-' +
        'a' +
        hash.slice(17, 20) +
        '-' +
        hash.slice(20, 32)

    return formatted
}

/**
 * デバイス固有の識別子を生成
 * ブラウザのフィンガープリント情報を使用
 */
function getDeviceFingerprint(): string {
    const fingerprint = [
        navigator.userAgent,
        navigator.language,
        navigator.platform,
        screen.colorDepth,
        screen.width,
        screen.height,
        new Date().getTimezoneOffset(),
    ].join('|')

    return fingerprint
}

/**
 * 決定論的UUIDを生成
 * 同じデバイスからは常に同じUUIDが生成されます
 */
export async function generateDeterministicUUID(): Promise<string> {
    // LocalStorageに保存されているUUIDを確認
    const storedUUID = localStorage.getItem('device_uuid')

    if (storedUUID) {
        return storedUUID
    }

    // デバイスフィンガープリントを取得
    const fingerprint = getDeviceFingerprint()

    // ハッシュ値を生成
    const hash = await generateHash(fingerprint)

    // UUID形式に変換
    const uuid = formatAsUUID(hash)

    // LocalStorageに保存
    localStorage.setItem('device_uuid', uuid)

    return uuid
}

/**
 * 保存されているUUIDをクリア（テスト用）
 */
export function clearStoredUUID(): void {
    localStorage.removeItem('device_uuid')
}
