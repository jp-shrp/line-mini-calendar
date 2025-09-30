import Accordion from '@/components/Accordion'
import AppContentsCard from '@/components/AppContentsCard'

export default function Postage() {
    return (
        <AppContentsCard title={'送料・お届けについて'}>
            <Accordion title={'1.小型金庫の場合'}>
                <div>
                    <h2 className="mb-4 text-lg">設置配送</h2>
                    <h3 className="headline mb-5">
                        機種/配送場所によって費用が異なります。
                    </h3>
                    <h4 className="mb-1 font-bold">
                        「小型金庫/貴重品保管庫/ロッカー」
                    </h4>
                    <p>
                        製品ごとに、全国一律の配送設置費を設けております。一部、配送不可地域や表記価格は配送設置費込みのものでございます。
                    </p>
                    <p>軒先渡しご希望の場合も、金額に変更はございません。</p>
                    <p>
                        配送専門の業者が配達を行う為、商品に関する説明や質問はお受けいたしかねます。
                    </p>
                    <p>あらかじめご了承ください。</p>
                    <p>発送エリアは日本国内のみでございます。</p>
                    <p className="mt-4 ml-4">
                        ※一部、配送不可地域や軒先渡しのみのご対応地域がございます。以下よりご確認ください。
                    </p>
                    <p className="mb-4">（配送不可地域リスト）</p>
                    <h3 className="mb-1 font-bold">「業務用金庫」</h3>
                    <p>搬入条件(段差の有無など)により費用が異なります。</p>
                    <p>開梱や梱包材の処理を配達員が作業いたします。</p>
                    <p>
                        配送専門の業者が配達を行う為、商品に関する説明や質問はお受けいたしかねます。
                    </p>
                    <p>あらかじめご了承ください。</p>
                    <p>発送エリアは日本国内のみでございます。</p>
                    <h3 className="headline my-5">配達日について</h3>
                    <ul className="list-disc pl-5">
                        <li>
                            ご入金後に配送日時の調整を行います。 <br />
                            事前にご対応不可なお日にち等がございましたら、ご注文時にメッセージ欄にてお伝えください。
                        </li>
                        <li>
                            配送日につきましては、原則として平日の日中にて設定させていただきます。
                        </li>
                        <li>
                            荷受け拒否や
                            <a href={'/help/reexca'} className="text-red-500">
                                キャンセル
                            </a>
                            、配送先変更および事前にご連絡のない不在による再配送は、別途費用が発生する場合がございます。
                        </li>
                    </ul>
                </div>
            </Accordion>
            <Accordion title={'2.大型金庫の場合'}>
                <div></div>
            </Accordion>
        </AppContentsCard>
    )
}
