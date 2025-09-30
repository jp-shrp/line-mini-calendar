import { createDataFetchAction, ActionOptions } from '@/lib/safe-api-actions'
import { LockSystemType } from '../../model/LockSystemType'

export const getLockSystemTypes = async (options: ActionOptions = {}) => {
    const result = await createDataFetchAction<LockSystemType[]>(
        `/api/lock-system-type/list`,
        options
    )()
    return result.data
}
