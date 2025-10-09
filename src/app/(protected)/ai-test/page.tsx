/**
 * AIテストページ
 * Phase 2: AI機能実装のテストページ
 */
import { AITestClient } from './components/AITestClient'

export const metadata = {
    title: 'AI機能テスト | LINEミニカレンダー',
    description: 'Gemini APIを使用したAI検索・登録機能のテストページ',
}

export default async function AITestPage() {
    return <AITestClient />
}
