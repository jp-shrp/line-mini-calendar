/**
 * AIテストページClient Component
 */
'use client'

import { useAISearch } from '../hooks/useAISearch'
import { useAIRegister } from '../hooks/useAIRegister'
import { MainView } from './MainView'

export const AITestClient = () => {
    const searchHook = useAISearch()
    const registerHook = useAIRegister()

    return <MainView searchHook={searchHook} registerHook={registerHook} />
}
