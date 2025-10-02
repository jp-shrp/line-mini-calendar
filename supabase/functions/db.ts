import * as schema from '_shared/schemas'
import { drizzle } from 'imports'
import postgres from 'postgres'

// 環境変数からDB接続情報を取得
const connectionString = Deno.env.get('DATABASE_URL') || ''

// PostgreSQL クライアントの作成
export const client = postgres(connectionString, { prepare: false })

// Drizzle ORM クライアントの作成
export const db = drizzle(client, { schema })

// DBクライアントを使用したトランザクション処理のヘルパー関数
export async function withTransaction<T>(
    //callback: (tx: PostgresJsDatabase<typeof schema>) => Promise<T>,
    callback: (tx: any) => Promise<T>,
): Promise<T> {
    return db.transaction(async (tx) => {
        const result = await callback(tx)
        return result
    })
}
