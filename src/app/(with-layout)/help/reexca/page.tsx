import Accordion from '@/components/Accordion'
import AppContentsCard from '@/components/AppContentsCard'

export default function Reexca() {
    return (
        <AppContentsCard title={'返品・交換・キャンセル'}>
            <Accordion title={'1.返品・交換・キャンセルについて'}>
                <div>
                    <h3 className="headline mb-5">
                        商品の破損、不良品について
                    </h3>
                    <p>
                        品質には万全を期しておりますが、万一、商品の破損・不良があった場合は、商品到着後３日以内にお電話、またはお問い合せページからご連絡ください。
                        また、恐れいりますがお届け時の梱包状態にて製品保管をお願い致します。
                        商品の破損・故障が確認できた際は、修理もしくは交換のご対応を当社費用負担にて対応させて頂きます。
                    </p>
                    <div className="mt-5 mb-8 border-b border-gray-300" />
                    <h3 className="headline mb-5">
                        発送前の内容変更・キャンセル
                    </h3>
                    <p>
                        発送前につきましては、可能な限りご対応いたしますのでご連絡ください。内容変更による差額や、キャンセルによる代金返却が発生した際は、振込手数料をお客様ご負担とさせて頂きます。
                    </p>
                    <p>
                        ご返金額より振込手数料を差し引いたものを送金致します。
                        発送後については、変更・キャンセルをお受け出来かねます事ご了承ください。
                    </p>
                    <div className="mt-5 mb-8 border-b border-gray-300" />
                    <h3 className="headline mb-5">
                        発送後の返品･交換･キャンセル
                    </h3>
                    <p>
                        商品発送後、お客様のご都合による返品･交換･キャンセルは受け付けておりません。ご了承ください。
                        金庫の外形寸法、質量、設置場所など十分にご確認の上でご注文ください。
                    </p>
                    <p>
                        エーコー金庫ダイレクトの通信販売は、クリーングオフ制度の対象となりません。ご了承ください。
                    </p>
                    <div className="mt-5 mb-8 border-b border-gray-300" />
                    <h3 className="headline mb-5">お客様の不在、荷受け拒否</h3>
                    <h4 className="mb-1 font-bold">109㎏までの製品の場合</h4>
                    <p>
                        　指定納品日にお客様がご不在の場合は基本的に「不在票」をお入れしますので、お客様より配達業者へ、直接再配達日をご連絡ください。但し、再配達時にもご不在の場合は持ち帰り運賃をご請求いたします。ご対応が確実な納品日をご連絡ください。
                    </p>
                    <h4 className="mt-4 mb-1 font-bold">
                        110㎏以上の製品の場合
                    </h4>
                    <p>
                        　指定納品日の荷受け拒否、お客様不在の場合は、持ち帰り運賃をご請求いたします。確実な納品日をご連絡ください。
                    </p>
                </div>
            </Accordion>
        </AppContentsCard>
    )
}
