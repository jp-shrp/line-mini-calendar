import EventEditClient from './components/EventEditClient'

/**
 * イベント編集ページ（SSR）
 *
 * @description
 * イベント編集画面を表示するページコンポーネント
 * SSRファーストアプローチに従い、動的処理はClientコンポーネントに委譲
 */
export default async function EventEditPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params

    return <EventEditClient eventId={id} />
}
