import { apiClient } from '@/lib/universal-api-client'
import {
    ICreateItem,
    IItem,
    IItemResponse,
    IUpdateItem,
    Item,
} from '@/models/samples/Item'
import { notFound } from 'next/navigation'

export const getItems = async (): Promise<IItemResponse[]> => {
    const response = await apiClient.get<IItemResponse[]>(`/api/items`, {
        fallbackData: [],
        customErrorMessage: 'アイテムの取得に失敗しました',
    })

    return response
}
export const getItemsWithLimit = async (
    limit?: number,
    offset?: number
): Promise<IItemResponse[]> => {
    const params = new URLSearchParams()
    if (limit !== undefined) params.append('limit', limit.toString())
    if (offset !== undefined) params.append('offset', offset.toString())

    const response = await apiClient.get<IItemResponse[]>(
        `/api/items?${params.toString()}`,
        {
            fallbackData: [],
            customErrorMessage: 'アイテムの取得に失敗しました',
        }
    )

    return response
}

export const getItemsWithError = async (
    errorType: '400' | '500',
    limit?: number,
    offset?: number
): Promise<IItemResponse[]> => {
    const params = new URLSearchParams()
    if (limit !== undefined) params.append('limit', limit.toString())
    if (offset !== undefined) params.append('offset', offset.toString())
    params.append('error', errorType)

    const response = await apiClient.get<IItemResponse[]>(
        `/api/items?${params.toString()}`,
        {
            fallbackData: [],
            customErrorMessage: 'アイテムの取得に失敗しました',
        }
    )

    return response
}

export const getItemWithError = async (
    id: number,
    errorType: '400' | '404' | '422' | '500'
): Promise<IItemResponse | null> => {
    const response = await apiClient.get<IItemResponse>(
        `/api/items/${id}?error=${errorType}`,
        {
            fallbackData: null,
            on404: () => {
                notFound()
            },
            customErrorMessage: 'アイテムの取得に失敗しました',
        }
    )
    return response
}

export const getItem = async (id: number): Promise<IItemResponse | null> => {
    const response = await apiClient.get<IItemResponse>(`/api/items/${id}`, {
        fallbackData: null,
        on404: () => {
            notFound()
        },
        customErrorMessage: 'アイテムの取得に失敗しました',
    })
    return response
}

export const createItem = async (item: ICreateItem): Promise<IItem | null> => {
    const response = await apiClient.post<IItemResponse>(`/api/items`, item, {
        fallbackData: null,
        customErrorMessage: 'アイテムの作成に失敗しました',
    })

    // レスポンスがnullの場合はそのまま返す
    if (!response) return null

    // snake_caseのレスポンスをalcts Itemモデルに変換
    return new Item(response)
}

export const updateItem = async (
    item: IUpdateItem
): Promise<IItemResponse | null> => {
    const response = await apiClient.put<IItemResponse>(
        `/api/items/${item.id}`,
        item,
        {
            fallbackData: null,
            customErrorMessage: 'アイテムの更新に失敗しました',
        }
    )

    return response
}

export const deleteItem = async (id: number): Promise<void | null> => {
    return await apiClient.delete<void>(`/api/items/${id}`, {
        fallbackData: null,
        customErrorMessage: 'アイテムの削除に失敗しました',
    })
}
