'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ReactNode } from 'react'

type CommonButtonProps = {
    type?: 'button' | 'submit' | 'reset'
    label?: string
    iconSrc?: string
    onClick?: () => void
    to?: string // router.push先
    children?: ReactNode
    className?: string
    variant?: 'primary' | 'secondary' | 'outline' | 'icon' | 'modal' | 'default'
    fullWidth?: boolean
}

export default function BaseButton({
    type = 'button',
    label,
    iconSrc,
    onClick,
    to,
    children,
    className = '',
    variant = 'default',
    fullWidth = true,
}: CommonButtonProps) {
    const router = useRouter()

    const handleClick = () => {
        if (onClick) onClick()
        if (to) router.push(to)
    }

    const baseStyle = `
    rounded-full text-center flex items-center justify-center
    ${fullWidth ? 'w-full' : ''}
  `

    const variantStyle = {
        primary: 'bg-blue-600 text-white h-[54px]',
        secondary: 'text-zinc-600 border border-zinc-600 h-[54px]',
        outline: 'border border-zinc-600 text-zinc-600 h-[48px]',
        icon: '',
        modal: 'mb-4',
        default: '',
    }

    return (
        <button
            type={type}
            onClick={handleClick}
            className={`${baseStyle} ${variantStyle[variant]} ${className}`}>
            {iconSrc ? (
                <Image
                    src={iconSrc}
                    alt={label || 'アイコン'}
                    width={24}
                    height={24}
                />
            ) : (
                label || children
            )}
        </button>
    )
}
