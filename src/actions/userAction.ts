import {
    createDataFetchAction,
    ActionOptions,
    useApiActions,
} from '@/lib/safe-api-actions'
import { UseFormReturn } from 'react-hook-form'

type UsersResponse = { id: string; name: string }[]

export type UserFormData = {
    family_name: string
    first_name: string
    family_name_kana: string
    first_name_kana: string
    company_name: string
    gender: string
    post_code: string
    pref: string
    city: string
    town: string
    building: string
    tel: string
    fax: string
    email: string
    email_confirmation: string
    password: string
    password_confirmation: string
    year: string
    month: string
    day: string
    occupation: string
    birthday: string
}

export const getUsers = async (options: ActionOptions = {}) => {
    const result = await createDataFetchAction<UsersResponse>(
        `/api/api-test/users`,
        options
    )()
    return result.data
}

export const getList = async (options: ActionOptions = {}) => {
    const result = await createDataFetchAction<UsersResponse>(
        `/api/users`,
        options
    )()
    return result.data
}

export const getProfileEditData = async (options: ActionOptions = {}) => {
    const result = await createDataFetchAction(
        `/api/my-page/profile/edit-data`,
        options
    )()
    return result.data
}

export const updateUser = async (
    form: UseFormReturn<UserFormData>,
    options: ActionOptions = {}
) => {
    const formData = form.getValues()
    const { createPatchAction } = useApiActions(form, {
        ...options,
    })
    const result = await createPatchAction(`/api/my-page/user`)(formData)
    return result.data
}
