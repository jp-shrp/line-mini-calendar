import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const user = request.cookies.get('user')?.value
    const { pathname } = request.nextUrl

    const isAuth = !!user
    const isPublicPath = ['/login'].includes(pathname)
    const isProtectedMypage = pathname.startsWith('/mypage')
    const isProtectedPath = ['/register', '/password'].some((path) =>
        pathname.startsWith(path)
    )

    if (isAuth) {
        if (isPublicPath || isProtectedPath) {
            return NextResponse.redirect(new URL('/', request.url))
        }
    }

    if (!isAuth) {
        if (isProtectedMypage) {
            return NextResponse.redirect(new URL('/login', request.url))
        }
    }
    return NextResponse.next()
}

export const config = {
    matcher: [
        '/mypage/:path*',
        '/password/:path*',
        '/login',
        '/register/:path*',
    ],
}
