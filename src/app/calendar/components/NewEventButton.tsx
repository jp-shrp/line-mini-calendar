import type { FC } from 'react'

const NewEventButton: FC = () => {
    const handleClick = () => {
        // 新規登録処理（今後実装）
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
