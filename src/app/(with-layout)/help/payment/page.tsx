import Accordion from '@/components/Accordion'
import AppContentsCard from '@/components/AppContentsCard'
import Image from 'next/image'

export default function Payment() {
    return (
        <AppContentsCard title={'お支払い方法'}>
            <Accordion title={'1.決済方法について'}>
                <div>
                    <h2 className="mb-4 text-lg">クレジットカード</h2>
                    <h3 className="headline mb-5">ご利用可能なカード</h3>
                    <Image
                        src="/images/help/img_creditcard.webp"
                        className="mb-4"
                        alt="ご利用可能なカード"
                        width={530}
                        height={32}
                    />
                    <p>
                        AMEX・JCB・UFJミリオン・VISA・MASTER・DINERS・UC・DC・NICOSがご利用になれます。
                    </p>
                    <p>※3Dセキュア未対応のカードはご使用になれません。</p>
                    <p>※デビットカードはご使用になれません。</p>
                    <div className="mt-5 mb-8 border-b border-gray-300" />
                    <h3 className="headline mb-5">ご利用可能なカード</h3>
                    <p className="mb-4">
                        納品翌月以降、各クレジットカード会社の規約に基づくお支払いとなります。
                    </p>
                    <p>
                        ※ご請求処理の期限はシステム上、ご注文日から90日とさせていただきます。
                        その為、条件によりご請求処理を行えない場合がございます。
                        それを超える期間でのクレジットカードご利用についてはお問合せください。
                    </p>
                    <div className="mt-5 mb-8 border-b border-gray-300" />
                    <h3 className="headline mb-5">お支払い回数</h3>
                    <p className="mb-4">下記表よりご確認ください。</p>
                    <table className="table-auto">
                        <tbody>
                            <tr>
                                <td className="border border-gray-400 p-2">
                                    AMEX・JCB・UFJミリオン・VISA・MASTER・UC・DC・NICOS
                                </td>
                                <td className="border border-gray-400 p-2">
                                    一括／ボーナス一括／リボ分割(2回、3回、5回、6回、10回、12回、15回、18回、20回、24回)
                                </td>
                            </tr>
                            <tr>
                                <td className="border border-gray-400 p-2">
                                    DINERS
                                </td>
                                <td className="border border-gray-400 p-2">
                                    一括／ボーナス一括／ボーナス分割／リボ
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <div className="mt-5 mb-8 border-b border-gray-300" />
                    <div className="bg-gray-200 p-2">
                        <p className="my-6 text-sm">
                            クレジットカードご利用のお客様へ
                        </p>
                        <p>
                            弊店事務処理の都合上、クレジットカード会社への売上処理が月末になる為、クレジットカード会社からのご請求が遅れることがございます。
                        </p>
                        <p>
                            各クレジットカード会社のご利用明細に記載される店名は、
                            弊店の運営会社である株式会社エーコーとなります。
                        </p>
                        <ul className="list-disc pl-5 text-sm">
                            <li>
                                当オンラインショップでは、クレジットカードに関する情報は安全を期するため、SSL方式のセキュリティで暗号化され、当オンラインショップにクレジットカードに関する情報が渡ることはありませんので安心してご利用ください。
                            </li>
                            <li>ご本人様名義のカードをご利用ください。</li>
                            <li>
                                クレジットカード情報を入力後、「ご注文を確定する」ボタンを押すと、クレジットカード会社による与信判定が行われ、承認されると「ご注文完了」となります。
                            </li>
                            <li>
                                「ご注文を確定する」ボタンを押してから与信判定が完了するまでに数十秒かかることがあります。ボタンは一度だけ押してお待ちください。
                            </li>
                            <li>
                                カード番号や有効期限の入力に誤りがあるなど、何らかの理由によりクレジットカード会社が承認を与えなかった場合には、ご注文は完了しません。（詳細な理由につきましては、お客様からご契約のクレジットカード会社に、直接お問い合わせください。）
                            </li>
                        </ul>
                    </div>
                    <div className="mt-5 mb-8 border-b border-gray-300" />
                    <h2 className="mb-4 text-lg">銀行振込</h2>
                    <h3 className="headline mb-5">お振込期日</h3>
                    <p>ご注文受付から30日間といたしております。</p>
                    <p>
                        期日を過ぎた場合、自動キャンセルとさせていただきます。
                    </p>
                    <p>
                        その際、弊社からのご連絡は差し上げておりません事、お含みおきください。
                    </p>
                    <div className="mt-5 border-b border-gray-300" />
                </div>
            </Accordion>
            <Accordion title={'2.消費税・領収書について'}>
                <div>
                    <h3 className="headline mb-5">消費税について</h3>
                    <p className="mb-4">
                        当HPの表示価格には、消費税が含まれております。
                    </p>
                    <h3 className="headline mb-5">領収書について</h3>
                    <p className="mb-4">
                        領収書については、お支払方法により異なります。詳細は下記表をご確認ください。
                    </p>
                    <table className="table-auto">
                        <tbody>
                            <tr>
                                <td className="w-50 border border-gray-400 p-2">
                                    会員登録をされた方
                                </td>
                                <td className="border border-gray-400 p-2">
                                    ご注文受付後、HP上でお客様ご自身でのダウンロードが可能でございます。
                                </td>
                            </tr>
                            <tr>
                                <td className="w-50 border border-gray-400 p-2">
                                    会員登録をされていない方
                                </td>
                                <td className="border border-gray-400 p-2">
                                    案件完了後、発行が可能となります。領収書をご希望の旨と宛名をご連絡ください。
                                </td>
                            </tr>
                            <tr>
                                <td className="w-50 border border-gray-400 p-2">
                                    その他
                                </td>
                                <td className="border border-gray-400 p-2">
                                    【当店発行の領収書をご希望の場合】
                                    <br />
                                    領収書の発行を希望されるお客様は、ご購入手続きの「その他お問い合わせ」欄に「領収書希望」と入力してください。領収書はマイページの「ご注文履歴」から、商品出荷完了後ダウンロードいただけます。
                                    <br />
                                    <br />
                                    【注意点】
                                    <br />
                                    ※宛名はご購入時に入力したお名前とさせていただきます。
                                    <br />
                                    ※宛名の変更は承っておりません。
                                    <br />
                                    ※領収書は一度の決済に対して1枚の発行となります。また、領収書の分割等は承っておりません。
                                    <br />
                                    ※製品への同梱は承っておりません。予めご了承ください。
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </Accordion>
        </AppContentsCard>
    )
}
