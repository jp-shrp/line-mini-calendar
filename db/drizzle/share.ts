import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

export const getSuffix = () => {
    let SUFFIX = ''
    if (process.env.APP_ENV === 'staging') {
        SUFFIX = 'st'
    }
    if (process.env.APP_ENV === 'preview') {
        SUFFIX = 'preview'
    }
    if (process.env.APP_ENV === 'production') {
        SUFFIX = 'pr'
    }
    if (process.env.APP_ENV === 'test') {
        SUFFIX = 'test'
    }
    return SUFFIX
}

export const importEnv = () => {
    const SUFFIX = getSuffix()
    const _filename = __filename ? __filename : fileURLToPath(import.meta.url)
    const __dirname = path.dirname(_filename)
    if (SUFFIX) {
        dotenv.config({
            path: path.join(__dirname, `../../.env.${SUFFIX}`),
        })
    } else {
        dotenv.config({ path: path.join(__dirname, `../../.env`) })
    }
}

export const getClientAdmin = () => {
    return createClient(
        process.env.DRIZZLE_SUPABASE_URL!,
        process.env.SERVICE_ROLE_KEY!,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        },
    )
}
