import type { CollectionConfig } from 'payload'

import { adminOnly, employeeOrAdmin } from '@/access/byRole'

export const Media: CollectionConfig = {
    slug: 'media',
    access: {
        read: () => true,
        create: employeeOrAdmin,
        update: employeeOrAdmin,
        delete: adminOnly,
    },
    upload: {
        staticDir: 'media',
        mimeTypes: ['image/*'],
        imageSizes: [
            { name: 'thumbnail', width: 400, height: 400, position: 'centre' },
            { name: 'card', width: 768, height: 1024 },
            { name: 'hero', width: 1920, height: 1080 },
        ],
        adminThumbnail: 'thumbnail',
        focalPoint: true,
        crop: true,
    },
    fields: [
        {
            name: 'alt',
            type: 'text',
            required: true,
        },
        {
            name: 'caption',
            type: 'text',
        },
    ],
}