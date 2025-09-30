import React from 'react'

interface WithLayoutMaxPrps {
    children: React.ReactNode
}

export default function WithLayoutMax({ children }: WithLayoutMaxPrps) {
    return (
        <div className="-mt-4 -mb-4 ml-[calc(-50vw+50%)] w-screen max-w-none">
            {children}
        </div>
    )
}
