import Breadcrumb from '@/components/Breadcrumb'

type NewsDetailPageProps = {
    params: { id: string }
}

export default async function NewsDetailPage({ params }: NewsDetailPageProps) {
    const { id } = await params
    console.log(id)
    const dummyContent = {
        title: '2025年6月のアップデート内容はこちら。',
        description: '新機能の詳細についてご紹介します。',
    }
    const newsTitle = dummyContent.title

    return (
        <div>
            <Breadcrumb customLabels={{ [id]: newsTitle }} />
            <h1>お知らせ詳細</h1>
            <p>{dummyContent.title}</p>
            <p>{dummyContent.description}</p>
        </div>
    )
}
