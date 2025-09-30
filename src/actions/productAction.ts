import { createDataFetchAction, ActionOptions } from '@/lib/safe-api-actions'

export const getSearchProducts = async (
    data: URLSearchParams,
    options: ActionOptions = {}
) => {
    const result = await createDataFetchAction(
        `/api/product/custom-search?${data}`,
        options
    )()
    return result.data
}

export const getSearchFields = async (options: ActionOptions = {}) => {
    const result = await createDataFetchAction(
        `/api/product/search-fields`,
        options
    )()
    return result.data
}
