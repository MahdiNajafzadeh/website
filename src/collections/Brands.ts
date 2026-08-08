import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'

import { adminOnly, anyone, employeeOrAdmin } from '@/access/byRole'

export const Brands: CollectionConfig = {
    slug: 'brands',
    admin: {
        useAsTitle: 'name',
        defaultColumns: ['name', 'slug', 'order'],
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
        },
        slugField({
            fieldToUse: 'name',
        }),
        {
            name: 'logo',
            type: 'upload',
            relationTo: 'media',
        },
        {
            name: 'description',
            type: 'richText',
        },
        {
            name: 'order',
            type: 'number',
            defaultValue: 0,
            admin: {
                description: 'ترتیب نمایش در صفحه برندها (کمتر = بالاتر)',
            },
        },
    ],
}