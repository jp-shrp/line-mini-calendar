'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useAuthSetter } from '@/actions/authAction'

export default function RegisterVerifiedPage() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const status = searchParams.get('status')
    const token = searchParams.get('token')
    const user = searchParams.get('user')
    const [isError, setIsError] = useState(false)
    const [mounted, setMounted] = useState(false)
    const { setAuth } = useAuthSetter()

    useEffect(() => {
        if (status === 'success' && token && user) {
            const data = {
                token: token,
                user: JSON.parse(user),
            }
            setAuth(data)
            router.push('/mypage/edit')
            return
        }

        setMounted(true)
        if (status === 'error') {
            setIsError(true)
        } else {
            router.push('/')
        }
    }, [status, token, router])

    if (isError) {
        return (
            <div className="flex flex-col md:flex-row">
                <div className="flex w-full flex-col justify-center px-6 py-12 md:w-1/2">
                    <p className="mb-4 text-sm">
                        リンクが無効か期限切れです。
                        <br />
                        ログイン後認証メールを再送するを押下し再度お試しください。
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

    if (!mounted) {
        return (
            <div className="flex flex-col md:flex-row">
                <div className="flex w-full flex-col justify-center px-6 py-12 md:w-1/2">
                    <p>
                        メールアドレス認証中...
                        <br />
                        しばらくお待ちください。
                    </p>
                </div>
            </div>
        )
    }
}
