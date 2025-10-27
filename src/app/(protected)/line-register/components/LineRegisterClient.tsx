'use client'

import { useLineRegister } from '../hooks/useLineRegister'
import { MainView } from './MainView'

/**
 * LINE登録画面のClient Component
 * @description
 * useLineRegisterフックを呼び出し、MainViewにpropsを渡します
 */
export const LineRegisterClient = () => {
    const hookItems = useLineRegister()
    return <MainView {...hookItems} />
}
