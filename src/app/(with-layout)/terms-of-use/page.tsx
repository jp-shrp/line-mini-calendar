'use client'

import React from 'react'
import AppContainerHeader from '@/components/AppContainerHeader'
import AppMenu from '@/components/AppMenu'
import AppContents from '@/components/AppContents'

export default function Terms() {
    const menuItems = [
        { href: '/terms-of-use#article1', label: '第1条（定義）' },
        {
            href: '/terms-of-use#article2',
            label: '第2条（規約の範囲および変更）',
        },
        {
            href: '/terms-of-use#article3',
            label: '第3条（利用者の地位および禁止事項）',
        },
        {
            href: '/terms-of-use#article4',
            label: '第4条（本サービスの中断・停止）',
        },
        { href: '/terms-of-use#article5', label: '第5条（リンクについて）' },
        { href: '/terms-of-use#article6', label: '第6条（非保証・免責）' },
        { href: '/terms-of-use#article7', label: '第7条（著作権）' },
        {
            href: '/terms-of-use#article8',
            label: '第8条（会員資格の喪失および賠償責任）',
        },
        {
            href: '/terms-of-use#article9',
            label: '第9条（第三者サービスの利用）',
        },
        {
            href: '/terms-of-use#article10',
            label: '第10条（プライバシーポリシー）',
        },
        { href: '/terms-of-use#article11', label: '第11条（準拠法）' },
        { href: '/terms-of-use#article12', label: '第12条（合意管轄）' },
    ]

    return (
        <div>
            <AppContainerHeader
                title={'Terms of use'}
                subtitle={'ご利用にあたって'}
            />
            <div className="mb-12 flex flex-col gap-0 md:mb-20 md:flex-row md:gap-6">
                <AppMenu menuitems={menuItems} isSpNone />
                <AppContents>
                    <p className="mb-6 text-sm md:mb-10 md:text-base">
                        株式会社エーコー（以下「当社」といいます。）が運営する「エーコー金庫ダイレクト」のご利用にあたっては、事前に下記のご利用規約（以下「本規約」といいます。）をご一読いただき、内容にご同意いただいた場合にのみご利用ください。
                        ご同意いただけない場合は、本サービスのご利用をお控えください。
                        なお、ご利用いただいた時点で、本規約のすべての条件に同意されたものとみなします。
                        当社は、必要と判断した場合、利用者の承諾なく本規約を変更できるものとします。変更後の内容は「エーコー金庫ダイレクト」上に掲載された時点から効力を生じるものとし、掲載後に本サービスを利用された場合、変更後の規約に同意したものとみなします。
                    </p>
                    <div id="article1" className="mb-6 md:mb-10">
                        <h2 className="mb-4 text-lg font-bold md:mb-5 md:text-2xl">
                            第1条（定義）
                        </h2>
                        <p className="text-sm md:text-base">
                            本規約において、以下の各号に定める用語は、それぞれ次の意味を有するものとします。
                        </p>
                        <ol className="text-sm md:text-base">
                            <li>
                                1.「エーコー金庫ダイレクト」とは、当社が本規約に基づきインターネット上で運営する、商品またはサービスの提供情報を掲載し、オンラインでの取引機能を備えたサイトをいいます。
                            </li>
                            <li>
                                2.「利用者」とは、エーコー金庫ダイレクトにアクセスするすべての者をいいます。
                            </li>
                            <li>
                                3.「本サービス」とは、当社が本規約に基づき利用者に提供するサービスをいい、その内容および種類は当社の判断により随時変更・追加・削除されることがあり、必要に応じて本サイト上で告知するものとします。
                            </li>
                        </ol>
                    </div>
                    <div id="article2" className="mb-6 md:mb-10">
                        <h2 className="mb-4 text-lg font-bold md:mb-5 md:text-2xl">
                            第2条（規約の範囲および変更）
                        </h2>
                        <ol className="text-sm md:text-base">
                            <li>
                                1.本規約は、本サービスの利用に関して、当社および利用者に適用されるものとし、利用者は本規約を誠実に遵守するものとします。
                            </li>
                            <li>
                                2.当社が別途掲示または通知する個別規定および追加規定は、本規約の一部を構成するものとします。これらの規定と本規約が異なる場合は、個別規定および追加規定が優先されるものとします。
                            </li>
                            <li>
                                3.当社は、利用者の承諾を得ることなく、本規約を変更することができるものとします。変更後の本規約は、当サイトへの掲載、当社が適当と認める方法により通知された時点から効力を生じるものとします。
                            </li>
                            <li>
                                4.規約変更によって利用者に不利益または損害が生じた場合でも、当社に故意または重過失がある場合を除き、当社は一切責任を負いません。
                            </li>
                        </ol>
                    </div>
                    <div id="article3" className="mb-6 md:mb-10">
                        <h2 className="mb-4 text-lg font-bold md:mb-5 md:text-2xl">
                            第3条（利用者の地位および禁止事項）
                        </h2>
                        <ol className="text-sm md:text-base">
                            <li>
                                1.利用者の地位
                                <br />
                                利用者は、エーコー金庫ダイレクトを利用（閲覧を含む）した時点で、本規約に同意し、利用者としての地位を得るものとします。
                            </li>
                            <li>
                                2.禁止事項
                                <br />
                                利用者は、以下の行為を行ってはなりません。
                            </li>
                            <li>
                                （1）当社が定めた方法以外での本サービスの利用
                            </li>
                            <li>
                                （2）本規約、本サービスに関連するその他の規約、ルール及びガイドライン等に違反する行為
                            </li>
                            <li>
                                （3）他人になりすましての本サービスの利用（会員登録のなりすましや多重アカウントの取得が判明した場合、利用停止となる場合があります）
                            </li>
                            <li>
                                （4）当社が認めていない方法による本サービスのデータのリンク・再利用
                            </li>
                            <li>
                                （5）不正アクセスやデータ破壊の行為、またはその恐れのある行為
                            </li>
                            <li>（6）サービス運営の妨害行為</li>
                            <li>
                                （7）営業・営利目的の利用（当社が承認した場合を除く）
                            </li>
                            <li>
                                （8）他の利用者の個人情報の収集、蓄積、またはその試み
                            </li>
                            <li>
                                （9）法律に反する行為、脅迫、暴力、公序良俗違反などの不当な行為
                            </li>
                            <li>
                                （10）代金支払い義務の放棄や返品乱用など、合理的な理由のないキャンセルまたは返品の繰り返し
                            </li>
                            <li>
                                （11）当社または第三者の権利・利益・名誉などを損なう行為
                            </li>
                            <li>
                                （12）事実に反する情報又は事実に反するおそれのある情報を提供する行為
                            </li>
                            <li>
                                （13）当社が提供するソフトウェア等に対するリバースエンジニアリングその他の解析行為
                            </li>
                            <li>（14）虚偽の登録情報を入力する行為</li>
                            <li>
                                （15）その他当社が不適当と合理的根拠に基づき合理的に判断する行為
                            </li>
                        </ol>
                    </div>
                    <div id="article4" className="mb-6 md:mb-10">
                        <h2 className="mb-4 text-lg font-bold md:mb-5 md:text-2xl">
                            第4条（本サービスの中断・停止）
                        </h2>
                        <ol className="text-sm md:text-base">
                            <li>
                                1.当社は、以下のいずれかの理由により、利用者への事前通知なしに本サービスの一部または全部を中断・停止することがあります。
                            </li>
                            <li>
                                （1）システムの保守、点検、更新を定期的または緊急に行う場合
                            </li>
                            <li>
                                （2）火災、停電、自然災害などの不可抗力によりサービス提供が困難な場合
                            </li>
                            <li>
                                （3）通信事業者のサービス提供が停止された場合
                            </li>
                            <li>
                                （4）その他、運用上・技術上または不測の事態により、当社がサービス提供の継続を困難と判断した場合
                            </li>
                            <li>
                                （5）法令または公的機関による要請によりサービス提供が困難な場合
                            </li>
                            <li>
                                2.上記により利用者または第三者に損害が生じた場合でも、当社に故意または重過失がある場合を除き、当社は一切責任を負いません。
                            </li>
                        </ol>
                    </div>
                    <div id="article5" className="mb-6 md:mb-10">
                        <h2 className="mb-4 text-lg font-bold md:mb-5 md:text-2xl">
                            第5条（リンクについて）
                        </h2>
                        <p className="text-sm md:text-base">
                            当サイトから他のウェブサイトへのリンク、または第三者によるリンクが提供されている場合でも、当社は当該サイトに関して一切の責任を負いません。リンク先サイト上のコンテンツ、広告、商品、サービス等に起因または関連して生じた損害についても、当社は責任を負わないものとします。また、当社はリンク先サイトのサービスの完全性、正確性、適法性、安全性、最新性、その他いかなる保証も行いません。
                        </p>
                    </div>
                    <div id="article6" className="mb-6 md:mb-10">
                        <h2 className="mb-4 text-lg font-bold md:mb-5 md:text-2xl">
                            第6条（非保証・免責）
                        </h2>
                        <ol className="text-sm md:text-base">
                            <li>
                                1.
                                当社は、利用者に対して、以下の各号の事項について、一切の保証をしません。
                            </li>
                            <li>
                                （1）本サービスの内容について、その完全性、正確性及び有効性等
                            </li>
                            <li>
                                （2）本サービスに中断、中止その他の障害が生じないこと
                            </li>
                            <li>
                                2.
                                当社は、以下の各号の損害について、当社の故意又は過失がある場合を除き、責任を負いません。
                            </li>
                            <li>
                                （1）予期しない不正アクセス等の行為により利用者に生じた損害
                            </li>
                            <li>
                                （2）本サービスの利用に関連して利用者が日本又は外国の法令に違反したことにより利用者に生じた損害
                            </li>
                            <li>
                                （3）本サービスの利用に関し、利用者が第三者との間でトラブル（本サービス内外を問いません。）になった場合、利用者に生じた損害
                            </li>
                            <li>
                                3.
                                当社は、天災、地変、火災、ストライキ、通商停止、戦争、内乱、疫病・感染症の流行その他の不可抗力により本契約の全部又は一部に不履行が発生した場合における利用者に生じた損害又は不利益について責任を負いません。
                            </li>
                        </ol>
                    </div>
                    <div id="article7" className="mb-6 md:mb-10">
                        <h2 className="mb-4 text-lg font-bold md:mb-5 md:text-2xl">
                            第7条（著作権）
                        </h2>
                        <ol className="text-sm md:text-base">
                            <li>
                                1.当サイトを通じて提供される情報（文章、画像、動画等）について、著作権法に定める私的使用の範囲を除き、権利者の事前の許可なく、複製、転載、頒布等することを禁止します。
                            </li>
                            <li>
                                2.第三者に対して同様の情報を許可なく使用・公開させる行為も禁止します。
                            </li>
                            <li>
                                3.利用者が本条に違反して問題が発生した場合、自己の責任と費用負担において解決し、当社に損害や迷惑を与えないものとします。
                            </li>
                        </ol>
                    </div>
                    <div id="article8" className="mb-6 md:mb-10">
                        <h2 className="mb-4 text-lg font-bold md:mb-5 md:text-2xl">
                            第8条（会員資格の喪失および賠償責任）
                        </h2>
                        <ol className="text-sm md:text-base">
                            <li>
                                1.本サービスに関連する提供停止、仕様変更、データの消失・漏洩等によって利用者または第三者に損害が発生しても、当社に故意または重過失がある場合を除き、当社は一切責任を負いません。ただし、個人情報の取扱いについては、当社のプライバシーポリシーに準じ、個人情報保護法その他関係法令に従って管理します。
                            </li>
                            <li>
                                2.利用者が第三者に損害を与えた場合は、自己の責任と費用で対応し、当社に損害を与えないものとします。また、規約違反や不正・違法行為により当社に損害が生じた場合、当社は当該利用者に対し損害賠償を請求できるものとします。
                            </li>
                            <li>
                                3.第3条第2項に違反した場合、その他当社が不適当と判断した場合には、会員資格を取消し、または取引をお断りすることがあります。
                            </li>
                            <li>
                                4.当社が利用者に対して負う損害賠償責任は、直接かつ現実に発生した通常の損害に限られ、間接損害、特別損害、逸失利益、その他の付随的損害については一切責任を負いません。
                            </li>
                        </ol>
                    </div>
                    <div id="article9" className="mb-6 md:mb-10">
                        <h2 className="mb-4 text-lg font-bold md:mb-5 md:text-2xl">
                            第9条（第三者サービスの利用）
                        </h2>
                        <ol className="text-sm md:text-base">
                            <li>
                                1.利用者は、本サービスを利用するにあたり、第三者の提供するサービス（以下「第三者サービス」といいます。）を利用する場合、本規約に加えて、当該第三者サービスの利用規約、その他規約等を遵守するものとします。。
                            </li>
                            <li>
                                2.当社は、利用者が本サービスを利用するにあたり、第三者サービスを利用したことにより生じた損害について、当社の故意又は過失がある場合を除き、責任を負いません。
                            </li>
                        </ol>
                    </div>
                    <div id="article10" className="mb-6 md:mb-10">
                        <h2 className="mb-4 text-lg font-bold md:mb-5 md:text-2xl">
                            第10条（プライバシーポリシー）
                        </h2>
                        <p className="text-sm md:text-base">
                            当社が取得した利用者情報の管理・取扱いは、別途定めるプライバシーポリシーに従い、適切に対応します。
                        </p>
                    </div>
                    <div id="article11" className="mb-6 md:mb-10">
                        <h2 className="mb-4 text-lg font-bold md:mb-5 md:text-2xl">
                            第11条（準拠法）
                        </h2>
                        <p className="text-sm md:text-base">
                            本規約の成立、効力、履行および解釈には、日本法を適用します。
                        </p>
                    </div>
                    <div id="article12">
                        <h2 className="mb-4 text-lg font-bold md:mb-5 md:text-2xl">
                            第12条（合意管轄）
                        </h2>
                        <p className="text-sm md:text-base">
                            本規約に関して紛争が生じた場合、当社の本社所在地を管轄する地方裁判所を第一審の専属的合意管轄裁判所とします。
                            <br />
                            <br />
                            <br />
                            以上
                        </p>
                    </div>
                </AppContents>
            </div>
        </div>
    )
}
