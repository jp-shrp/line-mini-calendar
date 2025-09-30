'use client'
import { useForm } from 'react-hook-form'
import { useLoading } from '@/contexts/LoadingContext'
import FormField from '@/components/FormField'
import { useRouter } from 'next/navigation'
import { useGoogleLogin } from '@react-oauth/google'
import {
    useAuthSetter,
    register,
    registerGoogle,
    RegisterFormData,
    GoogleFormData,
} from '@/actions/authAction'
import { validationRules } from '@/app/utils/validationRules'

export default function Register() {
    const { setLoading } = useLoading()
    const { setAuth } = useAuthSetter()
    const router = useRouter()

    const form = useForm<RegisterFormData>({
        defaultValues: {
            email: '',
            password: '',
            password_confirmation: '',
            isConsent: false,
        },
    })

    const formGoogle = useForm<GoogleFormData>({
        defaultValues: {
            access_token: '',
        },
    })

    const handleSubmit = async () => {
        await register(form, {
            setLoading: setLoading,
            onSuccess: (data) => {
                const tokenParam = data.token ? `?token=${data.token}` : ''
                router.push(`/register/complete${tokenParam}`)
            },
            onError: (error) => {
                form.setError('root', {
                    type: 'server',
                    message: error,
                })
                console.error('登録エラー:', error)
            },
        })
    }

    const registerFromGoogle = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            const accessToken = tokenResponse.access_token
            formGoogle.setValue('access_token', accessToken)
            await registerGoogle(formGoogle, {
                setLoading: setLoading,
                onSuccess: (data) => {
                    setAuth(data)
                    router.push('/mypage/edit')
                },
                onError: (error) => {
                    form.setError('root', {
                        type: 'server',
                        message: error,
                    })
                    console.error('登録エラー:', error)
                },
            })
        },
        onError: () => {
            alert('Googleログインに失敗しました。')
        },
    })

    return (
        <div className="flex flex-col md:flex-row">
            <div className="flex w-full flex-col justify-center px-6 py-12 md:w-1/2">
                <h1 className="mb-6 text-2xl font-bold">新規会員登録</h1>

                <div className="mb-4">
                    <button
                        onClick={() => registerFromGoogle()}
                        className="rounded border border-gray-300 bg-white px-4 py-2 text-black hover:bg-gray-100">
                        Googleで登録
                    </button>
                </div>

                <div className="mb-4 text-center text-sm text-gray-500">
                    または
                </div>

                <form
                    onSubmit={form.handleSubmit(handleSubmit)}
                    className="space-y-4">
                    <FormField
                        id="email"
                        type="email"
                        placeholder="メールアドレス"
                        register={form.register(
                            'email',
                            validationRules.required('メールアドレス')
                        )}
                        error={form.formState.errors.email}
                    />

                    <FormField
                        id="password"
                        type="password"
                        placeholder="パスワード"
                        register={form.register(
                            'password',
                            validationRules.required('パスワード')
                        )}
                        error={form.formState.errors.password}
                    />

                    <FormField
                        id="password_confirmation"
                        type="password"
                        placeholder="パスワード再確認"
                        register={form.register(
                            'password_confirmation',
                            validationRules.required('パスワード再確認')
                        )}
                        error={form.formState.errors.password_confirmation}
                    />

                    <div className="flex items-center">
                        <FormField
                            id="isConsent"
                            type="checkbox"
                            register={form.register('isConsent')}
                        />
                        <div className="pl-4">
                            <a
                                href="/terms"
                                className="text-blue-600 underline"
                                target="_blank">
                                利用規約
                            </a>
                            に同意する
                        </div>
                    </div>
                    {form.formState.errors.isConsent && (
                        <p className="mt-1 flex items-center text-sm text-red-600">
                            チェックは必須です。
                        </p>
                    )}

                    {form.formState.errors.root && (
                        <div className="rounded border border-red-400 bg-red-100 p-3 text-red-700">
                            {form.formState.errors.root.message}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full rounded-md bg-black py-2 text-white hover:opacity-90 md:w-1/2">
                        登録
                    </button>
                </form>
            </div>

            <div className="w-full justify-center px-6 py-12 md:flex md:w-1/2 md:flex-col md:border-l">
                <h2 className="mb-8 text-xl font-semibold">
                    既存のアカウントを使用
                </h2>
                <div className="mb-4 text-sm">
                    既にアカウントをお持ちの場合は、
                    <br />
                    以下のボタンからログインしてください。
                </div>

                <button
                    onClick={() => router.push('/login')}
                    className="w-full rounded-md bg-black px-6 py-2 text-center text-white md:w-1/2">
                    ログインへ
                </button>
            </div>
        </div>
    )
}
