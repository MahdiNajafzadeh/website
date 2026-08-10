import { NextResponse } from 'next/server'
import { getPayload } from 'payload'

import { setAuthCookie } from '@/lib/auth-cookie'
import config from '@payload-config'

// ponytail: phone is the public identifier; we synthesize a per-phone
// "<digits>@phone.local" email only in-memory for payload.login() because
// Payload's auth still requires an email internally. We never persist it.
const digitsOf = (s: string): string => String(s ?? '').replace(/\D+/g, '')

const isValidPhone = (s: string): boolean => digitsOf(s).length === 11

export const POST = async (request: Request): Promise<Response> => {
    let body: { phone?: unknown; password?: unknown }
    try {
        body = (await request.json()) as typeof body
    } catch {
        return NextResponse.json({ message: 'Invalid JSON' }, { status: 400 })
    }

    const phone = typeof body.phone === 'string' ? body.phone.trim() : ''
    const password = typeof body.password === 'string' ? body.password : ''

    if (!isValidPhone(phone) || !password) {
        return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 })
    }

    const phoneDigits = digitsOf(phone)
    const payload = await getPayload({ config })

    const result = await payload.find({
        collection: 'users',
        where: { phone: { equals: phoneDigits } },
        limit: 1,
        overrideAccess: true,
        depth: 0,
    })
    const user = result.docs[0]

    if (!user) {
        return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 })
    }

    const email = (user as { email?: string | null }).email?.endsWith('@phone.local')
        ? (user as { email: string }).email
        : `${phoneDigits}@phone.local`

    let loginResult
    try {
        loginResult = await payload.login({
            collection: 'users',
            data: { email, password },
        })
    } catch {
        return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 })
    }

    if (!loginResult.token || !loginResult.user) {
        return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 })
    }

    // Mark first successful login. We do not mutate the password.
    if (!(loginResult.user as { firstLoginAt?: string | null }).firstLoginAt) {
        try {
            await payload.update({
                collection: 'users',
                id: loginResult.user.id,
                data: { firstLoginAt: new Date().toISOString() },
                overrideAccess: true,
            })
        } catch {
            // ponytail: non-fatal; login still succeeds.
        }
    }

    const collectionConfig = payload.collections['users']?.config
    if (collectionConfig) {
        await setAuthCookie({
            authConfig: collectionConfig.auth,
            cookiePrefix: payload.config.cookiePrefix,
            token: loginResult.token,
        })
    }

    return NextResponse.json({
        user: {
            id: loginResult.user.id,
            role: (loginResult.user as { role?: string }).role,
            phone: phoneDigits,
        },
    })
}
