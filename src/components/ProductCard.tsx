'use client'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { ProductCardData } from '@/models/Product'

export interface ProductCardProps {
    data: ProductCardData
    className?: string
    showLead?: boolean
    showDescription?: boolean
    showPrice?: boolean
}

const productCardBgClass =
    'bg-white flex flex-col items-center w-max pt-8 pb-9 px-6 md:pt-14 md:pb-15 md:px-10 rounded-[16px] md:rounded-[20px] min-w-[320px] max-w-[320px] md:min-w-[480px] md:max-w-[480px]'

export default function ProductCard({
    data,
    className = '',
    showLead = true,
    showDescription = true,
    showPrice = true,
}: ProductCardProps) {
    const { imageSrc, imageAlt, lead, title, description, price, linkUrl } =
        data

    return (
        <Link
            href={linkUrl}
            className={`mr-5 h-full last:pr-[14px] md:mr-10 md:last:pr-10 ${className}`}>
            <div className={`${productCardBgClass} flex h-full flex-col`}>
                <Image
                    src={imageSrc}
                    alt={imageAlt || title}
                    width={260}
                    height={260}
                    className="mb-8 h-[180px] w-[180px] md:mb-11 md:h-[260px] md:w-[260px]"
                />
                <div className="text-center text-sm text-zinc-950">
                    {showLead && (
                        <span className="text-xs text-zinc-600">{lead}</span>
                    )}
                    <div className="text-bold mt-2 text-xl md:text-2xl">
                        {title}
                    </div>
                    <div className="flex justify-center gap-2 p-2">
                        {(data.performanceIcons ?? []).map((icon) => (
                            <Image
                                key={icon.id}
                                src={`${process.env.NEXT_PUBLIC_API_URL}${icon.image_path}`}
                                alt={icon.name}
                                width={48}
                                height={48}
                            />
                        ))}
                    </div>
                    {showDescription && (
                        <p className="pt-4 pb-5 text-xs md:pt-5 md:pb-6 md:text-sm">
                            {description}
                        </p>
                    )}
                    {showPrice && (
                        <div className="text-base">
                            <span className="pr-1 text-xs">¥</span>
                            {price}
                            （税込
                            {data.isShippingIncluded && <span>、送料込み</span>}
                            ）
                        </div>
                    )}
                </div>
            </div>
        </Link>
    )
}
