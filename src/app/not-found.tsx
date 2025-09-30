'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'

export default function GlobalNotFound() {
    const router = useRouter()
    const pathname = usePathname()

    useEffect(() => {
        if (pathname !== '/404') {
            router.push('/404')
        }
    }, [pathname, router])
    return null
}
