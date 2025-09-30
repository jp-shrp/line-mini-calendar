import {
    ActionOptions,
    useApiActions,
    createDataFetchAction,
} from '@/lib/safe-api-actions'
import { useAtom } from 'jotai'
import { userAtom } from '../../model/User'
import Cookies from 'js-cookie'
import { UseFormReturn } from 'react-hook-form'

export type RegisterFormData = {
    email: string
    password: string
    password_confirmation: string
    isConsent: boolean
}

export type GoogleFormData = {
    access_token: string
}

export type LoginFormData = {
    email: string
    password: string
}

export const useAuthSetter = () => {
    const [, setUser] = useAtom(userAtom)
    const setAuth = (data: { token: string; user: string }) => {
        Cookies.set('auth_token', data.token)
        setUser(data.user)
    }
    return { setAuth }
}

export const register = async (
    form: UseFormReturn<RegisterFormData>,
    options: ActionOptions = {}
) => {
    const formData = form.getValues()
    const { createPostAction } = useApiActions(form, {
        ...options,
    })
    const result = await createPostAction(`/api/register`)(formData)
    return result.data
}

export const registerGoogle = async (
    form: UseFormReturn<GoogleFormData>,
    options: ActionOptions = {}
) => {
    const formData = form.getValues()
    const { createPostAction } = useApiActions(form, {
        ...options,
    })
    const result = await createPostAction(`/api/register-google`)(formData)
    return result.data
}

export const login = async (
    form: UseFormReturn<LoginFormData>,
    options: ActionOptions = {}
) => {
    const formData = form.getValues()
    const { createPostAction } = useApiActions(form, {
        ...options,
    })
    const result = await createPostAction(`/api/login`)(formData)
    return result.data
}

export const loginGoogle = async (
    form: UseFormReturn<GoogleFormData>,
    options: ActionOptions = {}
) => {
    const formData = form.getValues()
    const { createPostAction } = useApiActions(form, {
        ...options,
    })
    const result = await createPostAction(`/api/login-google`)(formData)
    return result.data
}

export const resend = async (
    form: UseFormReturn,
    options: ActionOptions = {}
) => {
    const formData = form.getValues()
    const { createPostAction } = useApiActions(form, {
        ...options,
    })
    const result = await createPostAction(`/api/email/resend`)(formData)
    return result.data
}

export const reset = async (
    form: UseFormReturn,
    options: ActionOptions = {}
) => {
    const formData = form.getValues()
    const { createPostAction } = useApiActions(form, {
        ...options,
    })
    const result = await createPostAction(`/api/password/reset`)(formData)
    return result.data
}

export const getAuthUser = async (options: ActionOptions = {}) => {
    const result = await createDataFetchAction(`/api/auth-user`, options)()
    return result.data
}
