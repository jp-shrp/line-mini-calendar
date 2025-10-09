/**
 * AI API用のMutation Hooks
 */
import { useSupabaseMutation } from '@/src/hooks/useSupabaseMutation'
import type {
    AISearchRequest,
    AISearchResponse,
    AIRegisterRequest,
    AIRegisterResponse,
    AIConfirmRegisterRequest,
    AIConfirmRegisterResponse,
} from '@/supabase/functions/_shared/types/ai-api-types'

/**
 * AIイベント検索Mutation
 */
export const useAISearchMutation = () => {
    return useSupabaseMutation<AISearchResponse, AISearchRequest>({
        functionName: 'ai-api/search',
        method: 'POST',
        suppressErrorModal: false,
    })
}

/**
 * AIイベント登録候補生成Mutation
 */
export const useAIRegisterMutation = () => {
    return useSupabaseMutation<AIRegisterResponse, AIRegisterRequest>({
        functionName: 'ai-api/register',
        method: 'POST',
        suppressErrorModal: false,
    })
}

/**
 * AIイベント登録確定Mutation
 */
export const useAIConfirmRegisterMutation = () => {
    return useSupabaseMutation<
        AIConfirmRegisterResponse,
        AIConfirmRegisterRequest
    >({
        functionName: 'ai-api/confirm-register',
        method: 'POST',
        suppressErrorModal: false,
    })
}
