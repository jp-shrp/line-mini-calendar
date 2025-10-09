import { fromZonedTime } from 'npm:date-fns-tz@3.2.0'

/**
 * 日時文字列が有効かどうかをバリデーションする
 * @param datetimeString 日時文字列
 * @returns 有効な場合true、無効な場合false
 */
export const isValidDatetime = (datetimeString: string): boolean => {
    try {
        const date = new Date(datetimeString)
        if (isNaN(date.getTime())) {
            return false
        }

        const isoString = datetimeString.replace(/\+09:00$/, '')
        const match = isoString.match(
            /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/
        )

        if (!match) {
            return false
        }

        const [, year, month, day, hour, minute] = match
        const y = parseInt(year, 10)
        const m = parseInt(month, 10)
        const d = parseInt(day, 10)
        const h = parseInt(hour, 10)
        const min = parseInt(minute, 10)

        if (m < 1 || m > 12) return false
        if (d < 1 || d > 31) return false
        if (h < 0 || h > 23) return false
        if (min < 0 || min > 59) return false

        const daysInMonth = new Date(y, m, 0).getDate()
        if (d > daysInMonth) return false

        return true
    } catch {
        return false
    }
}

/**
 * 日本時間（JST）としての日時文字列をUTC Dateオブジェクトに変換
 * フロントエンドから送信されたdatetime-local形式（タイムゾーン情報なし）を
 * 日本時間として解釈し、UTC Dateオブジェクトに変換します
 *
 * @param datetimeLocal タイムゾーン情報のない日時文字列（例: "2025-10-07T20:30"）
 * @returns UTC Dateオブジェクト
 * @throws 無効な日時文字列の場合はエラーをスロー
 *
 * @example
 * // フロントから"2025-10-07T20:30"（日本時間20:30のつもり）が送信された場合
 * parseJSTtoUTC("2025-10-07T20:30")
 * // => Date object representing 2025-10-07T11:30:00.000Z (UTC)
 * // つまり日本時間の20:30 = UTC 11:30
 */
export const parseJSTtoUTC = (datetimeLocal: string): Date => {
    if (!isValidDatetime(datetimeLocal)) {
        throw new Error(`Invalid datetime format: ${datetimeLocal}`)
    }
    return fromZonedTime(datetimeLocal, 'Asia/Tokyo')
}
