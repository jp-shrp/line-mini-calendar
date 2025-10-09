/**
 * AIイベント登録Hook
 */
import { useState, useCallback } from 'react'
import {
    useAIRegisterMutation,
    useAIBatchRegisterMutation,
} from '../api/ai-mutation'
import type { AIRegisterResponse } from '@/supabase/functions/_shared/types/ai-api-types'
import type { Event } from '@/supabase/functions/_shared/types/events-api-types'

export const useAIRegister = () => {
    const [query, setQuery] = useState('')
    const [registerResult, setRegisterResult] =
        useState<AIRegisterResponse | null>(null)
    const [selectedCandidateIndexes, setSelectedCandidateIndexes] = useState<
        number[]
    >([])
    const [registeredEvent, setRegisteredEvent] = useState<Event | null>(null)
    const [registeredEvents, setRegisteredEvents] = useState<Event[]>([])
    const [batchRegisterAiMessage, setBatchRegisterAiMessage] = useState<
        string | null
    >(null)

    const registerMutation = useAIRegisterMutation()
    const batchRegisterMutation = useAIBatchRegisterMutation()

    const handleQueryChange = useCallback((value: string) => {
        setQuery(value)
    }, [])

    const handleGenerateCandidates = useCallback(async () => {
        if (!query.trim()) {
            return
        }

        const result = await registerMutation.mutateAsync({ query })
        if (result) {
            setRegisterResult(result)
            setSelectedCandidateIndexes([])
            setRegisteredEvent(null)
            setRegisteredEvents([])
            setBatchRegisterAiMessage(null)
        }
    }, [query, registerMutation])

    const handleToggleCandidateSelection = useCallback((index: number) => {
        setSelectedCandidateIndexes((prev) => {
            if (prev.includes(index)) {
                return prev.filter((i) => i !== index)
            }
            return [...prev, index]
        })
    }, [])

    const handleBatchRegister = useCallback(async () => {
        if (
            selectedCandidateIndexes.length === 0 ||
            !registerResult ||
            !registerResult.candidates
        ) {
            return
        }

        const result = await batchRegisterMutation.mutateAsync({
            candidateIndexes: selectedCandidateIndexes,
            candidates: registerResult.candidates,
        })

        if (result) {
            setRegisteredEvents(result.events || [])
            setBatchRegisterAiMessage(result.aiMessage || null)
        }
    }, [selectedCandidateIndexes, registerResult, batchRegisterMutation])

    const handleClear = useCallback(() => {
        setQuery('')
        setRegisterResult(null)
        setSelectedCandidateIndexes([])
        setRegisteredEvent(null)
        setRegisteredEvents([])
        setBatchRegisterAiMessage(null)
    }, [])

    return {
        query,
        registerResult,
        selectedCandidateIndexes,
        registeredEvent,
        registeredEvents,
        batchRegisterAiMessage,
        isGenerating: registerMutation.isPending,
        isRegistering: batchRegisterMutation.isPending,
        handleQueryChange,
        handleGenerateCandidates,
        handleToggleCandidateSelection,
        handleBatchRegister,
        handleClear,
    }
}
