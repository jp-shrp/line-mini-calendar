import React from 'react'
import Link from 'next/link'
import { NewsData } from '@/models/News'

export default function NewsCard({ date, content, link }: NewsData) {
    const cardContent = (
        <div className="border-t border-zinc-300 pt-8 pb-9 last:border-b md:border-y md:pt-12 md:pb-13">
            <time className="text-sm text-zinc-500">{date}</time>
            <p className="mt-4 mb-8 text-sm md:mb-12 md:text-base">{content}</p>
            {link && (
                <img
                    src="/images/icon/arrow-right.svg"
                    alt="詳細を見る"
                    className="ml-auto"
                />
            )}
        </div>
    )

    return link ? <Link href={link}>{cardContent}</Link> : cardContent
}
