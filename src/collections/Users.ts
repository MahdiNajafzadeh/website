import type { CollectionConfig } from 'payload'

import { adminOnly, selfOrAdmin } from '@/access/byRole'

export const Users: CollectionConfig = {
    slug: 'users',
    auth: {
        tokenExpiration: 60 * 60 * 24 * 7,
        maxLoginAttempts: 5,
        lockTime: 60 * 10 * 1000,
        useAPIKey: false,
    },
    admin: {
        useAsTitle: 'email',
        defaultColumns: ['name', 'email', 'role', 'createdAt'],
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
            name: 'name',
            type: 'text',
            required: true,
        },
        {
            name: 'phone',
            type: 'text',
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