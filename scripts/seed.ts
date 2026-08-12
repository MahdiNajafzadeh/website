import 'dotenv/config'

import { getPayload } from 'payload'
import config from '../src/payload.config.js'

import {
    SEED_BRANDS,
    SEED_CATEGORIES,
    SEED_PRODUCTS,
    SEED_SITE_SETTINGS,
    SEED_USERS,
} from './seed-data.js'

const LOCALES = ['en', 'fa'] as const
type Locale = (typeof LOCALES)[number]

const log = (msg: string): void => {
    process.stdout.write(`[seed] ${msg}\n`)
}

const warn = (msg: string): void => {
    process.stdout.write(`[seed] WARN: ${msg}\n`)
}

const matchSlug = (raw: unknown, target: string): boolean => raw === target

// Minimal Lexical editor state wrapping a single paragraph of plain text.
type RichTextState = {
    root: {
        type: string
        children: { type: any; version: number; [k: string]: unknown }[]
        direction: 'ltr' | 'rtl' | null
        format: 'left' | 'start' | 'center' | 'right' | 'end' | 'justify' | ''
        indent: number
        version: number
    }
    [k: string]: unknown
}

const makeRichText = (text: string): RichTextState => ({
    root: {
        type: 'root',
        children: [
            {
                type: 'paragraph',
                children: [
                    {
                        type: 'text',
                        detail: 0,
                        format: 0,
                        mode: 'normal',
                        style: '',
                        text,
                        version: 1,
                    },
                ],
                direction: 'ltr',
                format: '',
                indent: 0,
                textFormat: 0,
                version: 1,
            },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
    },
})

const findBrandBySlug = async (
    payload: Awaited<ReturnType<typeof getPayload>>,
    slug: string,
): Promise<{ id: number; slug: string } | null> => {
    const result = await payload.find({
        collection: 'brands',
        limit: 100,
        depth: 0,
        locale: 'en',
    })
    const docs = result.docs as Array<{ id: number; slug: unknown }>
    const match = docs.find((d) => matchSlug(d.slug, slug))
    if (!match) return null
    return { id: match.id, slug }
}

const findCategoryBySlug = async (
    payload: Awaited<ReturnType<typeof getPayload>>,
    slug: string,
): Promise<{ id: number; slug: string } | null> => {
    const result = await payload.find({
        collection: 'categories',
        limit: 100,
        depth: 0,
        locale: 'en',
    })
    const docs = result.docs as Array<{ id: number; slug: unknown }>
    const match = docs.find((d) => matchSlug(d.slug, slug))
    if (!match) return null
    return { id: match.id, slug }
}

const findProductByEnSlug = async (
    payload: Awaited<ReturnType<typeof getPayload>>,
    slug: string,
): Promise<{ id: number } | null> => {
    const result = await payload.find({
        collection: 'products',
        limit: 500,
        depth: 0,
        locale: 'en',
    })
    const docs = result.docs as Array<{ id: number; slug: unknown }>
    const match = docs.find((d) => matchSlug(d.slug, slug))
    if (!match) return null
    return { id: match.id }
}

const ensureBrands = async (
    payload: Awaited<ReturnType<typeof getPayload>>,
): Promise<Map<string, { id: number }>> => {
    const map = new Map<string, { id: number }>()
    for (const brand of SEED_BRANDS) {
        const existing = await findBrandBySlug(payload, brand.slug)
        const localized = (locale: Locale) => ({
            name: brand.name[locale],
            description: makeRichText(brand.description[locale]),
        })
        if (existing) {
            for (const locale of LOCALES) {
                await payload.update({
                    collection: 'brands',
                    id: existing.id,
                    data: {
                        ...localized(locale),
                        slug: brand.slug || brand.name.en,
                        order: brand.order,
                        generateSlug: false,
                    },
                    locale,
                    overrideAccess: true,
                })
            }
            log(`brand "${brand.name.en}" updated (id=${existing.id})`)
            map.set(brand.slug, { id: existing.id })
            continue
        }
        const created = await payload.create({
            collection: 'brands',
            data: {
                ...localized('en'),
                slug: brand.slug || brand.name.en,
                order: brand.order,
                generateSlug: false,
            },
            locale: 'en',
            overrideAccess: true,
        })
        await payload.update({
            collection: 'brands',
            id: created.id,
            data: localized('fa'),
            locale: 'fa',
            overrideAccess: true,
        })
        log(`brand "${brand.name.en}" created (id=${created.id})`)
        map.set(brand.slug, { id: created.id })
    }
    return map
}

const ensureCategories = async (
    payload: Awaited<ReturnType<typeof getPayload>>,
): Promise<Map<string, { id: number }>> => {
    const map = new Map<string, { id: number }>()
    for (const cat of SEED_CATEGORIES) {
        const existing = await findCategoryBySlug(payload, cat.slug)
        const localized = (locale: Locale) => ({
            name: cat.name[locale],
        })
        if (existing) {
            for (const locale of LOCALES) {
                await payload.update({
                    collection: 'categories',
                    id: existing.id,
                    data: {
                        ...localized(locale),
                        slug: cat.slug || cat.name.en,
                        description: cat.description,
                        generateSlug: false,
                    },
                    locale,
                    overrideAccess: true,
                })
            }
            log(`category "${cat.name.en}" updated (id=${existing.id})`)
            map.set(cat.slug, { id: existing.id })
            continue
        }
        const created = await payload.create({
            collection: 'categories',
            data: {
                ...localized('en'),
                slug: cat.slug || cat.name.en,
                description: cat.description,
                generateSlug: false,
            },
            locale: 'en',
            overrideAccess: true,
        })
        await payload.update({
            collection: 'categories',
            id: created.id,
            data: localized('fa'),
            locale: 'fa',
            overrideAccess: true,
        })
        log(`category "${cat.name.en}" created (id=${created.id})`)
        map.set(cat.slug, { id: created.id })
    }
    return map
}

const ensureProducts = async (
    payload: Awaited<ReturnType<typeof getPayload>>,
    brandMap: Map<string, { id: number }>,
    categoryMap: Map<string, { id: number }>,
): Promise<void> => {
    for (const product of SEED_PRODUCTS) {
        const existing = await findProductByEnSlug(payload, product.slug)
        const brandId = brandMap.get(product.brandSlug)?.id
        if (!brandId) {
            warn(`product "${product.name.en}" skipped: brand "${product.brandSlug}" not found`)
            continue
        }
        const categoryIds = product.categorySlugs
            .map((slug) => categoryMap.get(slug)?.id)
            .filter((id): id is number => Boolean(id))
        const localized = (locale: Locale) => ({
            name: product.name[locale],
            ...(product.description ? { description: makeRichText(product.description[locale]) } : {}),
            ...(product.specifications ? { specifications: product.specifications[locale] } : {}),
        })
        const base = {
            slug: product.slug || product.name.en,
            brand: brandId,
            categories: categoryIds,
            price: product.price,
            stock: product.stock,
            featured: product.featured ?? false,
            generateSlug: false,
        }

        if (existing) {
            for (const locale of LOCALES) {
                await payload.update({
                    collection: 'products',
                    id: existing.id,
                    data: {
                        ...base,
                        ...localized(locale),
                    },
                    locale,
                    overrideAccess: true,
                })
            }
            log(`product "${product.name.en}" updated (id=${existing.id})`)
            continue
        }
        const created = await payload.create({
            collection: 'products',
            data: {
                ...base,
                ...localized('en'),
            },
            locale: 'en',
            overrideAccess: true,
        })
        await payload.update({
            collection: 'products',
            id: created.id,
            data: localized('fa'),
            locale: 'fa',
            overrideAccess: true,
        })
        log(`product "${product.name.en}" created (id=${created.id})`)
    }
}

const findUserByPhone = async (
    payload: Awaited<ReturnType<typeof getPayload>>,
    phone: string,
): Promise<{ id: number | string } | null> => {
    const result = await payload.find({
        collection: 'users',
        where: { phone: { equals: phone } },
        limit: 1,
        depth: 0,
    })
    const doc = result.docs[0]
    return doc ? { id: doc.id } : null
}

const ensureUsers = async (
    payload: Awaited<ReturnType<typeof getPayload>>,
): Promise<void> => {
    for (const u of SEED_USERS) {
        const existing = await findUserByPhone(payload, u.phone)
        if (existing) {
            log(`user "${u.phone}" already exists (id=${existing.id})`)
            continue
        }
        const email = u.email ?? `${u.phone}@phone.local`
        await payload.create({
            collection: 'users',
            data: {
                email,
                password: u.password,
                firstName: u.firstName,
                lastName: u.lastName,
                phone: u.phone,
                role: u.role,
                ...(u.firstLoginAt !== undefined ? { firstLoginAt: u.firstLoginAt } : {}),
                ...(u.addresses
                    ? {
                          addresses: u.addresses.map((a) => ({
                              label: a.label,
                              fullName: a.fullName,
                              phone: a.phone,
                              address: a.address,
                              city: a.city,
                              province: a.province,
                              default: Boolean(a.isPrimary),
                          })),
                      }
                    : {}),
            },
            draft: false,
            overrideAccess: true,
        })
        log(`user "${u.phone}" created (role=${u.role})`)
    }
}

const ensureSiteSettings = async (
    payload: Awaited<ReturnType<typeof getPayload>>,
): Promise<void> => {
    const existing = await payload.findGlobal({ slug: 'site-settings', depth: 0 }).catch(() => null)
    if (existing && existing.contactInfo && existing.contactInfo.phones && existing.contactInfo.phones.length > 0) {
        for (const locale of LOCALES) {
            await payload.updateGlobal({
                slug: 'site-settings',
                data: {
                    siteName: SEED_SITE_SETTINGS.siteName[locale],
                    footerText: makeRichText(SEED_SITE_SETTINGS.footerText[locale]),
                    contactInfo: SEED_SITE_SETTINGS.contactInfo,
                    socialLinks: SEED_SITE_SETTINGS.socialLinks,
                },
                locale,
                overrideAccess: true,
            })
        }
        log('site-settings updated with localized fields')
        return
    }
    for (const locale of LOCALES) {
        await payload.updateGlobal({
            slug: 'site-settings',
            data: {
                siteName: SEED_SITE_SETTINGS.siteName[locale],
                footerText: makeRichText(SEED_SITE_SETTINGS.footerText[locale]),
                contactInfo: SEED_SITE_SETTINGS.contactInfo,
                socialLinks: SEED_SITE_SETTINGS.socialLinks,
            },
            locale,
            overrideAccess: true,
        })
    }
    log('site-settings seeded')
}

const main = async (): Promise<void> => {
    log('starting…')
    const payload = await getPayload({ config })
    const brandMap = await ensureBrands(payload)
    const categoryMap = await ensureCategories(payload)
    await ensureProducts(payload, brandMap, categoryMap)
    await ensureUsers(payload)
    await ensureSiteSettings(payload)
    log('done')
    process.exit(0)
}

main().catch((err) => {
    process.stderr.write(`[seed] FAILED: ${err instanceof Error ? err.message : String(err)}\n`)
    if (err instanceof Error && err.stack) process.stderr.write(`${err.stack}\n`)
    process.exit(1)
})
