import { useRef, useState, useEffect, useCallback } from 'react'

const MOBILE_SCROLL_AMOUNT = 340
const DESKTOP_SCROLL_AMOUNT = 520
const MOBILE_BREAKPOINT = 768

export default function useHorizontalScroll() {
    const scrollRef = useRef<HTMLDivElement>(null)

    const getScrollAmount = () => {
        if (typeof window === 'undefined') {
            return DESKTOP_SCROLL_AMOUNT
        }

        return window.innerWidth < MOBILE_BREAKPOINT
            ? MOBILE_SCROLL_AMOUNT
            : DESKTOP_SCROLL_AMOUNT
    }

    const [scrollAmount, setScrollAmount] = useState<number>(
        DESKTOP_SCROLL_AMOUNT
    )

    useEffect(() => {
        setScrollAmount(getScrollAmount())

        const handleResize = () => {
            setScrollAmount(getScrollAmount())
        }

        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    const scroll = useCallback(
        (direction: 'left' | 'right') => {
            if (scrollRef.current) {
                scrollRef.current.scrollBy({
                    left: direction === 'left' ? -scrollAmount : scrollAmount,
                    behavior: 'smooth',
                })
            }
        },
        [scrollAmount]
    )

    const scrollLeft = useCallback(() => {
        scroll('left')
    }, [scroll])

    const scrollRight = useCallback(() => {
        scroll('right')
    }, [scroll])

    return { scrollRef, scroll, scrollLeft, scrollRight, scrollAmount }
}
