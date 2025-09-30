'use client'
import { useForm } from 'react-hook-form'
import { useLoading } from '@/contexts/LoadingContext'
import FormField from '@/components/FormField'
import { useRouter } from 'next/navigation'
import { reset } from '@/actions/authAction'
import { useState } from 'react'
import { validationRules } from '@/app/utils/validationRules'

export default function Reset() {
    const { setLoading } = useLoading()
    const router = useRouter()
    const [isSend, setIsSend] = useState(false)

    const form = useForm<{ email?: string }>({
        defaultValues: {
            email: '',
        },
    })

    const resetFormWithSendFlag = (isSend: boolean) => {
        form.reset()
        setIsSend(isSend)
    }

    const handleSubmit = async () => {
        await reset(form, {
            setLoading: setLoading,
            onSuccess: () => {
                resetFormWithSendFlag(true)
            },
            onError: () => {
                resetFormWithSendFlag(true)
            },
        })
    }

    return (
        <div className="flex flex-col md:flex-row">
            <div className="flex w-full flex-col justify-center px-6 py-12 md:w-1/2">
                <h1 className="mb-6 text-2xl font-bold">パスワード再発行</h1>

                {isSend && (
                    <>
                        <p className="mb-4 text-sm font-bold text-black">
                            パスワードの再発行メールの送信が完了しました。
                        </p>
                        <p className="mb-4 text-sm">
                            ご登録メールアドレスにパスワードを左発行するためのメールを送信いたしました。
                            <br />
                            メールの内容をご確認いただけますよう、お願い致します。
                        </p>
                        <p className="mb-6 text-xs text-gray-500">
                            ※メールが届かない場合は「戻る」ボタンよりメールアドレスをご確認の上、再度お試しください。
                        </p>

                        <button
                            type="button"
                            className="w-full rounded-md bg-black py-2 text-white hover:opacity-90 md:w-1/2"
                            onClick={() => {
                                resetFormWithSendFlag(false)
                            }}>
                            戻る
                        </button>
                    </>
                )}

                {!isSend && (
                    <>
                        <p className="mb-6 text-sm">
                            ご登録時のメールアドレスを入力して「次へ」ボタンをクリックしてください。
                        </p>
                        <div className="mb-6 text-xs text-gray-500">
                            ※新しくパスワードを発行いたしますので、お忘れになったパスワードはご利用出来なくなります。
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

                            {form.formState.errors.root && (
                                <div className="rounded border border-red-400 bg-red-100 p-3 text-red-700">
                                    {form.formState.errors.root.message}
                                </div>
                            )}

                            <button
                                type="submit"
                                className="w-full rounded-md bg-black py-2 text-white hover:opacity-90 md:w-1/2">
                                次へ
                            </button>
                        </form>
                    </>
                )}
            </div>

            <div className="w-full justify-center px-6 py-12 md:flex md:w-1/2 md:flex-col md:border-l">
                <h2 className="mb-8 text-xl font-semibold">新規会員登録</h2>
                <div className="mb-4 text-sm text-gray-600">
                    続行して新規アカウントを発行する
                </div>

                <button
                    onClick={() => router.push('/register')}
                    className="w-full rounded-md bg-black px-6 py-2 text-center text-white md:w-1/2">
                    新規会員登録
                </button>
            </div>
        </div>
    )
}
