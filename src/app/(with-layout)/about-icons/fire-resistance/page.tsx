import AppContentsCard from '@/components/AppContentsCard'
import ListItem from '@/components/about-icons/ListItem'

export default function FireResistance() {
    return (
        <AppContentsCard title={'耐火性能'} isNoBorder>
            <ul>
                <ListItem
                    imagePath="s_icon_f120.svg"
                    description="一般紙用2時間耐火性能試験合格品"
                />
                <ListItem
                    imagePath="s_icon_f60.svg"
                    description="一般紙用1時間耐火性能試験合格品"
                />
                <ListItem
                    imagePath="s_icon_f30.svg"
                    description="一般紙用30分耐火性能試験合格品"
                />
                <ListItem
                    imagePath="s_icon_fdc1.svg"
                    description="フレキシブルコンピュータディスク用1時間耐火性能試験合格品"
                />
                <ListItem
                    imagePath="s_icon_ul60.svg"
                    description="UL（米国安全規格）認証1時間耐火性能試験合格品"
                />
                <ListItem
                    imagePath="s_icon_ul30.svg"
                    description="UL（米国安全規格）認証30分耐火性能試験合格品"
                />
                <ListItem
                    imagePath="s_icon_k1.svg"
                    description="韓国産業標準規格1時間耐火性能試験合格品"
                />
                <ListItem
                    imagePath="s_icon_shougeki.svg"
                    description="急加熱・衝撃落下併用試験合格品"
                    isLast
                />
            </ul>
        </AppContentsCard>
    )
}
