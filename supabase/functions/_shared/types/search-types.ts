/**
 * 検索機能関連の型定義
 */

/**
 * キーワードの種類
 */
export type KeywordType =
    | 'person'
    | 'organization'
    | 'location'
    | 'event'
    | 'common'

/**
 * 抽出されたキーワード情報
 */
export interface ExtractedKeyword {
    /** キーワード */
    term: string
    /** 重要度スコア (0.0 - 1.0) */
    importance: number
    /** キーワードの種類 */
    type: KeywordType
}

/**
 * Gemini APIからのキーワード抽出レスポンス
 */
export interface KeywordExtractionResponse {
    /** 抽出されたキーワードリスト */
    keywords: ExtractedKeyword[]
    /** 検索意図の推定 */
    searchIntent?: string
}

/**
 * 処理済みキーワード情報
 */
export interface ProcessedKeywords {
    /** 必須キーワード（AND検索） */
    mandatoryKeywords: string[]
    /** 任意キーワード（OR検索） */
    optionalKeywords: string[]
    /** データソース */
    source: 'ai' | 'fallback'
}
