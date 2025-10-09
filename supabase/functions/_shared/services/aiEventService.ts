/**
 * AIイベントサービス
 * Gemini APIを使用してイベントの検索・登録をAIで支援
 */

import {
    generateJSON,
    generateJSONWithWebSearch,
} from '_shared/services/geminiService'
import { getEvents } from '_shared/services/eventService'
import { getPaginationInfo } from '_shared/paginationUtility'
import type {
    AIEventCandidate,
    AISearchResponse,
    AIRegisterResponse,
} from '_shared/types/ai-api-types'

/**
 * 検索パラメータの解析結果
 */
interface SearchParams {
    startDate?: string
    endDate?: string
    category?: string
    keywords?: string[]
}

/**
 * AI検索: 自然言語クエリからイベントを検索
 */
export async function aiSearchEvents(
    userId: string,
    query: string
): Promise<AISearchResponse> {
    // Step 1: Gemini APIでクエリを解析
    const systemInstruction = `
あなたはカレンダーアプリのAIアシスタントです。
ユーザーの自然言語クエリを解析し、イベント検索のパラメータを抽出してください。

対応するカテゴリ:
- プレミアリーグ (premier_league)
- セリエA (serie_a)
- ラ・リーガ (la_liga)
- ブンデスリーガ (bundesliga)
- WBC (wbc)
- Netflix (netflix)
- その他 (other)

日付キーワード:
- 今日、明日、今週、来週、今月、来月など

以下のJSON形式で応答してください:
{
  "startDate": "YYYY-MM-DD形式の開始日（省略可）",
  "endDate": "YYYY-MM-DD形式の終了日（省略可）",
  "category": "カテゴリID（省略可）",
  "keywords": ["検索キーワード配列"],
  "userFriendlyMessage": "ユーザーへの応答メッセージ"
}
`

    const prompt = `ユーザークエリ: "${query}"\n\n今日の日付: ${new Date().toISOString().split('T')[0]}`

    interface AISearchParams extends SearchParams {
        userFriendlyMessage: string
    }

    const aiParams = await generateJSON<AISearchParams>(
        prompt,
        systemInstruction
    )

    // Step 2: 抽出されたパラメータでDBを検索
    const { events } = await getEvents({
        userId,
        startDate: aiParams.startDate,
        endDate: aiParams.endDate,
        category: aiParams.category,
        pagination: getPaginationInfo({ currentPage: 1, limit: 50 }),
    })

    // Step 3: キーワードフィルタリング（オプション）
    let filteredEvents = events
    if (aiParams.keywords && aiParams.keywords.length > 0) {
        filteredEvents = events.filter((event) => {
            const searchText =
                `${event.title} ${event.description || ''}`.toLowerCase()
            return aiParams.keywords!.some((keyword) =>
                searchText.includes(keyword.toLowerCase())
            )
        })
    }

    // Step 4: レスポンス生成
    return {
        events: filteredEvents,
        total: filteredEvents.length,
        aiMessage: aiParams.userFriendlyMessage,
        searchParams: {
            startDate: aiParams.startDate,
            endDate: aiParams.endDate,
            category: aiParams.category,
            keywords: aiParams.keywords,
        },
    }
}

/**
 * AI登録: 自然言語クエリからイベント登録候補を生成
 * Web検索を使用してリアルタイムのイベント情報を取得
 */
export async function aiGenerateEventCandidates(
    query: string
): Promise<AIRegisterResponse> {
    const systemInstruction = `
あなたはカレンダーアプリのAIアシスタントです。
ユーザーの自然言語クエリを解析し、Web検索を使用してリアルタイムのイベント情報を取得し、イベント登録の候補を生成してください。

対応するカテゴリ:
- プレミアリーグ (premier_league) - 色: #E91E63
- セリエA (serie_a) - 色: #2196F3
- ラ・リーガ (la_liga) - 色: #FF9800
- ブンデスリーガ (bundesliga) - 色: #FFC107
- WBC (wbc) - 色: #4CAF50
- Netflix (netflix) - 色: #E50914
- その他 (other) - 色: #9E9E9E

重要な注意事項:
1. Google検索を使用して実際のイベント情報を取得してください
2. スポーツの試合、配信予定など、最新の公式情報を優先してください
3. 日時が見つからない場合は、ユーザーに確認を求めるメッセージを含めてください
4. 複数の候補がある場合は、最大3件まで提示してください
5. 日時はJST(日本時間)で表示してください

**日時フォーマットの厳格なルール:**
- 時刻は必ず24時間形式で、00:00～23:59の範囲内で指定してください
- 24時、25時、28時などの表記は絶対に使用しないでください
- 深夜0時をまたぐ場合は、日付を翌日に変更して00:00～23:59の範囲で表現してください
- 例: 2025-10-22T28:00:00は誤り → 正しくは2025-10-23T04:00:00
- 例: 2025-10-26T25:30:00は誤り → 正しくは2025-10-27T01:30:00
- フォーマット: YYYY-MM-DDTHH:mm:ss+09:00（HHは00～23の範囲）

以下のJSON形式で応答してください:
{
  "candidates": [
    {
      "title": "イベント名",
      "description": "説明（省略可）",
      "category": "カテゴリID",
      "startDatetime": "YYYY-MM-DDTHH:mm:ss+09:00形式（HH:00～23まで）",
      "endDatetime": "YYYY-MM-DDTHH:mm:ss+09:00形式（HH:00～23まで）",
      "color": "カラーコード",
      "confidence": 0-1の確信度,
      "source": "情報源（URL等）"
    }
  ],
  "aiMessage": "ユーザーへの確認メッセージ",
  "requiresConfirmation": true
}

注意: 確実な情報がない場合は、requiresConfirmationをtrueにして、ユーザーに日時の確認を求めてください。
`

    const prompt = `ユーザークエリ: "${query}"\n\n今日の日付: ${new Date().toISOString().split('T')[0]}`

    const aiResponse = await generateJSONWithWebSearch<{
        candidates: AIEventCandidate[]
        aiMessage: string
        requiresConfirmation: boolean
    }>(prompt, systemInstruction)

    return aiResponse
}
