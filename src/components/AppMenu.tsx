'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'

type MenuItem = {
    href: string
    label: string
}

type AppMenuProps = {
    menuitems: MenuItem[]
    pathname?: string
    isSpNone?: boolean
}
export default function AppMenu({
    menuitems,
    pathname,
    isSpNone,
}: AppMenuProps) {
    const [activePath, setActivePath] = useState(pathname || '')
    const menus = menuitems

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setActivePath(window.location.pathname + window.location.hash)
        }
    }, [])

    const handleClick = (href: string) => {
        setActivePath(href)
    }

    return (
        <div className="px-4 md:px-0">
            <div
                className={`w-full rounded-2xl bg-white px-4 py-5 md:w-[288px] md:px-6 md:py-10 ${isSpNone ? 'hidden md:block' : ''} `}
                style={{ height: 'fit-content' }}>
                <nav>
                    <ul className="list-none p-0">
                        {menus.map((menu, index) => (
                            <li
                                key={menu.href}
                                className={
                                    index === menus.length - 1
                                        ? 'mb-0'
                                        : 'mb-6 md:mb-8'
                                }>
                                <Link
                                    href={menu.href}
                                    onClick={() => handleClick(menu.href)}
                                    className={`text-sm md:text-base ${
                                        activePath === menu.href
                                            ? 'font-bold text-black'
                                            : 'text-zinc-400'
                                    } `}>
                                    {menu.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>
        </div>
    )
}
