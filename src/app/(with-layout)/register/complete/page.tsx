'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { resend } from '@/actions/authAction'
import { useLoading } from '@/contexts/LoadingContext'
import { useForm } from 'react-hook-form'

export default function Complete() {
    const searchParams = useSearchParams()
    const token = searchParams.get('token')
    const hasRun = useRef(false)

    const router = useRouter()
    const { setLoading } = useLoading()
    const form = useForm<{ token?: string }>({
        defaultValues: {
            token: '',
        },
    })

    useEffect(() => {
        if (token && !hasRun.current) {
            hasRun.current = true
            form.setValue('token', token)
            const send = async () => {
                await resend(form, {
                    setLoading: setLoading,
                    onSuccess: () => {},
                    onError: (error) => {
                        form.setError('root', {
                            type: 'server',
                            message: error,
                        })
                        console.error('送信エラー:', error)
                    },
                })
            }
            send()
        }
    }, [token])

    return (
        <div className="flex flex-col md:flex-row">
            <div className="flex w-full flex-col justify-center px-6 py-12 md:w-1/2">
                <h2 className="mb-8 text-xl font-semibold">
                    仮登録の手続き完了
                </h2>
                <p className="mb-4 text-sm font-bold text-black">
                    ※現在は仮登録の状態です。
                </p>
                <p className="mb-1 text-sm">
                    ご登録メールアドレスに本会員登録を完了させる為のURLを送信いたしました。
                </p>
                <p className="mb-6 text-sm">
                    メールの内容をご確認いただけますよう、お願い致します。
                </p>
                <p className="text-xs text-gray-500">
                    ※メールが届かない場合はメールアドレスをご確認の上、再度お試しください。
                </p>
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
