import 'server-only'

import { headers as getHeaders } from 'next/headers.js'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'

import config from '@payload-config'

import { DEFAULT_LOCALE, isLocale, type Locale } from '@/lib/locale'
import type { User } from '@/payload-types'

export type SafeUser = Pick<User, 'id' | 'email' | 'name' | 'role'>

export const getCurrentUser = async (): Promise<SafeUser | null> => {
    const headers = await getHeaders()
    const payload = await getPayload({ config })
    const { user } = await payload.auth({ headers })
    if (!user) return null
    return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
    }
}

const localeFromPath = (path: string | undefined): Locale => {
    if (!path) return DEFAULT_LOCALE
    const first = path.split('/').filter(Boolean)[0]
    return isLocale(first) ? first : DEFAULT_LOCALE
}

export const requireUser = async (redirectTo?: string): Promise<SafeUser> => {
    const user = await getCurrentUser()
    if (!user) {
        const next = redirectTo ?? `/${DEFAULT_LOCALE}/account`
        const locale = localeFromPath(next)
        redirect(`/${locale}/login?redirect=${encodeURIComponent(next)}`)
    }
    return user
}

export const requireRole = async (
    roles: ReadonlyArray<User['role']>,
    redirectTo?: string,
): Promise<SafeUser> => {
    const user = await requireUser(redirectTo)
    if (!roles.includes(user.role)) {
        if (redirectTo) redirect(redirectTo)
        redirect(`/${localeFromPath(redirectTo) || DEFAULT_LOCALE}`)
    }
    return user
}
