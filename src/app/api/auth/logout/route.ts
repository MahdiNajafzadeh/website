import { cookies as getCookies, headers as getHeaders } from 'next/headers'
import { NextResponse } from 'next/server'
import { getPayload } from 'payload'

import config from '@payload-config'

export const POST = async () => {
    const headers = await getHeaders()
    const cookies = await getCookies()
    const payload = await getPayload({ config })

    try {
        await payload.logout({ headers })
    } catch {
        // even if the session was already invalid, clear the cookie
    }

    const response = NextResponse.json({ message: 'Logged out' }, { status: 200 })
    for (const cookie of cookies.getAll()) {
        if (cookie.name.startsWith('payload-')) {
            response.cookies.set({
                name: cookie.name,
                value: '',
                maxAge: 0,
                path: '/',
            })
        }
    }
    return response
}
