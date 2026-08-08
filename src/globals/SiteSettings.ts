import type { GlobalConfig } from 'payload'

import { adminOnly, anyone } from '@/access/byRole'

export const SiteSettings: GlobalConfig = {
    slug: 'site-settings',
    admin: {
        group: 'تنظیمات',
    },
    access: {
        read: anyone,
        update: adminOnly,
    },
    fields: [
        {
            name: 'siteName',
            type: 'text',
            defaultValue: 'آبفارین',
        },
        {
            name: 'logo',
            type: 'upload',
            relationTo: 'media',
        },
        {
            name: 'contactInfo',
            type: 'group',
            label: 'اطلاعات تماس',
            fields: [
                {
                    name: 'phones',
                    type: 'array',
                    labels: { singular: 'تلفن', plural: 'تلفن‌ها' },
                    fields: [
                        { name: 'label', type: 'text', required: true, admin: { description: 'مثال: دفتر مرکزی، پشتیبانی' } },
                        { name: 'number', type: 'text', required: true },
                        {
                            name: 'isPrimary',
                            type: 'checkbox',
                            defaultValue: false,
                            admin: { description: 'شماره اصلی' },
                        },
                    ],
                },
                {
                    name: 'emails',
                    type: 'array',
                    labels: { singular: 'ایمیل', plural: 'ایمیل‌ها' },
                    fields: [
                        { name: 'label', type: 'text', required: true, admin: { description: 'مثال: info، پشتیبانی' } },
                        { name: 'email', type: 'email', required: true },
                        {
                            name: 'isPrimary',
                            type: 'checkbox',
                            defaultValue: false,
                            admin: { description: 'ایمیل اصلی' },
                        },
                    ],
                },
                {
                    name: 'addresses',
                    type: 'array',
                    labels: { singular: 'آدرس', plural: 'آدرس‌ها' },
                    fields: [
                        { name: 'label', type: 'text', required: true, admin: { description: 'مثال: دفتر مرکزی، انبار' } },
                        { name: 'address', type: 'textarea', required: true },
                        {
                            name: 'isPrimary',
                            type: 'checkbox',
                            defaultValue: false,
                            admin: { description: 'آدرس اصلی' },
                        },
                    ],
                },
            ],
        },
        {
            name: 'socialLinks',
            type: 'array',
            labels: { singular: 'پیام‌رسان', plural: 'پیام‌رسان‌ها' },
            admin: {
                description: 'برای هر مورد، فایل لوگو را آپلود کنید. اگر آیکون آپلود نشود، اولین حرف نام به‌عنوان جایگزین نمایش داده می‌شود.',
            },
            fields: [
                {
                    name: 'name',
                    type: 'text',
                    required: true,
                    admin: { description: 'نام پلتفرم، مثلاً WhatsApp یا تلگرام' },
                },
                {
                    name: 'label',
                    type: 'text',
                    required: true,
                    admin: { description: 'نام نمایشی در سایت، مثلاً «پشتیبانی واتساپ»' },
                },
                {
                    name: 'description',
                    type: 'textarea',
                    admin: { description: 'توضیح کوتاه (اختیاری)؛ در فوتر به‌صورت tooltip نمایش داده می‌شود.' },
                },
                {
                    name: 'url',
                    type: 'text',
                    required: true,
                    admin: { description: 'لینک کامل صفحه یا کانال' },
                },
                {
                    name: 'icon',
                    type: 'upload',
                    relationTo: 'media',
                    admin: { description: 'لوگوی پلتفرم (اختیاری). فرمت‌های image/* مجاز است.' },
                },
                {
                    name: 'order',
                    type: 'number',
                    defaultValue: 0,
                    admin: { description: 'ترتیب نمایش (کمتر = بالاتر)' },
                },
            ],
        },
        {
            name: 'footerText',
            type: 'richText',
        },
        {
            name: 'brandLogos',
            type: 'array',
            labels: { singular: 'لوگوی برند', plural: 'لوگوهای برندها' },
            fields: [
                {
                    name: 'image',
                    type: 'upload',
                    relationTo: 'media',
                    required: true,
                },
                {
                    name: 'link',
                    type: 'text',
                },
                {
                    name: 'alt',
                    type: 'text',
                    required: true,
                },
            ],
        },
    ],
}