/**
 * LINE Register API用のMutation Hooks
 */
import { useSupabaseMutation } from '@/src/hooks/useSupabaseMutation'
import type {
    AIBatchRegisterRequest,
    AIBatchRegisterResponse,
} from '@/supabase/functions/_shared/types/ai-api-types'

/**
 * LINE イベント一括登録Mutation
 */
export const useLineBatchRegisterMutation = () => {
    return useSupabaseMutation<AIBatchRegisterResponse, AIBatchRegisterRequest>(
        {
            functionName: 'ai-api/batch-register',
            method: 'POST',
            suppressErrorModal: false,
        }
    )
}
