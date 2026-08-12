import { cookies as getCookies, headers as getHeaders } from 'next/headers'
import { NextResponse } from 'next/server'
import { createLocalReq, getPayload, logoutOperation } from 'payload'

import config from '@payload-config'

export const POST = async () => {
    const headers = await getHeaders()
    const cookies = await getCookies()
    const payload = await getPayload({ config })

    try {
        const authResult = await payload.auth({ headers })
        if (authResult.user) {
            const req = await createLocalReq({ user: authResult.user }, payload)
            const collection = payload.collections[authResult.user.collection]
            await logoutOperation({ collection, req })
        }
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
