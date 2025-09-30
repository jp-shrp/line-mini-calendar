import { createDataFetchAction, ActionOptions } from '@/lib/safe-api-actions'
import { SubCategory } from '../../model/SubCategory'

export const getSubCategories = async (options: ActionOptions = {}) => {
    const result = await createDataFetchAction<SubCategory[]>(
        `/api/sub-category/list`,
        options
    )()
    return result.data
}
