'use client'
import React from 'react'

export interface AppButtonProps {
    children: React.ReactNode
    variant: 'blue' | 'border' | 'black'
    icon?: React.ReactNode
    disabled?: boolean
    type?: 'button' | 'submit'
    className?: string
    onClick?: () => void
}

export default function AppButton({
    children,
    variant,
    icon,
    disabled = false,
    type = 'button',
    className = '',
    onClick,
}: AppButtonProps) {
    const baseStyle =
        'rounded-full h-[48px] md:h-[56px] text-sm md:text-base px-6 md:px-14 cursor-pointer'

    const variantStyles = {
        blue: {
            base: 'bg-blue-600 text-white',
            disabled: 'bg-gray-400',
        },
        border: {
            base: 'border border-zinc-600',
            disabled: 'bg-gray-400',
        },
        black: {
            base: 'bg-zinc-900 text-white',
            disabled: 'bg-gray-400',
        },
    }

    const iconStyle = icon ? 'flex items-center justify-center gap-6' : ''

    const buttonClasses = `
        ${baseStyle}
        ${variantStyles[variant][disabled ? 'disabled' : 'base']}
        ${iconStyle}
        ${className}
    `
        .trim()
        .replace(/\s+/g, ' ')

    return (
        <button
            type={type}
            disabled={disabled}
            className={buttonClasses}
            onClick={onClick}>
            {children}
            {icon}
        </button>
    )
}
