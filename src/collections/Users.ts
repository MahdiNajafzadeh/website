import type { CollectionConfig } from 'payload'
import { isAdmin } from '../access/index'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'phone',
  },
  auth: {
    tokenExpiration: 86400,
  },
  access: {
    read: ({ req }) => {
      const user = req.user as { role?: string; id?: number } | undefined
      if (!user) return false
      if (user.role === 'admin' || user.role === 'employee') return true
      return {
        id: { equals: user.id },
      }
    },
    create: () => true,
    update: ({ req, id }) => {
      const user = req.user as { role?: string; id?: number } | undefined
      if (!user) return false
      if (user.role === 'admin') return true
      // Employee cannot update roles, but can update own profile; simplified
      if (user.role === 'employee' && id !== user.id) return false
      if (id && user.id === id) return true
      return false
    },
    delete: isAdmin,
  },
  fields: [
    {
      name: 'firstName',
      type: 'text',
      required: true,
    },
    {
      name: 'lastName',
      type: 'text',
      required: true,
    },
    {
      name: 'phone',
      type: 'text',
      required: true,
      unique: true,
      validate: (value: unknown) => {
        if (typeof value !== 'string' || value.length === 0) {
          return true
        }
        if (!/^09\d{9}$/.test(value)) {
          return 'Invalid Iranian mobile number. Must be 11 digits starting with 09 (e.g. 09123456789).'
        }
        return true
      },
    },
    {
      name: 'address',
      type: 'textarea',
      required: false,
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'customer',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Employee', value: 'employee' },
        { label: 'Customer', value: 'customer' },
      ],
    },
    {
      name: 'customerType',
      type: 'select',
      required: true,
      defaultValue: 'regular',
      options: [
        { label: 'Regular', value: 'regular' },
        { label: 'Partner', value: 'partner' },
      ],
    },
  ],
}
