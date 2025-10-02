import type { Config } from 'drizzle-kit'
import { importEnv } from './share'

importEnv()

const drizzleConfig = {
    dialect: 'postgresql',
    schema: './supabase/functions/_shared/schemas/*',
    out: './db/migrations',
    dbCredentials: {
        url: process.env.DB_URL!,
    },
    migrations: {
        prefix: 'timestamp',
        table: 'drizzle_migrations',
        schema: 'public',
    },
} satisfies Config

export default drizzleConfig
