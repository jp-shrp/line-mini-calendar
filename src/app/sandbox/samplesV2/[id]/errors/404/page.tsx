import { getItemWithError } from '@/actions/ItemAction'
import { notFound } from 'next/navigation'

export default async function ItemDetail404Page({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id: idParam } = await params
    const id = parseInt(idParam)

    if (isNaN(id)) {
        notFound()
    }

    await getItemWithError(id, '404')

    // 404が発生し404ページにに遷移するため空でreturn
    return
}
