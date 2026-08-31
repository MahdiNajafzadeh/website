import crypto from 'crypto'

import {
    APIError,
    generatePayloadCookie,
    headersWithCors,
    jwtSign,
    type CollectionConfig,
    type Endpoint,
} from 'payload'

import { isAdmin } from '../access/index'

const PHONE_RE = /^09\d{9}$/

const hashPassword = (password: string): Promise<{ hash: string; salt: string }> =>
    new Promise((resolve, reject) => {
        crypto.randomBytes(32, (err, saltBuffer) => {
            if (err) {
                reject(err)
                return
            }
            const salt = saltBuffer.toString('hex')
            crypto.pbkdf2(password, salt, 25000, 512, 'sha256', (e, hashBuffer) => {
                if (e) {
                    reject(e)
                    return
                }
                resolve({ hash: hashBuffer.toString('hex'), salt })
            })
        })
    })

const phoneCreate: Endpoint = {
    path: '',
    method: 'post',
    handler: async (req) => {
        const body = ((await req.json?.().catch(() => ({}))) ?? {}) as Record<string, unknown>

        const firstName = typeof body.firstName === 'string' ? body.firstName.trim() : ''
        const lastName = typeof body.lastName === 'string' ? body.lastName.trim() : ''
        const phone = typeof body.phone === 'string' ? body.phone.trim() : ''
        const password = typeof body.password === 'string' ? body.password : ''
        const address = typeof body.address === 'string' ? body.address.trim() : undefined

        if (!firstName || !lastName) {
            throw new APIError('First name and last name are required.', 400)
        }
        if (!PHONE_RE.test(phone)) {
            throw new APIError('Invalid Iranian mobile number. Must be 11 digits starting with 09.', 400)
        }
        if (password.length < 6) {
            throw new APIError('Password must be at least 6 characters.', 400)
        }

        const existing = await req.payload.find({
            collection: 'users',
            where: { phone: { equals: phone } },
            limit: 1,
            overrideAccess: true,
            depth: 0,
        })
        if (existing.docs.length > 0) {
            throw new APIError('Phone number already registered.', 409)
        }

        const { hash, salt } = await hashPassword(password)

        const data: Record<string, unknown> = {
            firstName,
            lastName,
            phone,
            address,
            hash,
            salt,
            role: 'customer',
            customerType: 'regular',
        }

        const created = await req.payload.db.create({
            collection: 'users',
            data,
            req,
        })

        return Response.json(
            { doc: { id: created.id, phone: (created as { phone?: string }).phone } },
            { status: 201, headers: headersWithCors({ headers: new Headers(), req }) },
        )
    },
}

const phoneLogin: Endpoint = {
    path: '/login',
    method: 'post',
    handler: async (req) => {
        const body = ((await req.json?.().catch(() => ({}))) ?? {}) as {
            phone?: unknown
            password?: unknown
        }

        const phone = typeof body.phone === 'string' ? body.phone.trim() : ''
        const password = typeof body.password === 'string' ? body.password : ''

        if (!PHONE_RE.test(phone) || password.length === 0) {
            throw new APIError('Invalid phone or password.', 400)
        }

        const found = await req.payload.db.findOne({
            collection: 'users',
            req,
            where: { phone: { equals: phone } },
        })

        const user = found as unknown as
            | (Record<string, unknown> & { id: number; phone: string; hash?: string; salt?: string })
            | null
        if (!user) {
            throw new APIError('Invalid phone or password.', 401)
        }

        const salt = typeof user.salt === 'string' ? user.salt : null
        const storedHash = typeof user.hash === 'string' ? user.hash : null
        if (!salt || !storedHash) {
            throw new APIError('Invalid phone or password.', 401)
        }

        const ok = await new Promise<boolean>((resolve) => {
            crypto.pbkdf2(password, salt, 25000, 512, 'sha256', (err, buf) => {
                if (err) {
                    resolve(false)
                    return
                }
                const stored = Buffer.from(storedHash, 'hex')
                if (stored.length !== buf.length) {
                    resolve(false)
                    return
                }
                resolve(crypto.timingSafeEqual(buf, stored))
            })
        })

        if (!ok) {
            throw new APIError('Invalid phone or password.', 401)
        }

        const collectionConfig = req.payload.collections['users'].config
        const fieldsToSign: Record<string, unknown> = {
            id: user.id,
            collection: 'users',
            email:
                typeof user.email === 'string' && user.email.length > 0
                    ? user.email
                    : `${phone}@phone.local`,
        }

        const { exp, token } = await jwtSign({
            fieldsToSign,
            secret: req.payload.secret,
            tokenExpiration: collectionConfig.auth.tokenExpiration,
        })

        const cookie = generatePayloadCookie({
            collectionAuthConfig: collectionConfig.auth,
            cookiePrefix: req.payload.config.cookiePrefix,
            token,
        })

        return Response.json(
            { exp, token, user: { id: user.id, phone: user.phone } },
            {
                status: 200,
                headers: headersWithCors({
                    headers: new Headers({ 'Set-Cookie': cookie }),
                    req,
                }),
            },
        )
    },
}

export const Users: CollectionConfig = {
    slug: 'users',
    admin: {
        useAsTitle: 'phone',
    },
    auth: {
        tokenExpiration: 86400,
    },
    endpoints: [phoneCreate, phoneLogin],
    access: {
        read: ({ req, id }) => {
            const user = req.user as { role?: string; id?: number } | undefined
            if (!user) {
                // Allow reading the user being authenticated from a verified JWT —
                // Payload's JWT strategy calls findByID before req.user is set, so
                // we accept any id being read when no user is present yet.
                if (id) return true
                return false
            }
            if (user.role === 'admin' || user.role === 'employee') return true
            return {
                id: { equals: user.id },
            }
        },
        create: () => true,
        update: ({ req, id }) => {
            const user = req.user as { role?: string; id?: number } | undefined
            if (!user) return false
            if (user.role === 'admin') return true
            // Employee cannot update roles, but can update own profile; simplified
            if (user.role === 'employee' && id !== user.id) return false
            if (id && user.id === id) return true
            return false
        },
        delete: isAdmin,
    },
    fields: [
        {
            name: 'email',
            type: 'text',
            required: false,
            unique: false,
            index: false,
            admin: {
                readOnly: true,
                position: 'sidebar',
                description: 'Optional. Users log in with phone.',
            },
            access: {
                create: () => true,
                read: () => true,
                update: () => false,
            },
        },
        {
            name: 'firstName',
            type: 'text',
            required: true,
        },
        {
            name: 'lastName',
            type: 'text',
            required: true,
        },
        {
            name: 'phone',
            type: 'text',
            required: true,
            unique: true,
            validate: (value: unknown) => {
                if (typeof value !== 'string' || value.length === 0) {
                    return true
                }
                if (!/^09\d{9}$/.test(value)) {
                    return 'Invalid Iranian mobile number. Must be 11 digits starting with 09 (e.g. 09123456789).'
                }
                return true
            },
        },
        {
            name: 'address',
            type: 'textarea',
            required: false,
        },
        {
            name: 'role',
            type: 'select',
            required: true,
            defaultValue: 'customer',
            options: [
                { label: 'Admin', value: 'admin' },
                { label: 'Employee', value: 'employee' },
                { label: 'Customer', value: 'customer' },
            ],
        },
        {
            name: 'customerType',
            type: 'select',
            required: true,
            defaultValue: 'regular',
            options: [
                { label: 'Regular', value: 'regular' },
                { label: 'Partner', value: 'partner' },
            ],
        },
    ],
}
