import './globals.css'
import ClientWrapper from '@/src/components/ClientWrapper'

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="ja">
            <body>
                <ClientWrapper>
                    <div>{children}</div>
                </ClientWrapper>
            </body>
        </html>
    )
}
