/**
 * AIイベント検索Hook
 */
import { useState, useCallback } from 'react'
import { useAISearchMutation } from '../api/ai-mutation'
import type { AISearchResponse } from '@/supabase/functions/_shared/types/ai-api-types'

export const useAISearch = () => {
    const [query, setQuery] = useState('')
    const [searchResult, setSearchResult] = useState<AISearchResponse | null>(
        null
    )
    const searchMutation = useAISearchMutation()

    const handleQueryChange = useCallback((value: string) => {
        setQuery(value)
    }, [])

    const handleSearch = useCallback(async () => {
        if (!query.trim()) {
            return
        }

        const result = await searchMutation.mutateAsync({ query })
        if (result) {
            setSearchResult(result)
        }
    }, [query, searchMutation])

    const handleClear = useCallback(() => {
        setQuery('')
        setSearchResult(null)
    }, [])

    return {
        query,
        searchResult,
        isSearching: searchMutation.isPending,
        handleQueryChange,
        handleSearch,
        handleClear,
    }
}
