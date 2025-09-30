import Header from '../../components/Header'
import Footer from '../../components/Footer'
import ClientWrapper from '@/components/ClientWrapper'
import '../globals.css'
import { getLockSystemTypes } from '@/actions/lockSystemTypeAction'
import { getSubCategories } from '@/actions/subCategoryAction'
import { GoogleOAuthProvider } from '@react-oauth/google'

const supports = [
    { name: 'ご購入の手順', path: '/help/process' },
    { name: 'お支払い方法', path: '/help/payment' },
    { name: '送料・お届けについて', path: '/help/postage' },
    { name: '返品・交換・キャンセル', path: '/help/reexca' },
    { name: '納品方法について', path: '/help/delivery' },
    { name: '修理・アフターサポート', path: '/help/repair' },
    { name: '製品不都合のよくある質問', path: '/help/faq' },
]

const quotations = [
    { name: '金庫のお見積り', path: '/' },
    { name: '据付設置/固定工事', path: '/' },
    { name: '修理', path: '/' },
    {
        name: 'スペアキー作成 / ダイヤル番号・暗証番号照会 / FLカード初期化',
        path: '/',
    },
]

export default async function Layout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    const locks = await getLockSystemTypes()
    const subCategories = await getSubCategories()

    return (
        <html lang="ja">
            <body>
                <GoogleOAuthProvider
                    clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
                    <ClientWrapper>
                        <Header
                            locks={locks ?? []}
                            subCategories={subCategories ?? []}
                            supports={supports}
                            quotations={quotations}
                        />
                        <main className="bg-gray-50">
                            <div className="container m-auto py-4">
                                {children}
                            </div>
                        </main>
                        <Footer
                            locks={locks ?? []}
                            subCategories={subCategories ?? []}
                            supports={supports}
                            quotations={quotations}
                        />
                    </ClientWrapper>
                </GoogleOAuthProvider>
            </body>
        </html>
    )
}
