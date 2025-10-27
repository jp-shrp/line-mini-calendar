/**
 * LINE Webhook署名検証ユーティリティ
 *
 * @description
 * LINE Messaging APIからのWebhookリクエストの署名を検証します。
 * 公式ドキュメント: https://developers.line.biz/ja/reference/messaging-api/#signature-validation
 */

/**
 * LINE Webhook署名を検証する
 *
 * @param body - リクエストボディ（文字列）
 * @param signature - X-Line-Signatureヘッダーの値
 * @param channelSecret - LINEチャネルシークレット
 * @returns 署名が正しければtrue、それ以外はfalse
 *
 * @example
 * ```typescript
 * const isValid = await verifyLineSignature(
 *   requestBody,
 *   request.headers.get('X-Line-Signature'),
 *   channelSecret
 * )
 * if (!isValid) {
 *   throw new Error('Invalid signature')
 * }
 * ```
 */
export async function verifyLineSignature(
    body: string,
    signature: string | null,
    channelSecret: string
): Promise<boolean> {
    if (!signature) {
        return false
    }

    // channel secretをキーとしてHMAC-SHA256を計算
    const encoder = new TextEncoder()
    const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(channelSecret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    )

    // ボディのHMAC-SHA256ハッシュを計算
    const signed = await crypto.subtle.sign('HMAC', key, encoder.encode(body))

    // Base64エンコード
    const base64Signature = btoa(String.fromCharCode(...new Uint8Array(signed)))

    // 署名を比較
    return base64Signature === signature
}

/**
 * LINE Webhook署名を検証し、無効な場合はエラーをスローする
 *
 * @param body - リクエストボディ（文字列）
 * @param signature - X-Line-Signatureヘッダーの値
 * @param channelSecret - LINEチャネルシークレット
 * @throws 署名が無効な場合にエラーをスロー
 *
 * @example
 * ```typescript
 * await validateLineSignature(
 *   requestBody,
 *   request.headers.get('X-Line-Signature'),
 *   channelSecret
 * )
 * // 署名が無効な場合はここに到達しない
 * ```
 */
export async function validateLineSignature(
    body: string,
    signature: string | null,
    channelSecret: string
): Promise<void> {
    const isValid = await verifyLineSignature(body, signature, channelSecret)

    if (!isValid) {
        throw new Error('Invalid LINE signature')
    }
}
