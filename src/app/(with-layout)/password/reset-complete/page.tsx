'use client'

import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function ResetComplete() {
    const searchParams = useSearchParams()
    const status = searchParams.get('status')
    const router = useRouter()
    const [isError, setIsError] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setIsError(status !== 'success')
        setMounted(true)
    }, [status])

    if (isError) {
        return (
            <>
                <div className="flex flex-col md:flex-row">
                    <div className="flex w-full flex-col justify-center px-6 py-12 md:w-1/2">
                        <p className="mb-4 text-sm">
                            リンクが無効か期限切れです。
                            <br />
                            パスワード再発行より再度お試しください。
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
            </>
        )
    }

    if (!mounted) {
        return (
            <>
                <div className="flex flex-col md:flex-row">
                    <div className="flex w-full flex-col justify-center px-6 py-12 md:w-1/2">
                        <p>
                            パスワード変更中...
                            <br />
                            しばらくお待ちください。
                        </p>
                    </div>
                </div>
            </>
        )
    }

    return (
        <div className="flex flex-col md:flex-row">
            <div className="flex w-full flex-col justify-center px-6 py-12 md:w-1/2">
                <h2 className="mb-8 text-xl font-semibold">
                    パスワード変更完了
                </h2>
                <p className="mb-4 text-sm font-bold text-black">
                    新しいパスワードが送信されました。
                </p>
                <p className="text-sm">
                    新しいパスワードをお送り致しましたので、メールをご確認ください。
                    <br />
                    今後ともご愛顧賜りますようよろしくお願い申し上げます。
                </p>

                <button
                    onClick={() => router.push('/login')}
                    className="mt-6 w-full rounded-md bg-black px-6 py-2 text-center text-white md:w-1/2">
                    ログイン画面へ
                </button>
            </div>

            <div className="w-full justify-center px-6 py-12 md:flex md:w-1/2 md:flex-col md:border-l">
                <h2 className="mb-8 text-xl font-semibold">新規会員登録</h2>
                <div className="mb-4 text-sm">
                    続行して新規アカウントを作成する。
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
