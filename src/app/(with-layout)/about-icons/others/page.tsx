import AppContentsCard from '@/components/AppContentsCard'
import ListItem from '@/components/about-icons/ListItem'

export default function FireResistance() {
    return (
        <AppContentsCard title={'その他'} isNoBorder>
            <ul>
                <ListItem
                    imagePath="s_icon_jis.svg"
                    description="JIS認証製品"
                    wideIcon
                />
                <ListItem
                    imagePath="s_icon_ul30.svg"
                    description="ショールーム展示品"
                />
                <ListItem
                    imagePath="s_icon_k1.svg"
                    description="500円OFF割引券の対象商品"
                />
                <ListItem
                    imagePath="s_icon_shougeki.svg"
                    description="10％OFF割引券の対象商品"
                    isLast
                />
            </ul>
        </AppContentsCard>
    )
}
