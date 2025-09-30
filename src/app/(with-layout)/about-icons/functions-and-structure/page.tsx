import AppContentsCard from '@/components/AppContentsCard'
import ListItem from '@/components/about-icons/ListItem'

export default function FireResistance() {
    return (
        <AppContentsCard title={'機能・構造'} isNoBorder>
            <ul>
                <ListItem
                    imagePath="s_icon_fdc1.svg"
                    description="解錠履歴システム搭載"
                />
                <ListItem
                    imagePath="s_icon_fdc1.svg"
                    description="標準床固定構造"
                />
                <ListItem
                    imagePath="s_icon_fdc1.svg"
                    description="ドリル破壊対策のシリンダー錠"
                />
                <ListItem
                    imagePath="s_icon_fdc1.svg"
                    description="衝撃や振動を感知する警報装置を搭載"
                />
                <ListItem
                    imagePath="s_icon_fdc1.svg"
                    description="日本語音声案内"
                    isLast
                />
            </ul>
        </AppContentsCard>
    )
}
