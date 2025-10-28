/**
 * 検索関連のユーティリティ関数
 */

import type {
    ExtractedKeyword,
    ProcessedKeywords,
} from '_shared/types/search-types'
import { extractSearchKeywords } from '_shared/services/geminiService'

/**
 * 日本語のストップワードリスト
 * 検索精度を下げる一般的な助詞・接続詞など
 */
const STOP_WORDS = [
    'の',
    'は',
    'が',
    'を',
    'に',
    'で',
    'と',
    'も',
    'から',
    'まで',
    'より',
    'へ',
    'や',
    'など',
    'いつ',
    'ある',
    'いる',
    'なる',
    'する',
    'です',
    'ます',
    'だ',
    'である',
    'か',
    'な',
    'ね',
    'よ',
    'さ',
]

/**
 * ストップワードを除去
 *
 * @param keywords - キーワードの配列
 * @returns ストップワードを除去したキーワード配列
 */
export function removeStopWords(keywords: string[]): string[] {
    return keywords.filter((keyword) => {
        const trimmedKeyword = keyword.trim()
        // 空文字またはストップワードの場合は除外
        if (!trimmedKeyword || STOP_WORDS.includes(trimmedKeyword)) {
            return false
        }
        // 1文字のひらがなは除外（助詞の可能性が高い）
        if (trimmedKeyword.length === 1 && /^[ぁ-ん]$/.test(trimmedKeyword)) {
            return false
        }
        return true
    })
}

/**
 * 検索クエリを処理してキーワードを抽出
 * Gemini APIを使用してキーワード抽出を試み、失敗時はフォールバック処理
 *
 * @param query - 検索クエリ
 * @returns 処理済みキーワード情報
 */
export async function processSearchQuery(
    query: string
): Promise<ProcessedKeywords> {
    try {
        // 第1段階: Gemini APIでキーワード抽出
        const aiResult = await extractSearchKeywords(query)

        // 重要度0.7以上を必須キーワード、それ以外を任意キーワードとする
        const mandatoryKeywords = aiResult.keywords
            .filter((k: ExtractedKeyword) => k.importance >= 0.7)
            .map((k: ExtractedKeyword) => k.term)

        const optionalKeywords = aiResult.keywords
            .filter((k: ExtractedKeyword) => k.importance < 0.7)
            .map((k: ExtractedKeyword) => k.term)

        return {
            mandatoryKeywords,
            optionalKeywords,
            source: 'ai',
        }
    } catch (error) {
        console.warn(
            'Failed to extract keywords using AI, falling back to simple processing:',
            error
        )

        // フォールバック: ストップワード除去＋AND検索
        const keywords = query
            .trim()
            .split(/\s+/)
            .filter((k) => k.length > 0)

        const cleanedKeywords = removeStopWords(keywords)

        return {
            mandatoryKeywords: cleanedKeywords,
            optionalKeywords: [],
            source: 'fallback',
        }
    }
}
