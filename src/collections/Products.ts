import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'

import { adminOnly, anyone, employeeOrAdmin } from '@/access/byRole'
import { localizedSlugify } from '@/lib/slugify'

export const Products: CollectionConfig = {
    slug: 'products',
    admin: {
        useAsTitle: 'name',
        defaultColumns: ['name', 'brand', 'price', 'stock', 'featured'],
    },
    access: {
        read: anyone,
        create: employeeOrAdmin,
        update: employeeOrAdmin,
        delete: adminOnly,
    },
    fields: [
        {
            name: 'name',
            type: 'text',
            required: true,
            localized: true,
        },
        slugField({
            fieldToUse: 'name',
            slugify: localizedSlugify,
        }),
        {
            name: 'brand',
            type: 'relationship',
            relationTo: 'brands',
            required: true,
        },
        {
            name: 'description',
            type: 'richText',
            localized: true,
        },
        {
            name: 'images',
            type: 'array',
            labels: {
                singular: 'تصویر',
                plural: 'تصاویر',
            },
            fields: [
                {
                    name: 'image',
                    type: 'upload',
                    relationTo: 'media',
                    required: true,
                },
                {
                    name: 'caption',
                    type: 'text',
                },
            ],
        },
        {
            name: 'specifications',
            type: 'group',
            label: 'مشخصات فنی',
            fields: [
                { name: 'size', type: 'text', label: 'سایز', localized: true },
                { name: 'thickness', type: 'text', label: 'ضخامت', localized: true },
                { name: 'weight', type: 'text', label: 'وزن', localized: true },
                { name: 'application', type: 'text', label: 'کاربرد', localized: true },
            ],
        },
        {
            name: 'price',
            type: 'number',
            required: true,
            min: 0,
            admin: {
                description: 'قیمت به تومان',
            },
        },
        {
            name: 'stock',
            type: 'number',
            defaultValue: 0,
            min: 0,
            admin: {
                description: 'موجودی انبار',
            },
        },
        {
            name: 'categories',
            type: 'relationship',
            relationTo: 'categories',
            hasMany: true,
        },
        {
            name: 'featured',
            type: 'checkbox',
            defaultValue: false,
            admin: {
                description: 'نمایش در محصولات ویژه صفحه اصلی',
            },
        },
    ],
}