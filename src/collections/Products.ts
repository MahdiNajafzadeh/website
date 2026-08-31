import type { CollectionConfig } from 'payload'
import { isAdminOrEmployee, readVisibleOnly } from '../access/index'

const slugify = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')

export const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    useAsTitle: 'name',
  },
  access: {
    read: readVisibleOnly,
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
      name: 'visible',
      type: 'checkbox',
      defaultValue: false,
      required: false,
    },
    {
      name: 'price',
      type: 'number',
      defaultValue: 0,
      min: 0,
      required: false,
    },
    {
      name: 'inventory',
      type: 'number',
      defaultValue: 0,
      min: 0,
      required: false,
    },
    {
      name: 'brand',
      type: 'relationship',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      relationTo: 'brands' as any,
      hasMany: false,
      required: false,
    },
    {
      name: 'category',
      type: 'relationship',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      relationTo: 'categories' as any,
      hasMany: false,
      required: false,
    },
    {
      name: 'images',
      type: 'array',
      required: false,
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
      ],
    },
    {
      name: 'showcaseImage',
      type: 'upload',
      relationTo: 'media',
      required: false,
    },
  ],
}
