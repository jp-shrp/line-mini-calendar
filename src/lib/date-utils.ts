import { format as dateFnsFormat } from 'date-fns'
import { ja } from 'date-fns/locale'
import { fromZonedTime, toZonedTime } from 'date-fns-tz'

/**
 * 日本時間に変換してフォーマットするユーティリティ関数
 * date-fnsのformatを日本語localeでラップ
 *
 * @param date フォーマット対象の日付
 * @param formatStr フォーマット文字列
 * @returns フォーマット済みの日付文字列
 *
 * @example
 * format(new Date(), 'yyyy/MM/dd HH:mm')
 * // => '2025/10/07 12:34'
 */
export const format = (
    date: Date | string | number,
    formatStr: string
): string => {
    return dateFnsFormat(date, formatStr, { locale: ja })
}

/**
 * 日本時間（JST）に変換してフォーマットする
 *
 * @param datetime フォーマット対象の日付
 * @param formatStr フォーマット文字列（デフォルト: 'yyyy/MM/dd HH:mm'）
 * @returns フォーマット済みの日付文字列
 *
 * @example
 * formatJST(new Date())
 * // => '2025/10/07 12:34'
 *
 * formatJST(new Date(), 'yyyy年MM月dd日')
 * // => '2025年10月07日'
 */
export const formatJST = (
    datetime: Date | string,
    formatStr = 'yyyy/MM/dd HH:mm'
): string => {
    const date = new Date(datetime)
    const jstDate = toZonedTime(date, 'Asia/Tokyo')
    return format(jstDate, formatStr)
}

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
