import AppContentsCard from '@/components/AppContentsCard'
import ListItem from '@/components/about-icons/ListItem'

export default function FireResistance() {
    return (
        <AppContentsCard title={'盗難性能'} isNoBorder>
            <ul>
                <ListItem
                    imagePath="s_icon_f120.svg"
                    description="耐溶断・耐工具30分防盗試験合格品（TRTL-30）"
                />
                <ListItem
                    imagePath="s_icon_f120.svg"
                    description="耐工具30分防盗試験合格品（TL-30）"
                />
                <ListItem
                    imagePath="s_icon_f120.svg"
                    description="耐破壊性能試験合格品（TS-15）（扉のこじ開け15分）"
                />
            </ul>
        </AppContentsCard>
    )
}
