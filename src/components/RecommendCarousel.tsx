'use client'

import React from 'react'
import ProductCard from '@/components/ProductCard'
import AppContainerHeader from './AppContainerHeader'
import { ProductCardData } from '@/models/Product'
import ScrollButtons from './ScrollButtons'
import ScrollCardContents from './ScrollCardContents'
import useHorizontalScroll from '@/hooks/useHorizontalScroll'
import FullWidth from '@/components/FullWidth'

interface RecommendCarouselProps {
    cards: ProductCardData[]
}

export default function RecommendCarousel({ cards }: RecommendCarouselProps) {
    const scroll = useHorizontalScroll()

    return (
        <div className="mt-14 mb-14 md:mb-24">
            <div className="mb-6 flex items-center justify-between md:mb-8">
                <AppContainerHeader
                    title="Recommendation"
                    subtitle="おすすめ"
                    showBreadcrumb={false}
                />
                <ScrollButtons
                    className="mt-22"
                    onLeft={scroll.scrollLeft}
                    onRight={scroll.scrollRight}
                />
            </div>
            <FullWidth>
                <ScrollCardContents ref={scroll.scrollRef}>
                    {cards.map((card, idx) => (
                        <ProductCard
                            key={idx}
                            data={card}
                            showDescription={false}
                            showPrice={false}
                        />
                    ))}
                </ScrollCardContents>
            </FullWidth>
        </div>
    )
}
