import type { CollectionConfig } from 'payload'

import { adminOnly, authenticated, employeeOrAdmin, ownerOrStaff } from '@/access/byRole'

const STATUS_OPTIONS = [
    { label: 'در انتظار پرداخت', value: 'pending' },
    { label: 'در حال پردازش', value: 'processing' },
    { label: 'ارسال شد', value: 'shipped' },
    { label: 'تحویل شد', value: 'delivered' },
    { label: 'لغو شد', value: 'cancelled' },
] as const

// ponytail: only recompute total on update. Customer checkout already
// sends the correct total on create (Cart total = sum(items.price * qty)),
// so we leave the customer create path untouched to avoid a redundant hook.
//
// PATCH /api/orders/:id with `{ items: [{ id, price }] }` sends a partial
// row — only `id` and the changed field. We must merge with the original
// doc to recover the unchanged `quantity` (and original `price` if missing).
const recalcTotal: import('payload').CollectionBeforeChangeHook = ({
    data,
    originalDoc,
    operation,
}) => {
    if (operation !== 'update') return data
    if (!Array.isArray(data?.items)) return data
    const existingRows: Array<{
        id?: string | null
        price?: number | null
        quantity?: number | null
    }> = Array.isArray(originalDoc?.items) ? originalDoc.items : []
    const updatedById = new Map<string, { price?: number | null; quantity?: number | null }>()
    for (const row of data.items as Array<{ id?: string | null; price?: number | null; quantity?: number | null }>) {
        if (row.id) updatedById.set(String(row.id), row)
    }
    const merged: Array<{ price?: number | null; quantity?: number | null }> =
        updatedById.size > 0
            ? existingRows.map((row) => {
                  const override = row.id ? updatedById.get(String(row.id)) : undefined
                  return override ? { ...row, ...override } : row
              })
            : (data.items as Array<{ price?: number | null; quantity?: number | null }>)
    const total = merged.reduce((sum, item) => {
        const qty = Number(item?.quantity ?? 0)
        const price = Number(item?.price ?? 0)
        return sum + (Number.isFinite(qty) && Number.isFinite(price) ? qty * price : 0)
    }, 0)
    return { ...data, total }
}

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
    hooks: {
        beforeChange: [recalcTotal],
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