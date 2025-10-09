/**
 * Gemini APIサービス
 * Google Gemini APIを使用してAI機能を提供
 */

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')
const GEMINI_MODEL = 'gemini-2.0-flash-exp' // 最新の安定版モデルを使用
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
}

export interface GeminiResponse {
    candidates: {
        content: {
            parts: { text: string }[]
            role: string
        }
        finishReason: string
        index: number
        safetyRatings: any[]
    }[]
    promptFeedback?: any
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
