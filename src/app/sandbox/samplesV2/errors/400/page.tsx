import { getItemsWithError } from '@/actions/ItemAction'

export default async function Error400Page() {
    await getItemsWithError('400', 5, 0)

    // 400が発生しsrc/app/sandbox/samplesV2/error.tsxに遷移するため空でreturn
    return
}
