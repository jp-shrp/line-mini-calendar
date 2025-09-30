export const WEIGHT_DISPLAY_THRESHOLD = 101
export const WEIGHT_TITLE = '質量'

export function getProductWeight(productInfo: any[]): number {
    const weightInfo = productInfo.find((info) => info.title === WEIGHT_TITLE)
    if (!weightInfo) return 0
    return parseInt(weightInfo.description)
}

export function isHeavyWeight(weight: number): boolean {
    return weight >= WEIGHT_DISPLAY_THRESHOLD
}

export function isProductHeavy(productInfo: any[]): boolean {
    const weight = getProductWeight(productInfo)
    return isHeavyWeight(weight)
}
