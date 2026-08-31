import type { CollectionConfig } from 'payload'
import { isAdminOrEmployee } from '../access/index'

const slugify = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')

export const Categories: CollectionConfig = {
  slug: 'categories',
  admin: {
    useAsTitle: 'name',
  },
  access: {
    read: () => true,
    create: isAdminOrEmployee,
    update: isAdminOrEmployee,
    delete: isAdminOrEmployee,
  },
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (data) {
          const d = data as Record<string, unknown>
          if (!d.slug && typeof d.name === 'string' && d.name.trim().length > 0) {
            d.slug = slugify(d.name)
          } else if (typeof d.slug === 'string' && d.slug.length > 0) {
            d.slug = slugify(d.slug)
          }
        }
        return data
      },
    ],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: false,
      unique: true,
      index: true,
      admin: {
        description: 'Auto-generated from name if left empty.',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      required: false,
    },
  ],
}
