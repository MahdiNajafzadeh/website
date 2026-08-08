import type { CollectionConfig } from 'payload'

import { adminOnly, authenticated, employeeOrAdmin, ownerOrStaff } from '@/access/byRole'

const STATUS_OPTIONS = [
    { label: 'در انتظار پرداخت', value: 'pending' },
    { label: 'در حال پردازش', value: 'processing' },
    { label: 'ارسال شد', value: 'shipped' },
    { label: 'تحویل شد', value: 'delivered' },
    { label: 'لغو شد', value: 'cancelled' },
] as const

export const Orders: CollectionConfig = {
    slug: 'orders',
    admin: {
        useAsTitle: 'id',
        defaultColumns: ['id', 'user', 'status', 'total', 'createdAt'],
    },
    access: {
        read: ownerOrStaff,
        create: authenticated,
        update: employeeOrAdmin,
        delete: adminOnly,
    },
    fields: [
        {
            name: 'user',
            type: 'relationship',
            relationTo: 'users',
            required: true,
            index: true,
        },
        {
            name: 'items',
            type: 'array',
            labels: {
                singular: 'آیتم',
                plural: 'آیتم‌ها',
            },
            required: true,
            minRows: 1,
            fields: [
                {
                    name: 'product',
                    type: 'relationship',
                    relationTo: 'products',
                    required: true,
                },
                {
                    name: 'quantity',
                    type: 'number',
                    required: true,
                    min: 1,
                },
                {
                    name: 'price',
                    type: 'number',
                    required: true,
                    min: 0,
                    admin: {
                        description: 'قیمت واحد در زمان ثبت سفارش (تومان)',
                    },
                },
            ],
        },
        {
            name: 'status',
            type: 'select',
            required: true,
            defaultValue: 'pending',
            options: [...STATUS_OPTIONS],
            admin: {
                position: 'sidebar',
            },
        },
        {
            name: 'total',
            type: 'number',
            required: true,
            min: 0,
            admin: {
                description: 'مجموع کل سفارش (تومان)',
            },
        },
        {
            name: 'shippingAddress',
            type: 'group',
            label: 'آدرس ارسال',
            fields: [
                { name: 'fullName', type: 'text', required: true },
                { name: 'phone', type: 'text', required: true },
                { name: 'address', type: 'textarea', required: true },
                { name: 'city', type: 'text', required: true },
                { name: 'province', type: 'text', required: true },
            ],
        },
        {
            name: 'notes',
            type: 'textarea',
        },
    ],
}