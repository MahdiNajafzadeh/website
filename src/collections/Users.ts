import type { CollectionConfig } from 'payload'

import { adminOnly, selfOrAdmin } from '@/access/byRole'

// ponytail: keep `auth: true` so Payload's built-in email/password still works
// internally; the public surface authenticates by phone. Email is synthesized
// at register/login time and never persisted for phone-only users.
export const Users: CollectionConfig = {
    slug: 'users',
    auth: {
        tokenExpiration: 60 * 60 * 24 * 7,
        maxLoginAttempts: 5,
        lockTime: 60 * 10 * 1000,
        useAPIKey: false,
    },
    admin: {
        useAsTitle: 'firstName',
        defaultColumns: ['firstName', 'lastName', 'phone', 'role', 'createdAt'],
    },
    access: {
        create: () => true,
        read: selfOrAdmin,
        update: selfOrAdmin,
        delete: adminOnly,
        admin: ({ req: { user } }) => Boolean(user),
    },
    fields: [
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
            index: true,
            admin: {
                description: 'شماره موبایل - شناسه ورود',
            },
        },
        {
            name: 'role',
            type: 'select',
            required: true,
            defaultValue: 'customer',
            options: [
                { label: 'مشتری', value: 'customer' },
                { label: 'کارمند', value: 'employee' },
                { label: 'مدیر', value: 'admin' },
            ],
            saveToJWT: true,
            access: {
                update: ({ req: { user } }) => (user as { role?: string } | null)?.role === 'admin',
            },
            admin: {
                description: 'ادمین می‌تواند نقش کاربران را تغییر دهد.',
            },
        },
        {
            name: 'firstLoginAt',
            type: 'date',
            admin: {
                description: 'تاریخ اولین ورود موفق',
            },
        },
        {
            name: 'addresses',
            type: 'array',
            labels: {
                singular: 'آدرس',
                plural: 'آدرس‌ها',
            },
            fields: [
                {
                    name: 'label',
                    type: 'text',
                    admin: {
                        description: 'مثال: خانه، محل کار',
                    },
                },
                { name: 'fullName', type: 'text', required: true },
                { name: 'phone', type: 'text', required: true },
                { name: 'address', type: 'textarea', required: true },
                { name: 'city', type: 'text', required: true },
                { name: 'province', type: 'text', required: true },
                {
                    name: 'default',
                    type: 'checkbox',
                    defaultValue: false,
                },
            ],
        },
    ],
}
