import AppContainerHeader from '@/components/AppContainerHeader'
import React from 'react'

type ListItemProps = {
    title: string
    children: React.ReactNode
}

const ListItem = ({ title, children }: ListItemProps) => (
    <li className="flex flex-col gap-3 border-b border-gray-200 py-7 md:flex-row md:py-9">
        <div className="w-[188px] text-zinc-500">{title}</div>
        <div className="min-w-0 flex-1">{children}</div>
    </li>
)

export default function About() {
    return (
        <div>
            <AppContainerHeader title={'Company'} subtitle={'会社情報'} />
            <div className="px-4">
                <ul className="mb-10 border-t border-gray-200 md:mb-14">
                    <ListItem title="店名">エーコー金庫ダイレクト</ListItem>
                    <ListItem title="会社名">株式会社エーコー</ListItem>
                    <ListItem title="所在地">
                        〒131-0043 東京都墨田区立花2-5-4
                    </ListItem>
                    <ListItem title="電話番号">0570-099-177</ListItem>
                    <ListItem title="メールアドレス">
                        <a href="mailto:customer@eiko.co.jp">
                            customer@eiko.co.jp
                        </a>
                    </ListItem>
                    <ListItem title="営業時間">
                        9:00-17:00(土・日・祝日・カレンダー定休日を除く)
                    </ListItem>
                    <ListItem title="取扱商品">
                        防盗金庫、大型耐火金庫、小型耐火金庫、組立式耐火室、投入式耐火金庫、データセーフ、耐火キャビネット、インテリアデザイン金庫、貴重品ロッカー
                    </ListItem>
                </ul>
                <div className="mb-12 h-[423px] w-full md:mb-20 md:h-[558px]">
                    <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d6479.341648563485!2d139.82408708737123!3d35.709717257715965!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x601888cc9c29591b%3A0x93654f7c5115a1c2!2z5qCq5byP5Lya56S-44Ko44O844Kz44O8!5e0!3m2!1sja!2sjp!4v1753263052535!5m2!1sja!2sjp"
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"></iframe>
                </div>
            </div>
        </div>
    )
}
