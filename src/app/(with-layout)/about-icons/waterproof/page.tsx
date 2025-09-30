import AppContentsCard from '@/components/AppContentsCard'
import ListItem from '@/components/about-icons/ListItem'

export default function FireResistance() {
    return (
        <AppContentsCard title={'防水性能'} isNoBorder>
            <ul>
                <ListItem
                    imagePath="s_icon_shougeki.svg"
                    description="水深20cm / 8時間防水性能"
                    isLast
                />
            </ul>
        </AppContentsCard>
    )
}
