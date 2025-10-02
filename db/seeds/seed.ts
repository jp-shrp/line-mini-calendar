import { client } from '../../db/drizzle/drizzle'

// ユーザー関連
import { usersSeeder } from './users'

const seeds = [usersSeeder]

const run = async () => {
    console.log('シードデータの作成を開始します...')

    for (const seed of seeds) {
        try {
            await seed()
            console.log(`✅ ${seed.name} 成功`)
        } catch (error) {
            console.error(`❌ ${seed.name} 失敗:`, error)
        }
    }

    console.log('シードデータの作成が完了しました')
    await client.end()
}

run()
