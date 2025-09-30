'use client'
import React from 'react'

type Props = {
    value: number
    onChange: (value: number) => void
    min?: number
    max?: number
}

export default function QuantitySelector({
    value,
    onChange,
    min = 1,
    max,
}: Props) {
    const handleDecrease = () => {
        if (value > min) {
            onChange(value - 1)
        }
    }

    const handleIncrease = () => {
        if (!max || value < max) {
            onChange(value + 1)
        }
    }

    const isChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const v = Number(e.target.value)
        if (Number.isInteger(v) && v >= min && (!max || v <= max)) {
            onChange(v)
        } else if (e.target.value === '') {
            onChange(min)
        }
    }

    return (
        <div className="item-center flex h-[48px] w-fit rounded-full bg-zinc-100">
            <button
                type="button"
                onClick={handleDecrease}
                disabled={value <= min}
                aria-label="マイナス"
                className="px-4 py-1 disabled:opacity-50">
                -
            </button>
            <input
                type="text"
                min={min}
                value={value}
                onChange={isChange}
                className="w-14 px-2 py-1 text-center text-lg"
                aria-label=""
                inputMode="numeric"
                pattern="[0-9]*"
            />
            <button
                type="button"
                onClick={handleIncrease}
                disabled={!!max && value >= max}
                aria-label="プラス"
                className="px-4 py-1">
                +
            </button>
        </div>
    )
}
