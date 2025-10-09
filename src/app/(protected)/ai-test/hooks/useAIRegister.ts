/**
 * AIイベント登録Hook
 */
import { useState, useCallback } from 'react'
import {
    useAIRegisterMutation,
    useAIConfirmRegisterMutation,
} from '../api/ai-mutation'
import type { AIRegisterResponse } from '@/supabase/functions/_shared/types/ai-api-types'
import type { Event } from '@/supabase/functions/_shared/types/events-api-types'

export const useAIRegister = () => {
    const [query, setQuery] = useState('')
    const [registerResult, setRegisterResult] =
        useState<AIRegisterResponse | null>(null)
    const [selectedCandidateIndex, setSelectedCandidateIndex] = useState<
        number | null
    >(null)
    const [registeredEvent, setRegisteredEvent] = useState<Event | null>(null)

    const registerMutation = useAIRegisterMutation()
    const confirmMutation = useAIConfirmRegisterMutation()

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
            setSelectedCandidateIndex(null)
            setRegisteredEvent(null)
        }
    }, [query, registerMutation])

    const handleSelectCandidate = useCallback((index: number) => {
        setSelectedCandidateIndex(index)
    }, [])

    const handleConfirmRegister = useCallback(async () => {
        if (
            selectedCandidateIndex === null ||
            !registerResult ||
            !registerResult.candidates
        ) {
            return
        }

        const result = await confirmMutation.mutateAsync({
            candidateIndex: selectedCandidateIndex,
            candidates: registerResult.candidates,
        })

        if (result && result.event) {
            setRegisteredEvent(result.event)
        }
    }, [selectedCandidateIndex, registerResult, confirmMutation])

    const handleClear = useCallback(() => {
        setQuery('')
        setRegisterResult(null)
        setSelectedCandidateIndex(null)
        setRegisteredEvent(null)
    }, [])

    return {
        query,
        registerResult,
        selectedCandidateIndex,
        registeredEvent,
        isGenerating: registerMutation.isPending,
        isRegistering: confirmMutation.isPending,
        handleQueryChange,
        handleGenerateCandidates,
        handleSelectCandidate,
        handleConfirmRegister,
        handleClear,
    }
}
