import AppContentsCard from '@/components/AppContentsCard'
import ListItem from '@/components/about-icons/ListItem'

export default function FireResistance() {
    return (
        <AppContentsCard title={'納期'} isNoBorder>
            <ul>
                <ListItem imagePath="s_icon_k1.svg" description="受注生産品" />
                <ListItem
                    imagePath="s_icon_jis.svg"
                    description="納期のご確認が必要になる製品"
                    isLast
                    wideIcon
                />
            </ul>
        </AppContentsCard>
    )
}
