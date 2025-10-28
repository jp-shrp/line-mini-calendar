import { createNotFoundError } from '_shared/middlewares/middleware'
import type { UpdateEvent } from '_shared/schemas/events'
import { events } from '_shared/schemas/events'
import type { CreateEventInput } from '_shared/types/events-api-types'
import type { PaginationInfo } from '_shared/types/pagination-types'
import { db } from 'db'
import { and, eq, gte, ilike, lt, or } from 'imports'

/**
 * イベント取得のクエリパラメータ
 */
export interface GetEventsParams {
    userId: string
    startDate?: string
    endDate?: string
    category?: string
    searchQuery?: string
    pagination: PaginationInfo
}
/**
 * ユーザーのイベント一覧を取得する
 * @param params イベント取得パラメータ
 * @returns イベント一覧と総数
 */
export async function getEvents(params: GetEventsParams) {
    const { userId, startDate, endDate, category, searchQuery, pagination } =
        params
    const { limit, offset } = pagination

    // WHERE条件の構築（AND条件）
    const conditions = [eq(events.userId, userId), eq(events.isDeleted, false)]

    // 日付フィルタリング
    if (startDate && endDate) {
        // 期間指定: イベントの開始日時が指定期間内にあるもののみを取得
        // 開始日時 >= 指定期間開始 AND 開始日時 < 指定期間終了
        const requestStartDate = new Date(startDate)
        const requestEndDate = new Date(endDate)

        conditions.push(gte(events.startDatetime, requestStartDate))
        conditions.push(lt(events.startDatetime, requestEndDate))
    } else if (startDate) {
        // 開始日時のみ指定: その日時以降のイベントを取得
        const requestStartDate = new Date(startDate)
        conditions.push(gte(events.startDatetime, requestStartDate))
    } else if (endDate) {
        // 終了日時のみ指定: その日時以前のイベントを取得
        const requestEndDate = new Date(endDate)
        conditions.push(lt(events.startDatetime, requestEndDate))
    }

    // OR検索条件の構築
    const orConditions = []

    // カテゴリフィルタリング
    // 'other'の場合は検索条件に含めない（全てのカテゴリを対象とする）
    if (category && category !== 'other') {
        orConditions.push(eq(events.category, category))
    }

    // 全文検索フィルタリング（ILIKE演算子を使用した部分一致検索）
    if (searchQuery) {
        // 検索クエリをスペースで分割してキーワード配列を作成
        const keywords = searchQuery.trim().split(/\s+/)

        // 各キーワードに対してILIKE検索条件を作成（部分一致検索）
        // titleまたはdescriptionにキーワードが含まれている場合にマッチ
        const searchConditions = keywords.flatMap((keyword) => [
            ilike(events.title, `%${keyword}%`),
            ilike(events.description, `%${keyword}%`),
        ])

        // 全てのキーワード検索条件をOR結合
        orConditions.push(...searchConditions)
    }

    // OR条件がある場合は追加
    if (orConditions.length > 0) {
        conditions.push(or(...orConditions)!)
    }

    // イベント一覧取得
    const eventsList = await db.query.events.findMany({
        where: and(...conditions),
        orderBy: (events, { asc }) => asc(events.startDatetime),
        limit,
        offset,
    })

    // 総数取得
    const totalResult = await db
        .select({ count: events.id })
        .from(events)
        .where(and(...conditions))

    const total = totalResult.length

    return {
        events: eventsList,
        total,
    }
}

/**
 * イベントIDに基づいてイベント情報を取得する
 * @param eventId イベントID
 * @param userId ユーザーID（権限チェック用）
 * @returns イベント情報
 * @throws NotFoundError イベントが見つからない場合
 */
export async function getEventById(eventId: string, userId: string) {
    const event = await db.query.events.findFirst({
        where: and(
            eq(events.id, eventId),
            eq(events.userId, userId),
            eq(events.isDeleted, false)
        ),
    })

    if (!event) {
        throw createNotFoundError('指定されたイベントが見つかりません')
    }

    return event
}

/**
 * イベントを作成する
 * @param userId ユーザーID
 * @param eventData イベント作成データ
 * @returns 作成されたイベント
 */
export async function createEvent(userId: string, eventData: CreateEventInput) {
    const [newEvent] = await db
        .insert(events)
        .values({
            ...eventData,
            userId,
        })
        .returning()

    return newEvent
}

/**
 * イベントを更新する
 * @param eventId イベントID
 * @param userId ユーザーID（権限チェック用）
 * @param eventData イベント更新データ
 * @returns 更新されたイベント
 * @throws NotFoundError イベントが見つからない場合
 */
export async function updateEvent(
    eventId: string,
    userId: string,
    eventData: UpdateEvent
) {
    // イベント存在チェック
    await getEventById(eventId, userId)

    const [updatedEvent] = await db
        .update(events)
        .set({
            ...eventData,
            updatedAt: new Date(),
        })
        .where(and(eq(events.id, eventId), eq(events.userId, userId)))
        .returning()

    return updatedEvent
}

/**
 * イベントを削除する（ソフトデリート）
 * @param eventId イベントID
 * @param userId ユーザーID（権限チェック用）
 * @throws NotFoundError イベントが見つからない場合
 */
export async function deleteEvent(eventId: string, userId: string) {
    // イベント存在チェック
    await getEventById(eventId, userId)

    await db
        .update(events)
        .set({
            isDeleted: true,
            updatedAt: new Date(),
        })
        .where(and(eq(events.id, eventId), eq(events.userId, userId)))
}
