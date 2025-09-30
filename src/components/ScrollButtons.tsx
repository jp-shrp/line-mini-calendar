'use client'
import React from 'react'

interface ScrollButtonsProps {
    onLeft: () => void
    onRight: () => void
    className?: string
}

const roundedBtnClass =
    'hidden md:flex items-center justify-center w-16 h-16 rounded-full border-1 border-zinc-600 cursor-pointer'

export default function ScrollButtons({
    onLeft,
    onRight,
    className = '',
}: ScrollButtonsProps) {
    return (
        <div className={`flex gap-6 ${className}`}>
            <button
                onClick={onLeft}
                className={roundedBtnClass}
                aria-label="左へ"
                type="button">
                <img src="/images/icon/arrow-left.svg" alt="左へ" />
            </button>
            <button
                onClick={onRight}
                className={roundedBtnClass}
                aria-label="右へ"
                type="button">
                <img src="/images/icon/arrow-right.svg" alt="右へ" />
            </button>
        </div>
    )
}
