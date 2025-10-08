/**
 * カテゴリカラーユーティリティ
 * カテゴリごとの色を管理
 */

/**
 * カテゴリカラーマッピング
 */
const CATEGORY_COLORS: Record<string, string> = {
    premier_league: '#38003C', // プレミアリーグ: パープル
    serie_a: '#024494', // セリエA: ブルー
    la_liga: '#FF6900', // ラ・リーガ: オレンジ
    bundesliga: '#D20515', // ブンデスリーガ: レッド
    wbc: '#C8102E', // WBC: レッド
    netflix: '#E50914', // Netflix: ネットフリックスレッド
    other: '#6B7280', // その他: グレー
}

/**
 * カテゴリ名から色を取得
 * @param category カテゴリ名
 * @returns カラーコード
 */
export const getCategoryColor = (category: string): string => {
    return CATEGORY_COLORS[category] ?? CATEGORY_COLORS.other
}

/**
 * カテゴリカラーのTailwindクラスを取得
 * @param category カテゴリ名
 * @returns Tailwindクラス名
 */
export const getCategoryColorClass = (category: string): string => {
    const colorMap: Record<string, string> = {
        premier_league: 'bg-purple-900',
        serie_a: 'bg-blue-700',
        la_liga: 'bg-orange-600',
        bundesliga: 'bg-red-700',
        wbc: 'bg-red-700',
        netflix: 'bg-red-600',
        other: 'bg-gray-500',
    }

    return colorMap[category] ?? colorMap.other
}

/**
 * カテゴリカラーのTailwind境界線クラスを取得
 * @param category カテゴリ名
 * @returns Tailwindクラス名
 */
export const getCategoryBorderClass = (category: string): string => {
    const colorMap: Record<string, string> = {
        premier_league: 'border-purple-900',
        serie_a: 'border-blue-700',
        la_liga: 'border-orange-600',
        bundesliga: 'border-red-700',
        wbc: 'border-red-700',
        netflix: 'border-red-600',
        other: 'border-gray-500',
    }

    return colorMap[category] ?? colorMap.other
}

/**
 * カテゴリカラーのTailwindテキストクラスを取得
 * @param category カテゴリ名
 * @returns Tailwindクラス名
 */
export const getCategoryTextClass = (category: string): string => {
    const colorMap: Record<string, string> = {
        premier_league: 'text-purple-900',
        serie_a: 'text-blue-700',
        la_liga: 'text-orange-600',
        bundesliga: 'text-red-700',
        wbc: 'text-red-700',
        netflix: 'text-red-600',
        other: 'text-gray-500',
    }

    return colorMap[category] ?? colorMap.other
}
