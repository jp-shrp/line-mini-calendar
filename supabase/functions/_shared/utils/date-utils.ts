import { fromZonedTime } from 'npm:date-fns-tz@3.2.0'

/**
 * 日本時間（JST）としての日時文字列をUTC Dateオブジェクトに変換
 * フロントエンドから送信されたdatetime-local形式（タイムゾーン情報なし）を
 * 日本時間として解釈し、UTC Dateオブジェクトに変換します
 *
 * @param datetimeLocal タイムゾーン情報のない日時文字列（例: "2025-10-07T20:30"）
 * @returns UTC Dateオブジェクト
 *
 * @example
 * // フロントから"2025-10-07T20:30"（日本時間20:30のつもり）が送信された場合
 * parseJSTtoUTC("2025-10-07T20:30")
 * // => Date object representing 2025-10-07T11:30:00.000Z (UTC)
 * // つまり日本時間の20:30 = UTC 11:30
 */
export const parseJSTtoUTC = (datetimeLocal: string): Date => {
    // datetime-local形式の文字列を日本時間として解釈
    return fromZonedTime(datetimeLocal, 'Asia/Tokyo')
}
