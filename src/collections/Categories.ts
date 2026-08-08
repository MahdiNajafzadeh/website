import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'

import { adminOnly, anyone, employeeOrAdmin } from '@/access/byRole'

export const Categories: CollectionConfig = {
    slug: 'categories',
    admin: {
        useAsTitle: 'name',
        defaultColumns: ['name', 'slug'],
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
            name: 'description',
            type: 'textarea',
        },
    ],
}