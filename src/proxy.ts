import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const COOKIE_NAME = 'payload-token'

const PROTECTED = [
    { match: '/account', redirect: '/account' },
    { match: '/orders', redirect: '/orders' },
    { match: '/checkout', redirect: '/checkout' },
    { match: '/employee', redirect: '/employee/dashboard' },
] as const

const stripLocale = (pathname: string): { locale: string; rest: string } => {
    const segments = pathname.split('/').filter(Boolean)
    if (segments[0] === 'en' || segments[0] === 'fa') {
        return { locale: segments[0], rest: '/' + segments.slice(1).join('/') }
    }
    return { locale: 'en', rest: pathname }
}

const isAuthRequired = (
    pathname: string,
): { requireAuth: true; redirect: string; locale: string } | null => {
    const { locale, rest } = stripLocale(pathname)
    for (const rule of PROTECTED) {
        if (rest === rule.match || rest.startsWith(`${rule.match}/`)) {
            return { requireAuth: true, redirect: rule.redirect, locale }
        }
    }
    return null
}

export function proxy(request: NextRequest) {
    const guard = isAuthRequired(request.nextUrl.pathname)
    if (!guard) return NextResponse.next()

    const token = request.cookies.get(COOKIE_NAME)?.value
    if (token) return NextResponse.next()

    const loginUrl = new URL(`/${guard.locale}/login`, request.url)
    loginUrl.searchParams.set('redirect', `/${guard.locale}${guard.redirect}`)
    return NextResponse.redirect(loginUrl)
}

export const config = {
    matcher: [
        '/en/account/:path*',
        '/fa/account/:path*',
        '/en/orders/:path*',
        '/fa/orders/:path*',
        '/en/checkout/:path*',
        '/fa/checkout/:path*',
        '/en/employee/:path*',
        '/fa/employee/:path*',
    ],
}