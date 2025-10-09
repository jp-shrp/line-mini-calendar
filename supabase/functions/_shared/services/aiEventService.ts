/**
 * AIイベントサービス
 * Gemini APIを使用してイベントの検索・登録をAIで支援
 */

import { getPaginationInfo } from '_shared/paginationUtility'
import { getEvents } from '_shared/services/eventService'
import {
    generateJSON,
    generateJSONWithWebSearch,
} from '_shared/services/geminiService'
import type {
    AIEventCandidate,
    AIRegisterResponse,
    AISearchResponse,
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
/**
 * 重複チェック結果
 */
interface DuplicateCheckResult {
    candidateIndex: number
    isDuplicate: boolean
    confidence: number // 重複の確信度 (0-1)
    reason?: string // 重複と判断した理由
}

/**
 * AI重複チェック: 候補イベントと既存イベントの重複を一括でチェック
 * 候補を一つずつチェックするのではなく、一括でAIに送信して効率化
 */
async function aiCheckDuplicateEvents(
    userId: string,
    candidates: AIEventCandidate[]
): Promise<DuplicateCheckResult[]> {
    // 既存イベントを取得
    const { events: existingEvents } = await getEvents({
        userId,
        pagination: getPaginationInfo({ currentPage: 1, limit: 100 }),
    })

    // 既存イベントがない場合は重複なし
    if (existingEvents.length === 0) {
        return candidates.map((_, index) => ({
            candidateIndex: index,
            isDuplicate: false,
            confidence: 0,
        }))
    }

    // 候補と既存イベントの簡略化データを準備
    const candidatesSimplified = candidates.map((c, index) => ({
        index,
        title: c.title,
        startDatetime: c.startDatetime,
    }))

    const existingEventsSimplified = existingEvents.map((e) => ({
        title: e.title,
        startDatetime: e.startDatetime,
    }))

    // 日本語版（参考）:
    // あなたはカレンダーアプリのAIアシスタントです。
    // 新規登録候補のイベントリストと既存イベントリストを比較し、重複しているイベントを検出してください。
    const systemInstruction = `
You are an AI assistant for a calendar app.
Compare the list of new event candidates with the list of existing events and detect duplicates.
All response messages must be in Japanese.

Important notes:
1. Consider events as duplicates if they have similar titles and occur on the same date (ignore time differences)
2. Handle title variations (e.g., "トッテナム vs アストン・ヴィラ" and "トットナム対アストン・ヴィラ" are the same)
3. Return confidence score (0-1) for each duplicate detection
4. Provide reason in Japanese when marking as duplicate

Respond in the following JSON format:
{
  "results": [
    {
      "candidateIndex": index of the candidate,
      "isDuplicate": true or false,
      "confidence": confidence score 0-1 (1 = definitely duplicate, 0 = definitely not duplicate),
      "reason": "Reason in Japanese (only if isDuplicate is true)"
    }
  ]
}

Check ALL candidates and return results for each one.
`

    const prompt = `
Candidate events to register:
${JSON.stringify(candidatesSimplified, null, 2)}

Existing events already registered:
${JSON.stringify(existingEventsSimplified, null, 2)}

Please check if any candidates are duplicates of existing events.
`

    try {
        const aiResponse = await generateJSON<{
            results: DuplicateCheckResult[]
        }>(prompt, systemInstruction)

        return aiResponse.results
    } catch (error) {
        console.error('Error in AI duplicate check:', error)
        // エラー時は全て重複なしとして返す
        return candidates.map((_, index) => ({
            candidateIndex: index,
            isDuplicate: false,
            confidence: 0,
        }))
    }
}

export async function aiSearchEvents(
    userId: string,
    query: string
): Promise<AISearchResponse> {
    // Step 1: Gemini APIでクエリを解析
    // 日本語版（参考）:
    // あなたはカレンダーアプリのAIアシスタントです。
    // ユーザーの自然言語クエリを解析し、イベント検索のパラメータを抽出してください。
    const systemInstruction = `
You are an AI assistant for a calendar app.
Parse the user's natural language query and extract event search parameters.
All response messages must be in Japanese.

Supported categories:
- Premier League (premier_league)
- Serie A (serie_a)
- La Liga (la_liga)
- Bundesliga (bundesliga)
- WBC (wbc)
- Netflix (netflix)
- Other (other)

Date keywords:
- today, tomorrow, this week, next week, this month, next month, etc.

Respond in the following JSON format:
{
  "startDate": "Start date in YYYY-MM-DD format (optional)",
  "endDate": "End date in YYYY-MM-DD format (optional)",
  "category": "Category ID (optional)",
  "keywords": ["Array of search keywords"],
  "userFriendlyMessage": "Response message to user in Japanese"
}
`

    const prompt = `User query: "${query}"\n\nToday's date: ${new Date().toISOString().split('T')[0]}`

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
    userId: string,
    query: string
): Promise<AIRegisterResponse> {
    // 日本語版（参考）:
    // あなたはカレンダーアプリのAIアシスタントです。
    // ユーザーの自然言語クエリを解析し、Web検索を使用してリアルタイムのイベント情報を取得し、イベント登録の候補を生成してください。
    const systemInstruction = `
You are an AI assistant for a calendar app.
Parse the user's natural language query, use web search to retrieve real-time event information, and generate event registration candidates.
All response messages must be in Japanese.

**CRITICAL: Date/Time Format Rules (MUST FOLLOW):**
This is the MOST IMPORTANT rule. You MUST strictly follow these datetime format rules:

1. Hours MUST be in 24-hour format between 00-23 (NEVER 24, 25, 26, 27, 28, etc.)
2. If the time appears to be after midnight (24:00 or later), you MUST:
   - Add 1 to the date
   - Subtract 24 from the hours

3. Format: YYYY-MM-DDTHH:mm:ss+09:00 where HH is 00-23

Examples of INCORRECT and CORRECT formats:
❌ WRONG: 2025-10-22T24:00:00+09:00 → ✅ CORRECT: 2025-10-23T00:00:00+09:00
❌ WRONG: 2025-10-22T25:00:00+09:00 → ✅ CORRECT: 2025-10-23T01:00:00+09:00
❌ WRONG: 2025-10-22T26:30:00+09:00 → ✅ CORRECT: 2025-10-23T02:30:00+09:00
❌ WRONG: 2025-10-22T27:00:00+09:00 → ✅ CORRECT: 2025-10-23T03:00:00+09:00
❌ WRONG: 2025-10-22T28:00:00+09:00 → ✅ CORRECT: 2025-10-23T04:00:00+09:00
❌ WRONG: 2025-10-26T25:30:00+09:00 → ✅ CORRECT: 2025-10-27T01:30:00+09:00

If you see a sports match scheduled at "深夜1時" (1 AM) or "28:00", calculate the correct date and time:
- 深夜1時 on Oct 22 = 2025-10-23T01:00:00+09:00 (next day, 01:00)
- 28:00 on Oct 22 = 2025-10-23T04:00:00+09:00 (next day, 04:00)

Double-check EVERY datetime before responding. Invalid hours (24+) will cause system errors.

Supported categories:
- Premier League (premier_league) - Color: #E91E63
- Serie A (serie_a) - Color: #2196F3
- La Liga (la_liga) - Color: #FF9800
- Bundesliga (bundesliga) - Color: #FFC107
- WBC (wbc) - Color: #4CAF50
- Netflix (netflix) - Color: #E50914
- Other (other) - Color: #9E9E9E

Important notes:
1. Use Google search to retrieve actual event information
2. Prioritize the latest official information for sports matches, streaming schedules, etc.
3. If date/time is not found, include a message asking the user for confirmation
4. If there are multiple candidates, present up to 5 items
5. Display date/time in JST (Japan Standard Time)

Information source priority:
- For major sports information (Premier League, Serie A, La Liga, Bundesliga, WBC, etc.), prioritize Yahoo! JAPAN Sports Navi (https://sports.yahoo.co.jp/)
- Only use other official sources if information is not found on Sports Navi
- For entertainment content like Netflix, use official websites or reliable sources

Respond in the following JSON format:
{
  "candidates": [
    {
      "title": "Event name in Japanese",
      "description": "Description in Japanese (optional)",
      "category": "Category ID",
      "startDatetime": "YYYY-MM-DDTHH:mm:ss+09:00 (CRITICAL: HH must be 00-23 only!)",
      "endDatetime": "YYYY-MM-DDTHH:mm:ss+09:00 (CRITICAL: HH must be 00-23 only!)",
      "color": "Color code",
      "confidence": confidence score 0-1,
      "source": "Information source (URL, etc.)"
    }
  ],
  "aiMessage": "Confirmation message to user in Japanese",
  "requiresConfirmation": true
}

REMINDER: Before submitting, verify ALL datetime values have hours between 00-23. Convert any 24+ hours by adding days.
Note: If information is not certain, set requiresConfirmation to true and ask the user to confirm the date/time.
`

    const prompt = `User query: "${query}"\n\nToday's date: ${new Date().toISOString().split('T')[0]}`

    const aiResponse = await generateJSONWithWebSearch<{
        candidates: AIEventCandidate[]
        aiMessage: string
        requiresConfirmation: boolean
    }>(prompt, systemInstruction)

    // Step: AI重複チェックを一括で実行
    const duplicateCheckResults = await aiCheckDuplicateEvents(
        userId,
        aiResponse.candidates
    )

    // 重複チェック結果を候補に反映
    const candidatesWithDuplicateCheck = aiResponse.candidates.map(
        (candidate, index) => {
            const checkResult = duplicateCheckResults.find(
                (r) => r.candidateIndex === index
            )

            if (checkResult && checkResult.isDuplicate) {
                return {
                    ...candidate,
                    isDuplicate: true,
                    duplicateReason:
                        checkResult.reason || '既に登録されています',
                    duplicateConfidence: checkResult.confidence,
                }
            }

            return candidate
        }
    )

    return {
        ...aiResponse,
        candidates: candidatesWithDuplicateCheck,
    }
}
