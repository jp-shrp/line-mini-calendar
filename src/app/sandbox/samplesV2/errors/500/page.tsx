import { getItemsWithError } from '@/actions/ItemAction'

export default async function Error500Page() {
    await getItemsWithError('500', 5, 0)

    // 500が発生しsrc/app/sandbox/samplesV2/error.tsxに遷移するため空でreturn
    return
}
