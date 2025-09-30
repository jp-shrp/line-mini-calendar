type CamelToSnakeCase<S extends string> = S extends `${infer T}${infer U}`
    ? `${T extends Capitalize<T> ? '_' : ''}${Lowercase<T>}${CamelToSnakeCase<U>}`
    : S

type CamelToSnake<T extends object> = {
    [K in keyof T as `${CamelToSnakeCase<string & K>}`]: T[K] extends object
        ? CamelToSnake<T[K]>
        : T[K]
}

type SnakeToCamelCase<S extends string> = S extends `${infer T}_${infer U}`
    ? `${T}${Capitalize<SnakeToCamelCase<U>>}`
    : S

type SnakeToCamel<T extends object> = {
    [K in keyof T as `${SnakeToCamelCase<string & K>}`]: T[K] extends object
        ? SnakeToCamel<T[K]>
        : T[K]
}

export const toCamelCase = (str: string): string => {
    return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
}

export const convertKeysToCamelCase = <T extends Record<string, any>>(
    obj: T
): SnakeToCamel<T> => {
    if (obj === null || typeof obj !== 'object') {
        return obj as SnakeToCamel<T>
    }

    if (Array.isArray(obj)) {
        return obj.map((item) =>
            convertKeysToCamelCase(item)
        ) as SnakeToCamel<T>
    }

    const result: Record<string, any> = {}
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            const camelKey = toCamelCase(key)
            const value = obj[key]
            result[camelKey] =
                value && typeof value === 'object'
                    ? convertKeysToCamelCase(value)
                    : value
        }
    }

    return result as SnakeToCamel<T>
}

export type { CamelToSnake, SnakeToCamel }

export const defineAllKeys = <T>() => {
    return function <U extends readonly (keyof T)[]>(
        keys: U & (keyof T extends U[number] ? U : never)
    ): U {
        return keys
    }
}
