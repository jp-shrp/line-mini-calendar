import { atomWithStorage } from 'jotai/utils'
import cookies from 'js-cookie'

export const cookieStorageAdapter = () => {
    return {
        getItem: async (key: string) => {
            return cookies.get(key) ?? ''
        },
        setItem: async (key: string, value: string) => {
            cookies.set(key, JSON.stringify(value))
        },
        removeItem: async (key: string) => {
            cookies.remove(key)
        },
    }
}

export const userAtom = atomWithStorage('user', '', cookieStorageAdapter())
