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

const log = (msg: string): void => {
    process.stdout.write(`[seed] ${msg}\n`)
}

const warn = (msg: string): void => {
    process.stdout.write(`[seed] WARN: ${msg}\n`)
}

const matchSlug = (raw: unknown, target: string): boolean => raw === target

const findBrandBySlug = async (
    payload: Awaited<ReturnType<typeof getPayload>>,
    slug: string,
): Promise<{ id: number | string; slug: string } | null> => {
    const result = await payload.find({
        collection: 'brands',
        limit: 100,
        depth: 0,
        locale: 'en',
    })
    const docs = result.docs as Array<{ id: number | string; slug: unknown }>
    const match = docs.find((d) => matchSlug(d.slug, slug))
    if (!match) return null
    return { id: match.id, slug }
}

const findCategoryBySlug = async (
    payload: Awaited<ReturnType<typeof getPayload>>,
    slug: string,
): Promise<{ id: number | string; slug: string } | null> => {
    const result = await payload.find({
        collection: 'categories',
        limit: 100,
        depth: 0,
        locale: 'en',
    })
    const docs = result.docs as Array<{ id: number | string; slug: unknown }>
    const match = docs.find((d) => matchSlug(d.slug, slug))
    if (!match) return null
    return { id: match.id, slug }
}

const findProductByEnSlug = async (
    payload: Awaited<ReturnType<typeof getPayload>>,
    slug: string,
): Promise<{ id: number | string } | null> => {
    const result = await payload.find({
        collection: 'products',
        limit: 500,
        depth: 0,
        locale: 'en',
    })
    const docs = result.docs as Array<{ id: number | string; slug: unknown }>
    const match = docs.find((d) => matchSlug(d.slug, slug))
    if (!match) return null
    return { id: match.id }
}

const ensureBrands = async (
    payload: Awaited<ReturnType<typeof getPayload>>,
): Promise<Map<string, { id: number | string }>> => {
    const map = new Map<string, { id: number | string }>()
    for (const brand of SEED_BRANDS) {
        const existing = await findBrandBySlug(payload, brand.slug)
        if (existing) {
            await payload.update({
                collection: 'brands',
                id: existing.id,
                data: {
                    name: brand.name,
                    slug: brand.slug || brand.name.en,
                    description: brand.description,
                    order: brand.order,
                    generateSlug: false,
                },
                overrideAccess: true,
            })
            log(`brand "${brand.name.en}" updated (id=${existing.id})`)
            map.set(brand.slug, { id: existing.id })
            continue
        }
        const created = await payload.create({
            collection: 'brands',
            data: {
                name: brand.name,
                slug: brand.slug || brand.name.en,
                description: brand.description,
                order: brand.order,
                generateSlug: false,
            },
            overrideAccess: true,
        })
        log(`brand "${brand.name.en}" created (id=${created.id})`)
        map.set(brand.slug, { id: created.id })
    }
    return map
}

const ensureCategories = async (
    payload: Awaited<ReturnType<typeof getPayload>>,
): Promise<Map<string, { id: number | string }>> => {
    const map = new Map<string, { id: number | string }>()
    for (const cat of SEED_CATEGORIES) {
        const existing = await findCategoryBySlug(payload, cat.slug)
        if (existing) {
            await payload.update({
                collection: 'categories',
                id: existing.id,
                data: {
                    name: cat.name,
                    slug: cat.slug || cat.name.en,
                    description: cat.description,
                    generateSlug: false,
                },
                overrideAccess: true,
            })
            log(`category "${cat.name.en}" updated (id=${existing.id})`)
            map.set(cat.slug, { id: existing.id })
            continue
        }
        const created = await payload.create({
            collection: 'categories',
            data: {
                name: cat.name,
                slug: cat.slug || cat.name.en,
                description: cat.description,
                generateSlug: false,
            },
            overrideAccess: true,
        })
        log(`category "${cat.name.en}" created (id=${created.id})`)
        map.set(cat.slug, { id: created.id })
    }
    return map
}

const ensureProducts = async (
    payload: Awaited<ReturnType<typeof getPayload>>,
    brandMap: Map<string, { id: number | string }>,
    categoryMap: Map<string, { id: number | string }>,
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
            .filter((id): id is number | string => Boolean(id))
        const data: Record<string, unknown> = {
            name: product.name,
            slug: product.slug || product.name.en,
            brand: brandId,
            categories: categoryIds,
            price: product.price,
            stock: product.stock,
            featured: product.featured ?? false,
            generateSlug: false,
        }
        if (product.description) data.description = product.description
        if (product.specifications) data.specifications = product.specifications

        if (existing) {
            await payload.update({
                collection: 'products',
                id: existing.id,
                data: data as Parameters<typeof payload.update>[0]['data'],
                overrideAccess: true,
            })
            log(`product "${product.name.en}" updated (id=${existing.id})`)
            continue
        }
        const created = await payload.create({
            collection: 'products',
            data: data as Parameters<typeof payload.create>[0]['data'],
            overrideAccess: true,
        })
        log(`product "${product.name.en}" created (id=${created.id})`)
    }
}

const findUserByEmail = async (
    payload: Awaited<ReturnType<typeof getPayload>>,
    email: string,
): Promise<{ id: number | string } | null> => {
    const result = await payload.find({
        collection: 'users',
        where: { email: { equals: email } },
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
        const existing = await findUserByEmail(payload, u.email)
        if (existing) {
            log(`user "${u.email}" already exists (id=${existing.id})`)
            continue
        }
        const data: Record<string, unknown> = {
            email: u.email,
            password: u.password,
            name: u.name,
            role: u.role,
        }
        if (u.phone) data.phone = u.phone
        if (u.addresses) data.addresses = u.addresses
        await payload.create({
            collection: 'users',
            data,
            overrideAccess: true,
        })
        log(`user "${u.email}" created (role=${u.role})`)
    }
}

const ensureSiteSettings = async (
    payload: Awaited<ReturnType<typeof getPayload>>,
): Promise<void> => {
    const existing = await payload.findGlobal({ slug: 'site-settings', depth: 0 }).catch(() => null)
    if (existing && existing.contactInfo && existing.contactInfo.phones && existing.contactInfo.phones.length > 0) {
        await payload.updateGlobal({
            slug: 'site-settings',
            data: {
                siteName: SEED_SITE_SETTINGS.siteName,
                footerText: SEED_SITE_SETTINGS.footerText,
                contactInfo: SEED_SITE_SETTINGS.contactInfo,
                socialLinks: SEED_SITE_SETTINGS.socialLinks,
            },
            overrideAccess: true,
        })
        log('site-settings updated with localized fields')
        return
    }
    await payload.updateGlobal({
        slug: 'site-settings',
        data: SEED_SITE_SETTINGS,
        overrideAccess: true,
    })
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