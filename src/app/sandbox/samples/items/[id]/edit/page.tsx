import { Suspense } from 'react'
import { ItemEditClient } from './components/ItemEditClient'

interface ItemEditPageProps {
    params: Promise<{
        id: string
    }>
}

export default async function ItemEditPage({ params }: ItemEditPageProps) {
    const { id } = await params

    return (
        <div className="container mx-auto px-4 py-8">
            <Suspense
                fallback={<div className="text-center">読み込み中...</div>}>
                <ItemEditClient id={id} />
            </Suspense>
        </div>
    )
}
