/**
 * Gemini APIサービス
 * Google Gemini APIを使用してAI機能を提供
 */

import type { KeywordExtractionResponse } from '_shared/types/search-types'

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')
const GEMINI_MODEL = 'gemini-2.0-flash-exp' // 最新の安定版モデルを使用
//const GEMINI_MODEL = 'gemini-2.0-flash-lite' // 最新の安定版モデルを使用
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`

if (!GEMINI_API_KEY) {
    console.warn(
        'GEMINI_API_KEY is not set. AI features will not be available.'
    )
}

export interface GeminiMessage {
    role: 'user' | 'model'
    parts: { text: string }[]
}

export interface GeminiRequest {
    contents: GeminiMessage[]
    generationConfig?: {
        temperature?: number
        topK?: number
        topP?: number
        maxOutputTokens?: number
    }
    tools?: {
        googleSearch?: object
    }[]
}

export interface GeminiResponse {
    candidates: {
        content: {
            parts: { text: string }[]
            role: string
        }
        finishReason: string
        index: number
        safetyRatings: unknown[]
    }[]
    promptFeedback?: unknown
}

/**
 * Gemini APIを呼び出してテキスト生成
 */
export async function generateText(
    prompt: string,
    systemInstruction?: string
): Promise<string> {
    if (!GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY is not configured')
    }

    const messages: GeminiMessage[] = []

    // システム命令がある場合は最初に追加
    if (systemInstruction) {
        messages.push({
            role: 'user',
            parts: [{ text: systemInstruction }],
        })
        messages.push({
            role: 'model',
            parts: [{ text: '了解しました。指示に従います。' }],
        })
    }

    // ユーザーのプロンプトを追加
    messages.push({
        role: 'user',
        parts: [{ text: prompt }],
    })

    const requestBody: GeminiRequest = {
        contents: messages,
        generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
        },
    }

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Gemini API error: ${response.status} - ${errorText}`)
    }

    const data: GeminiResponse = await response.json()

    if (
        !data.candidates ||
        data.candidates.length === 0 ||
        !data.candidates[0].content.parts[0]
    ) {
        throw new Error('Gemini API returned no content')
    }

    return data.candidates[0].content.parts[0].text
}

/**
 * JSON形式でのレスポンスを期待するGemini API呼び出し
 */
export async function generateJSON<T>(
    prompt: string,
    systemInstruction?: string
): Promise<T> {
    const fullInstruction = `${systemInstruction || ''}\n\n必ず有効なJSON形式で回答してください。Markdown形式やコードブロック（\`\`\`json）は使用せず、純粋なJSON文字列のみを返してください。`

    const text = await generateText(prompt, fullInstruction)

    // JSONの抽出（念のためMarkdownコードブロックも処理）
    let jsonText = text.trim()

    // Markdownコードブロックを削除
    const codeBlockMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (codeBlockMatch) {
        jsonText = codeBlockMatch[1].trim()
    }

    try {
        return JSON.parse(jsonText) as T
    } catch (error) {
        console.error('Failed to parse Gemini response as JSON:', text)
        throw new Error(`Failed to parse AI response: ${error}`)
    }
}

/**
 * Web検索機能を有効にしたGemini API呼び出し
 * Google Searchを使用してリアルタイムの情報を取得可能
 */
export async function generateTextWithWebSearch(
    prompt: string,
    systemInstruction?: string
): Promise<string> {
    if (!GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY is not configured')
    }

    const messages: GeminiMessage[] = []

    // システム命令がある場合は最初に追加
    if (systemInstruction) {
        messages.push({
            role: 'user',
            parts: [{ text: systemInstruction }],
        })
        messages.push({
            role: 'model',
            parts: [{ text: '了解しました。指示に従います。' }],
        })
    }

    // ユーザーのプロンプトを追加
    messages.push({
        role: 'user',
        parts: [{ text: prompt }],
    })

    const requestBody: GeminiRequest = {
        contents: messages,
        generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
        },
        tools: [
            {
                googleSearch: {},
            },
        ],
    }

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Gemini API error: ${response.status} - ${errorText}`)
    }

    const data: GeminiResponse = await response.json()

    if (
        !data.candidates ||
        data.candidates.length === 0 ||
        !data.candidates[0].content.parts[0]
    ) {
        throw new Error('Gemini API returned no content')
    }

    return data.candidates[0].content.parts[0].text
}

/**
 * Web検索機能を有効にしてJSON形式でのレスポンスを期待するGemini API呼び出し
 * Google Searchを使用してリアルタイムの情報を取得し、JSON形式で返却
 */
export async function generateJSONWithWebSearch<T>(
    prompt: string,
    systemInstruction?: string
): Promise<T> {
    const fullInstruction = `${systemInstruction || ''}\n\n必ず有効なJSON形式で回答してください。Markdown形式やコードブロック（\`\`\`json）は使用せず、純粋なJSON文字列のみを返してください。`

    const text = await generateTextWithWebSearch(prompt, fullInstruction)

    // JSONの抽出（念のためMarkdownコードブロックも処理）
    let jsonText = text.trim()

    // Markdownコードブロックを削除
    const codeBlockMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (codeBlockMatch) {
        jsonText = codeBlockMatch[1].trim()
    }

    try {
        return JSON.parse(jsonText) as T
    } catch (error) {
        console.error('Failed to parse Gemini response as JSON:', text)
        throw new Error(`Failed to parse AI response: ${error}`)
    }
}

/**
 * 検索クエリからキーワードを抽出し、重要度をスコアリング
 *
 * @param query - ユーザーの検索クエリ
 * @returns 抽出されたキーワードと重要度スコア
 */
export async function extractSearchKeywords(
    query: string
): Promise<KeywordExtractionResponse> {
    const systemInstruction = `
あなたは検索クエリ解析の専門家です。
ユーザーの検索クエリから重要なキーワードを抽出し、それぞれの重要度をスコアリングしてください。

## 重要度スコアの基準
- 0.9-1.0: 固有名詞（人名、企業名、地名など）で検索の核となるキーワード
- 0.7-0.8: 重要な一般名詞（イベントの種類、カテゴリなど）
- 0.5-0.6: 補助的なキーワード
- 0.0-0.4: ストップワード（の、は、が、いつ、など）は除外

## キーワードタイプ
- person: 人名
- organization: 組織名、企業名、チーム名
- location: 地名、場所
- event: イベント名、試合名
- common: 一般名詞

## 注意事項
- 固有名詞は可能な限りフルネームで抽出してください（例: "大谷" → "大谷翔平"）
- ストップワード（助詞、接続詞など）は除外してください
- 検索意図を推定してください（例: スポーツイベント検索、人物情報検索など）

## 出力形式
必ず以下のJSON形式で回答してください：
{
  "keywords": [
    { "term": "キーワード", "importance": 0.95, "type": "person" }
  ],
  "searchIntent": "検索意図の説明"
}
`

    const prompt = `
以下の検索クエリを解析してください：
"${query}"

重要なキーワードを抽出し、それぞれの重要度（0.0-1.0）とタイプを判定してください。
`

    try {
        const result = await generateJSON<KeywordExtractionResponse>(
            prompt,
            systemInstruction
        )

        // 重要度でソート（降順）
        result.keywords.sort((a, b) => b.importance - a.importance)

        return result
    } catch (error) {
        console.error('Failed to extract keywords from query:', error)
        throw error
    }
}
