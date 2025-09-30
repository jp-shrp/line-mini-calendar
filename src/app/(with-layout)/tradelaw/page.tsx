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

export default function TradeLaw() {
    return (
        <div>
            <AppContainerHeader
                title={'Legal Notice'}
                subtitle={'特定商取引法に基づく表記'}
            />
            <div className="px-4">
                <ul className="mb-10 border-t border-gray-200 md:mb-14">
                    <ListItem title="販売業者">株式会社エーコー</ListItem>
                    <ListItem title="運営責任者">中村　慎太郎</ListItem>
                    <ListItem title="住所">
                        〒131-0043 東京都墨田区立花2-5-4
                    </ListItem>
                    <ListItem title="電話番号">0570-099-177</ListItem>
                    <ListItem title="メールアドレス">
                        <a href="mailto:customer@eiko.co.jp">
                            customer@eiko.co.jp
                        </a>
                    </ListItem>
                    <ListItem title="URL">
                        <a href="/" target="_blank">
                            https://eiko-store.com/
                        </a>
                    </ListItem>
                    <ListItem title="商品以外の必要代金">
                        全ての製品において、本体代とは別に搬入設置費/配送費のお見積りをいたします。
                    </ListItem>
                    <ListItem title="注文方法">
                        <a href="/help/process" target="_blank">
                            https://eiko-store.com/help/process
                        </a>
                    </ListItem>
                    <ListItem title="支払方法">
                        1.クレジットカード
                        <br />
                        2.銀行振込み
                    </ListItem>
                    <ListItem title="支払期限">
                        ご注文確定メール送信後、30日間を目安とします。
                        <br />
                        ご連絡が無い場合は、キャンセルといたします。
                    </ListItem>
                    <ListItem title="引渡し時期">
                        通常納期は、おおよそ7~30営業日の中で製品ごとに異なります。
                        <br />
                        正式な納期はご入金確認後に調整のうえご連絡いたします。
                    </ListItem>
                    <ListItem title="返品・交換について">
                        発送前:可能な限り対応いたします。その際は、ご連絡ください。
                        <br />
                        発送後:お客様のご都合による返品・交換・キャンセルは受け付けておりません。
                    </ListItem>
                </ul>
            </div>
        </div>
    )
}
