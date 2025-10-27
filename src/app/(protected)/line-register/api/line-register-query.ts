/**
 * LINE Register API用のQuery Hooks
 */
import { useSupabaseQuery } from '@/src/hooks/useSupabaseQuery'
import type { AIEventCandidate } from '@/supabase/functions/_shared/types/ai-api-types'

/**
 * セッション取得レスポンス
 */
export interface LineRegisterSessionResponse {
    sessionId: string
    aiMessage: string
    candidates: AIEventCandidate[]
}

/**
 * LINE イベント候補セッション取得Query
 */
export const useLineRegisterSessionQuery = (sessionId: string | null) => {
    return useSupabaseQuery<LineRegisterSessionResponse>({
        queryKey: ['line-register-session', sessionId || 'none'],
        functionName: 'line-api/get-session',
        params: sessionId ? { sessionId } : undefined,
        enabled: !!sessionId,
        suppressErrorModal: false,
    })
}
