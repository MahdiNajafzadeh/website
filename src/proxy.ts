import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const COOKIE_NAME = 'payload-token'

const isAuthRequired = (pathname: string): { requireAuth: true; redirect: string } | null => {
    if (pathname === '/account' || pathname.startsWith('/account/')) {
        return { requireAuth: true, redirect: '/account' }
    }
    if (pathname === '/orders' || pathname.startsWith('/orders/')) {
        return { requireAuth: true, redirect: '/orders' }
    }
    if (pathname === '/checkout' || pathname.startsWith('/checkout/')) {
        return { requireAuth: true, redirect: '/checkout' }
    }
    if (pathname.startsWith('/employee')) {
        return { requireAuth: true, redirect: '/employee/dashboard' }
    }
    return null
}

export function proxy(request: NextRequest) {
    const guard = isAuthRequired(request.nextUrl.pathname)
    if (!guard) return NextResponse.next()

    const token = request.cookies.get(COOKIE_NAME)?.value
    if (token) return NextResponse.next()

    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', guard.redirect)
    return NextResponse.redirect(loginUrl)
}

export const config = {
    matcher: [
        '/account/:path*',
        '/orders/:path*',
        '/checkout/:path*',
        '/employee/:path*',
    ],
}
