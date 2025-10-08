import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

/**
 * Supabase認証を使用したミドルウェア
 * 匿名ログインを使用するため、基本的には全ページアクセス可能
 * 将来的にLINE認証などを追加する場合に備えて、認証チェック機構を残す
 */
export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // 公開パス（認証不要）
    const publicPaths = ['/']

    // 公開パスの場合はそのまま通す
    if (publicPaths.includes(pathname)) {
        return NextResponse.next()
    }

    const response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    // Supabaseクライアントを作成
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value
                },
                set(name: string, value: string, options: any) {
                    request.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                    response.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                },
                remove(name: string, options: any) {
                    request.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                    response.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                },
            },
        }
    )

    // セッションを取得（将来的なLINE認証などのために残す）
    await supabase.auth.getSession()

    // 匿名ログインを使用しているため、基本的には認証チェックはスキップ
    // 将来的にLINE認証などを追加する場合は、ここで認証チェックを実装

    return response
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
}
