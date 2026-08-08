import 'dotenv/config'

import { getPayload } from 'payload'
import config from '../src/payload.config.js'

import {
    SEED_BRANDS,
    SEED_CATEGORIES,
    SEED_PRODUCTS,
    SEED_SITE_SETTINGS,
    SEED_USERS,
    type SeedProduct,
} from './seed-data.js'

const log = (msg: string): void => {
    process.stdout.write(`[seed] ${msg}\n`)
}

const warn = (msg: string): void => {
    process.stdout.write(`[seed] WARN: ${msg}\n`)
}

const findBySlug = async <T extends { id: number | string; slug: string }>(
    payload: Awaited<ReturnType<typeof getPayload>>,
    collection: 'brands' | 'categories',
    slug: string,
): Promise<T | null> => {
    const result = await payload.find({
        collection,
        where: { slug: { equals: slug } },
        limit: 1,
        depth: 0,
    })
    return (result.docs[0] as T | undefined) ?? null
}

const findByEmail = async (
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

const ensureBrands = async (
    payload: Awaited<ReturnType<typeof getPayload>>,
): Promise<Map<string, { id: number | string }>> => {
    const map = new Map<string, { id: number | string }>()
    for (const brand of SEED_BRANDS) {
        const existing = await findBySlug<{ id: number | string; slug: string }>(
            payload,
            'brands',
            brand.slug,
        )
        if (existing) {
            log(`brand "${brand.name}" already exists (id=${existing.id})`)
            map.set(brand.slug, { id: existing.id })
            continue
        }
        const created = await payload.create({
            collection: 'brands',
            data: {
                name: brand.name,
                slug: brand.slug,
                description: brand.description,
                order: brand.order,
                generateSlug: false,
            },
            overrideAccess: true,
        })
        log(`brand "${brand.name}" created (id=${created.id})`)
        map.set(brand.slug, { id: created.id })
    }
    return map
}

const ensureCategories = async (
    payload: Awaited<ReturnType<typeof getPayload>>,
): Promise<Map<string, { id: number | string }>> => {
    const map = new Map<string, { id: number | string }>()
    for (const cat of SEED_CATEGORIES) {
        const existing = await findBySlug<{ id: number | string; slug: string }>(
            payload,
            'categories',
            cat.slug,
        )
        if (existing) {
            log(`category "${cat.name}" already exists (id=${existing.id})`)
            map.set(cat.slug, { id: existing.id })
            continue
        }
        const created = await payload.create({
            collection: 'categories',
            data: {
                name: cat.name,
                slug: cat.slug,
                description: cat.description,
                generateSlug: false,
            },
            overrideAccess: true,
        })
        log(`category "${cat.name}" created (id=${created.id})`)
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
        const existing = await payload.find({
            collection: 'products',
            where: { slug: { equals: product.slug } },
            limit: 1,
            depth: 0,
        })
        if (existing.docs[0]) {
            log(`product "${product.name}" already exists (id=${existing.docs[0].id})`)
            continue
        }
        const brandId = brandMap.get(product.brandSlug)?.id
        if (!brandId) {
            warn(`product "${product.name}" skipped: brand "${product.brandSlug}" not found`)
            continue
        }
        const categoryIds = product.categorySlugs
            .map((slug) => categoryMap.get(slug)?.id)
            .filter((id): id is number | string => Boolean(id))
        const data: Record<string, unknown> = {
            name: product.name,
            slug: product.slug,
            brand: brandId,
            categories: categoryIds,
            price: product.price,
            stock: product.stock,
            featured: product.featured ?? false,
            generateSlug: false,
        }
        if (product.description) data.description = product.description
        if (product.specifications) data.specifications = product.specifications

        const created = await payload.create({
            collection: 'products',
            data: data as SeedProduct & { brand: number | string; categories: Array<number | string> },
            overrideAccess: true,
        })
        log(`product "${product.name}" created (id=${created.id})`)
    }
}

const ensureUsers = async (
    payload: Awaited<ReturnType<typeof getPayload>>,
): Promise<void> => {
    for (const u of SEED_USERS) {
        const existing = await findByEmail(payload, u.email)
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
        log('site-settings already configured')
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
