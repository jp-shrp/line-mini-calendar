import { db } from 'db'
import { eq } from 'imports'
import { users } from '_shared/schemas/users'

/**
 * ユーザーIDに基づいてユーザー情報を取得する
 * @param userId ユーザーID
 * @returns ユーザー情報
 */
export async function getUserById(userId: string) {
    const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
    })

    return user
}

/**
 * 全ユーザー一覧を取得する
 * @returns ユーザー一覧
 */
export async function getAllUsers() {
    const usersList = await db.query.users.findMany({
        orderBy: (users, { asc }) => asc(users.createdAt),
    })

    return usersList
}
