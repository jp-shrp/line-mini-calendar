import {
    createDataFetchAction,
    ActionOptions,
    useApiActions,
} from '@/lib/safe-api-actions'
import { UseFormReturn } from 'react-hook-form'
import { IProductResponse } from '@/models/Product'
import { IPaginate } from '@/models/entities/Paginate'

export type FavoriteFormData = {
    product_id: number
}

type IFavoriteFetchResponse = {
    data: IPaginate<IProductResponse>
}

export const changeFavorite = async (
    form: UseFormReturn<FavoriteFormData>,
    options: ActionOptions = {}
) => {
    const formData = form.getValues()
    const { createPatchAction } = useApiActions(form, {
        ...options,
    })
    const result = await createPatchAction(`/api/favorite`)(formData)
    return result.data
}

export const getFavoriteItems = async (options: ActionOptions = {}) => {
    const result = await createDataFetchAction<IFavoriteFetchResponse>(
        `/api/favorite`,
        options
    )()
    return result.data
}
