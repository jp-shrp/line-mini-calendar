import AppContentsCard from '@/components/AppContentsCard'
import ListItem from '@/components/about-icons/ListItem'

export default function FireResistance() {
    return (
        <AppContentsCard title={'収納サイズ'} isNoBorder>
            <ul>
                <ListItem
                    imagePath="s_icon_fdc1.svg"
                    description="A4 用紙が庫内に収納できる（タテ）"
                />
                <ListItem
                    imagePath="s_icon_ul60.svg"
                    description="A4 用紙が庫内に収納できる（ヨコ）"
                />
                <ListItem
                    imagePath="s_icon_ul30.svg"
                    description="B5 用紙が庫内に収納できる"
                />
                <ListItem
                    imagePath="s_icon_k1.svg"
                    description="B4 用紙が庫内に収納できる"
                />
                <ListItem
                    imagePath="s_icon_shougeki.svg"
                    description="A4 ファイルが庫内に縦置き収納できる"
                    isLast
                />
            </ul>
        </AppContentsCard>
    )
}
