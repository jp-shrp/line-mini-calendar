'use client'

import { ReactNode, useState, useRef, useEffect } from 'react'

type AccordionProps = {
    title: string
    children: ReactNode
    className?: string
    defaultOpen?: boolean
}

export default function Accordion({
    title,
    children,
    className = '',
    defaultOpen,
}: AccordionProps) {
    const [isOpen, setIsOpen] = useState(defaultOpen)
    const contentRef = useRef<HTMLDivElement>(null)
    const [maxHeight, setMaxHeight] = useState('0px')

    useEffect(() => {
        if (contentRef.current) {
            if (isOpen) {
                setMaxHeight(`${contentRef.current.scrollHeight}px`)
            } else {
                setMaxHeight('0px')
            }
        }
    }, [isOpen, children])

    return (
        <div className="w-full">
            <div
                onClick={() => setIsOpen((o) => !o)}
                className="flex w-full cursor-pointer items-center justify-between py-6 text-lg md:py-7 md:text-2xl"
                style={{ borderBottom: '1px solid #e9eaeb' }}>
                <div>{title}</div>
                <div>{isOpen ? 'ー' : '＋'}</div>
            </div>

            <div
                ref={contentRef}
                className={`overflow-hidden bg-zinc-100 transition-all duration-600 ease-in-out ${className}`}
                style={maxHeight !== null ? { maxHeight } : undefined} // 初回はスタイル未適用
            >
                <div className="px-3 py-4 md:px-5 md:py-6">{children}</div>
            </div>
        </div>
    )
}
