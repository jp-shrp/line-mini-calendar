'use client'

export const BackButton = () => {
    return (
        <button
            onClick={() => window.history.back()}
            className="text-indigo-600 hover:text-indigo-500">
            ← 戻る
        </button>
    )
}
