import Link from 'next/link'

export default function News() {
    return (
        <div>
            <h1>お知らせ</h1>
            <p>
                <Link href="/news/1">お知らせ1</Link>
            </p>
            <p>
                <Link href="/news/2">お知らせ2</Link>
            </p>
        </div>
    )
}
