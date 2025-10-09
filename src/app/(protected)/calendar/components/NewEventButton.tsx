'use client'

import type { FC } from 'react'
import { useRouter } from 'next/navigation'

/**
 * 新規イベント登録ボタンコンポーネント
 * @description
 * クリック時に/calendar/newページに遷移します
 */
const NewEventButton: FC = () => {
    const router = useRouter()

    const handleClick = () => {
        router.push('/calendar/new')
    }

    return (
        <div className="flex justify-center pt-4">
            <button
                onClick={handleClick}
                className="w-full rounded-full bg-pink-500 py-4 text-center font-medium text-white shadow-lg transition-colors hover:bg-pink-600">
                新規登録
            </button>
        </div>
    )
}

export default NewEventButton
