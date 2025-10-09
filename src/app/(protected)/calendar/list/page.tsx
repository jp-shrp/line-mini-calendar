import EventListClient from './components/EventListClient'

/**
 * イベント一覧ページ（SSR）
 * @description
 * SSRファーストのアプローチで実装
 * 動的な処理（React Query、ステート管理等）はEventListClientコンポーネントに分離
 */
export default async function EventListPage() {
    return <EventListClient />
}
