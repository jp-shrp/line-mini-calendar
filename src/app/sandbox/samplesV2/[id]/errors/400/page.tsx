import { getItemWithError } from '@/actions/ItemAction'

export default async function ItemDetail400Page({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id: idParam } = await params
    const id = parseInt(idParam)

    await getItemWithError(id, '400')

    // 400が発生しsrc/app/sandbox/samplesV2/error.tsxに遷移するため空でreturn
    return
}
