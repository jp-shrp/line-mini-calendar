import { useState, useRef, useCallback } from 'react'

const SWIPE_THRESHOLD = 50

interface ImageSliderProps {
    images: string[]
    initialIndex?: number
}

export default function useImageSlider({
    images,
    initialIndex = 0,
}: ImageSliderProps) {
    const [currentIndex, setCurrentIndex] = useState(initialIndex)
    const [isDragging, setIsDragging] = useState(false)
    const [startX, setStartX] = useState(0)
    const [translateX, setTranslateX] = useState(0)
    const containerRef = useRef<HTMLDivElement>(null)

    const goToIndex = useCallback(
        (index: number) => {
            if (index >= 0 && index < images.length) {
                setCurrentIndex(index)
                setTranslateX(0)
            }
        },
        [images.length]
    )

    const goToNext = useCallback(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length)
        setTranslateX(0)
    }, [images.length])

    const goToPrev = useCallback(() => {
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
        setTranslateX(0)
    }, [images.length])

    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        setIsDragging(true)
        setStartX(e.touches[0].clientX)
        setTranslateX(0)
    }, [])

    const handleTouchMove = useCallback(
        (e: React.TouchEvent) => {
            if (!isDragging) return

            const currentX = e.touches[0].clientX
            const diff = currentX - startX
            setTranslateX(diff)
        },
        [isDragging, startX]
    )

    const handleTouchEnd = useCallback(() => {
        if (!isDragging) return

        setIsDragging(false)

        if (Math.abs(translateX) > SWIPE_THRESHOLD) {
            if (translateX > 0) {
                goToPrev()
            } else {
                goToNext()
            }
        } else {
            setTranslateX(0)
        }
    }, [isDragging, translateX])

    return {
        currentIndex,
        currentImage: images[currentIndex] || images[0] || '',
        isDragging,
        translateX,
        containerRef,
        goToIndex,
        goToNext,
        goToPrev,
        handleTouchStart,
        handleTouchMove,
        handleTouchEnd,
        totalImages: images.length,
    }
}
