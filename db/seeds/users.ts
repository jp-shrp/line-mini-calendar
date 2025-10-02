import { fakerJA as faker } from '@faker-js/faker'
import { sql } from 'drizzle-orm'
import { users } from '../../supabase/functions/_shared/schemas/users'
import { client, db } from '../drizzle/drizzle'
import { getClientAdmin } from '../drizzle/share'

const adminClient = getClientAdmin()

// シードデータを挿入する関数
export const usersSeeder = async () => {
    await db.execute(sql`TRUNCATE TABLE users RESTART IDENTITY CASCADE;`)

    const list = await adminClient.auth.admin.listUsers()
    await Promise.all(
        list.data.users.map(async (x) => {
            return await adminClient.auth.admin.deleteUser(x.id)
        })
    )

    await create()
}

const create = async () => {
    const { data } = await adminClient.auth.admin.createUser({
        email: 'test@mail.com',
        password: 'password',
        email_confirm: true,
        user_metadata: {
            role: 'user',
            name: faker.person.fullName(),
            picture: faker.image.avatar(),
        },
    })

    const user = data.user!
    await db.insert(users).values({
        email: user.email!,
        name: 'TestA',
    })

    // 150件のユーザーを30件ずつ5回に分けて作成
    for (let chunk = 0; chunk < 1; chunk++) {
        await Promise.all(
            Array.from({ length: 30 }).map(async (_, index) => {
                const globalIndex = chunk * 30 + index
                const { data } = await adminClient.auth.admin.createUser({
                    email: `user-${globalIndex}-${faker.internet.email()}`,
                    password: 'password',
                    user_metadata: {
                        role: 'user',
                        name: faker.person.fullName(),
                        picture: faker.image.avatar(),
                    },
                    email_confirm: true,
                })
                await db.insert(users).values({
                    email: data.user!.email!,
                    name: faker.person.fullName(),
                })
            })
        )
        await new Promise((resolve) => setTimeout(resolve, 1000))
    }
}

/**
 * 個別seed用
 * yarn db:seed ./db/seed/users.ts
 */
const runSeeder = async () => {
    const args = process.argv.slice(1) // コマンドライン引数を取得
    const currentFileName = args[0]?.split('/').pop() // 現在のファイル名を取得

    if (currentFileName && currentFileName === 'users.ts') {
        try {
            await usersSeeder()
            console.log(
                `Seed process for ${currentFileName} completed successfully`
            )
        } catch (error) {
            console.error(`Error running ${currentFileName}:`, error)
        } finally {
            await client.end() // DB接続を終了
        }
    }
}

runSeeder()
