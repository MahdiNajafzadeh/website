import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'
import { isAdminOrEmployee } from '../access/index'

export const Brands: CollectionConfig = {
  slug: 'brands',
  admin: {
    useAsTitle: 'name',
  },
  access: {
    read: () => true,
    create: isAdminOrEmployee,
    update: isAdminOrEmployee,
    delete: isAdminOrEmployee,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    slugField({ useAsSlug: 'name', position: undefined }),
    {
      name: 'icon',
      type: 'upload',
      relationTo: 'media',
      required: false,
    },
    {
      name: 'description',
      type: 'textarea',
      required: false,
    },
  ],
}
