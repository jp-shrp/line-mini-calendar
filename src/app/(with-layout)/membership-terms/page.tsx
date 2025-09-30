'use client'

import React from 'react'
import AppContainerHeader from '@/components/AppContainerHeader'
import AppMenu from '@/components/AppMenu'
import AppContents from '@/components/AppContents'

export default function MembershipTerms() {
    const menuItems = [
        { href: '/membership-terms#article1', label: '第1条（総則）' },
        { href: '/membership-terms#article2', label: '第2条（会員の定義）' },
        { href: '/membership-terms#article3', label: '第3条（会員登録）' },
        {
            href: '/membership-terms#article4',
            label: '第4条（会員に対する本サービスの提供）',
        },
        {
            href: '/membership-terms#article5',
            label: '第5条（登録内容の変更）',
        },
        {
            href: '/membership-terms#article6',
            label: '第6条（ユーザIDおよびパスワードの管理）',
        },
        {
            href: '/membership-terms#article7',
            label: '第7条（会員情報の利用・管理）',
        },
        { href: '/membership-terms#article8', label: '第8条（退会）' },
        {
            href: '/membership-terms#article9',
            label: '第9条（会員資格の喪失）',
        },
        { href: '/membership-terms#article10', label: '第10条（免責）' },
        { href: '/membership-terms#article11', label: '第11条（管轄裁判所）' },
        {
            href: '/membership-terms#article12',
            label: '第12条（適用範囲および改定）',
        },
    ]

    return (
        <div>
            <AppContainerHeader
                title={'Membership Terms'}
                subtitle={'会員規約'}
            />
            <div className="mb-12 flex flex-col gap-0 md:mb-20 md:flex-row md:gap-6">
                <AppMenu menuitems={menuItems} isSpNone />
                <AppContents>
                    <div id="article1" className="mb-6 md:mb-10">
                        <h2 className="mb-4 text-lg font-bold md:mb-5 md:text-2xl">
                            第1条（総則）
                        </h2>
                        <p className="text-sm md:text-base">
                            この会員規約（以下「本規約」といいます。）は、株式会社エーコー（以下「弊社」といいます。）が提供する一連のサービスに関し、弊社が次条の定めに従い入会を承認したお客様（以下「会員」といいます。）に対し適用されます。
                            <br />
                            本規約は、会員と弊社との間のサービスの利用に関わる一切の関係に適用されるものとします。
                            <br />
                            弊社が一連のサービスを提供するにあたり、本規約のほか、ご利用にあたってのルール等、各種の定め（以下、「個別規定」といいます。）をすることがあります。これら個別規定はその名称のいかんに関わらず、本規約の一部を構成するものとします。
                            <br />
                            本規約の定めが前項の個別規定の定めと矛盾する場合には、個別規定において特段の定めなき限り、個別規定の定めが優先されるものとします。
                        </p>
                    </div>
                    <div id="article2" className="mb-6 md:mb-10">
                        <h2 className="mb-4 text-lg font-bold md:mb-5 md:text-2xl">
                            第2条（会員の定義）
                        </h2>
                        <p className="text-sm md:text-base">
                            会員とは、本規約を承認した上で所定の手続を完了し、弊社が入会を承認したお客様を指します。
                            <br />
                            会員の資格は第三者に譲渡、承継、貸与等することは出来ません。
                        </p>
                    </div>
                    <div id="article3" className="mb-6 md:mb-10">
                        <h2 className="mb-4 text-lg font-bold md:mb-5 md:text-2xl">
                            第3条（会員登録）
                        </h2>
                        <ol className="text-sm md:text-base">
                            <li>
                                1.会員の登録は、弊社所定の情報を、インターネット上のページへの入力、または弊社が別途指定する方法に従って提出することで登録することが出来ます。
                            </li>
                            <li>
                                2.会員登録は、一人につき1アカウントのみとします。一人で2アカウント以上を登録したと弊社が合理的な理由に基づき判断した場合は、弊社は、その登録を取り消すことがあります。
                            </li>
                            <li>
                                3.前項の定めの他、弊社は、会員登録した方が以下の各号のいずれかの事由に該当する場合は、その登録を拒否し、または事前に通知することなく一旦なされた登録を取り消すことがあります。
                            </li>
                            <li>
                                （1）本規約違反により、会員登録の抹消等の処分を受けている場合。
                            </li>
                            <li>
                                （2）会員登録の申請に虚偽の事項が含まれている場合。
                            </li>
                            <li>
                                （3）商品等に関する料金等の支払遅延その他の債務不履行があった場合。
                            </li>
                            <li>
                                （4）その他、本規約または個別規定に違反した場合。
                            </li>
                            <li>
                                4.会員登録が取り消された場合においても、当該会員は、弊社とのお取引等により既に発生した支払義務等の取引上の義務および本規約上の義務の履行責任を免れないものとします。
                            </li>
                        </ol>
                    </div>
                    <div id="article4" className="mb-6 md:mb-10">
                        <h2 className="mb-4 text-lg font-bold md:mb-5 md:text-2xl">
                            第4条（会員に対する本サービスの提供）
                        </h2>
                        <ol className="text-sm md:text-base">
                            <li>
                                1.会員は、会員登録時に入力した情報等を利用し、エーコー金庫ダイレクトにおいて商品を購入することができます。
                            </li>
                            <li>
                                2.会員は、メール配信等の各種情報配信を受けられるものとします。ただし、「重要なお知らせ」の通知については、ご希望の有無にかかわらず、弊社から配信されることがあります。
                            </li>
                        </ol>
                    </div>
                    <div id="article5" className="mb-6 md:mb-10">
                        <h2 className="mb-4 text-lg font-bold md:mb-5 md:text-2xl">
                            第5条（登録内容の変更）
                        </h2>
                        <p className="text-sm md:text-base">
                            会員登録情報の内容の全部または一部に関して変更が生じた場合、会員は弊社が会員専用に設けるインターネット上のページ（以下、「マイページ」といいます。）において、
                            <br />
                            弊社が別途指定する方法により直ちに登録内容を変更するものとします。
                        </p>
                    </div>
                    <div id="article6" className="mb-6 md:mb-10">
                        <h2 className="mb-4 text-lg font-bold md:mb-5 md:text-2xl">
                            第6条（ユーザIDおよびパスワードの管理）
                        </h2>
                        <ol className="text-sm md:text-base">
                            <li>
                                1.登録されたユーザIDおよびパスワードは、会員本人のみが利用できるものとします。
                            </li>
                            <li>
                                2.会員は、ユーザIDおよびパスワードの管理について責任を負うものとし、第三者へ譲渡、承継、貸与、開示または漏洩してはならないものとします。
                            </li>
                            <li>
                                3.会員のユーザIDおよびパスワードを利用した行為については、会員の行為とみなします。
                            </li>
                            <li>
                                4.会員のユーザIDおよびパスワードの使用上の過失または第三者の不正使用等による損害について、重大な過失がない限り責任を負いません。
                            </li>
                        </ol>
                    </div>
                    <div id="article7" className="mb-6 md:mb-10">
                        <h2 className="mb-4 text-lg font-bold md:mb-5 md:text-2xl">
                            第7条（会員情報の利用・管理）
                        </h2>
                        <ol className="text-sm md:text-base">
                            <li>
                                1.弊社は、弊社の提供するサービス全般利用者の個人情報（以下、「個人情報」といいます。）について、別途弊社が定めるプライバシーポリシーに基づき、適切に取り扱うとともに必要な保護措置を行います。
                            </li>
                            <li>
                                2.弊社は、会員の登録情報、会員が弊社を利用した購入に関連する情報、及びオンラインショップのアクセス情報を、以下の目的に利用するものとします。
                            </li>
                            <li>（1）ユーザ管理、カスタマーサポート</li>
                            <li>（2）商品等の発送</li>
                            <li>
                                （3）広告、宣伝、販売の勧誘、キャンペーン等の企画
                            </li>
                            <li>
                                （4）Webマガジン、メールマガジンおよびダイレクトメール等の作成および発信、アンケートの実施
                            </li>
                            <li>（5）本サービスの提供</li>
                            <li>
                                （6）個人を特定できない状態に加工した上でのマーケティング活動
                            </li>
                            <li>
                                （7）その他弊社が提供する各種サービスに関連したコンテンツの提供
                            </li>
                            <li>
                                3.弊社は、第1項の利用目的を達成するために弊社が選定した業務委託先へ会員情報を委託する場合があります。この場合、弊社は当該委託先と秘密保持等の必要な契約を締結し、適切な管理監督を行います。
                            </li>
                            <li>
                                4.弊社は、以下の各号の場合を除き、会員の事前の同意なく、取得した会員情報を第三者に対して開示することはありません。
                            </li>
                            <li>
                                （1）統計的なデータとして、会員を識別できない状態に加工した場合。
                            </li>
                            <li>
                                （2）法令等に基づき、会員情報の共同利用もしくは第三者提供が認められる場合、または会員情報の開示・提供を求められた場合。
                            </li>
                            <li>
                                5.エーコー金庫ダイレクトでは、お客様の利便性向上、ウェブサイト改善のための閲覧状況の統計的な把握、お客様のご興味・ご関心に応じてパーソナライズされたコンテンツおよび広告の表示・配信、サービス等のご案内のために、クッキー等を使用しています。お客様がブラウザでクッキーの使用を拒否した場合、本サービスの全部または一部が使用できなくなることがあります。
                            </li>
                        </ol>
                    </div>
                    <div id="article8" className="mb-6 md:mb-10">
                        <h2 className="mb-4 text-lg font-bold md:mb-5 md:text-2xl">
                            第8条（退会）
                        </h2>
                        <p className="text-sm md:text-base">
                            会員の退会を希望する場合には、会員ご本人が弊社所定の退会手続を完了した後に、退会が完了します。
                        </p>
                        <ol className="text-sm md:text-base">
                            <li>
                                1.会員は、弊社所定の手続を経て、いつでも退会することができるものとし、かかる手続が完了した時点で会員資格を喪失するものとします。なお、会員は、会員資格を喪失した時点以降、本規約第4条に定める本サービスの特典を受けることができなくなります。
                            </li>
                            <li>
                                2.弊社は、会員の退会後も一定期間、適用法令に従い会員の情報を保持する場合があります。
                            </li>
                        </ol>
                    </div>
                    <div id="article9" className="mb-6 md:mb-10">
                        <h2 className="mb-4 text-lg font-bold md:mb-5 md:text-2xl">
                            第9条（会員資格の喪失）
                        </h2>
                        <p className="text-sm md:text-base">
                            会員が以下の項目のいずれかに該当するときは会員資格を喪失するものとします。
                        </p>
                        <ol className="text-sm md:text-base">
                            <li>
                                1.入会または変更の申込みに際し、虚偽の申告があったとき。
                            </li>
                            <li>
                                2.本規約に対する違反、またはその他の事由により、弊社が会員として不適格であると判断したとき。
                            </li>
                        </ol>
                    </div>
                    <div id="article10" className="mb-6 md:mb-10">
                        <h2 className="mb-4 text-lg font-bold md:mb-5 md:text-2xl">
                            第10条（免責）
                        </h2>
                        <p className="text-sm md:text-base">
                            弊社は、会員情報の紛失・盗難、またはその他の事由により、会員に不利益ないし損害が生じた場合であっても、一切の責任を負いません。
                        </p>
                    </div>
                    <div id="article11" className="mb-6 md:mb-10">
                        <h2 className="mb-4 text-lg font-bold md:mb-5 md:text-2xl">
                            第11条（管轄裁判所）
                        </h2>
                        <p className="text-sm md:text-base">
                            弊社および会員は、弊社と会員との間で訴訟の必要が生じた場合、当社の本社所在地を管轄する地方裁判所を第一審の専属的合意管轄裁判所とします。
                        </p>
                    </div>
                    <div id="article12">
                        <h2 className="mb-4 text-lg font-bold md:mb-5 md:text-2xl">
                            第12条（適用範囲および改定）
                        </h2>
                        <p className="text-sm md:text-base">
                            本規約は、弊社サービス全てにおいて適用されます。
                            <br />
                            本規約の変更は、エーコー金庫ダイレクト上での掲示その他当社が適当と判断する方法で行い、当該掲示後に本サービスを利用した場合は、変更後の規約に同意したものとみなします。
                            <br />
                            本規約が改定された場合、会員は改定後の規約に従うものとします。
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
