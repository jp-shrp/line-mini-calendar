export const enumToPgEnum = (myEnum: any): [string, ...string[]] => {
    return Object.values(myEnum).map((value: any) => `${value}`) as [
        string,
        ...string[],
    ]
}

export type Nullable<T> = {
    [K in keyof T]?: T[K] | null
}
