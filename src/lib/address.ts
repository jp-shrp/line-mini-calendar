export type ZipCloudResult = {
    pref: string
    city: string
    town: string
}

export async function fetchAddressByZipcode(
    zipcode: string
): Promise<ZipCloudResult | null> {
    const postCode = zipcode.replace(/-/g, '').trim()
    if (postCode.length !== 7) {
        return null
    }

    try {
        const res = await fetch(
            `https://zipcloud.ibsnet.co.jp/api/search?zipcode=${postCode}`
        )
        const data = await res.json()
        if (data.status === 200 && data.results && data.results.length > 0) {
            const result = data.results[0]
            return {
                pref: result.address1 || '',
                city: result.address2 || '',
                town: result.address3 || '',
            }
        } else {
            return null
        }
    } catch {
        return null
    }
}
