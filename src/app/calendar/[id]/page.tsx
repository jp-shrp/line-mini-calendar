import EventDetailClient from './components/EventDetailClient'

/**
 * イベント詳細ページ（SSR）
 *
 * @description
 * イベント詳細を表示するページコンポーネント
 * SSRファーストアプローチに従い、動的処理はClientコンポーネントに委譲
 */
export default async function EventDetailPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params

    return <EventDetailClient eventId={id} />
}
