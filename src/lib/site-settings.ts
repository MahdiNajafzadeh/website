import { getPayload } from 'payload'
import type { Where } from 'payload'

import config from '@payload-config'

import type { SiteSettings as SiteSettingsType } from '@/payload-types'
import type { Locale } from '@/lib/locale'
import { localizedValue } from '@/lib/localized'

type ContactRow = { id?: number | string; isPrimary?: boolean | null; createdAt?: string }

export const getSiteSettings = async (locale: Locale): Promise<SiteSettingsType | null> => {
    const payload = await getPayload({ config })
    try {
        const settings = await payload.findGlobal({
            slug: 'site-settings',
            depth: 2,
            locale,
        })
        return {
            ...settings,
            siteName: localizedValue(settings.siteName, locale),
        } as SiteSettingsType
    } catch {
        return null
    }
}

export const listActiveBrands = async (locale: Locale, limit = 50) => {
    const payload = await getPayload({ config })
    const where: Where = {}
    const result = await payload.find({
        collection: 'brands',
        where,
        sort: 'order',
        limit,
        depth: 1,
        locale,
    })
    return result.docs.map((brand) => ({
        ...brand,
        name: localizedValue(brand.name, locale),
    }))
}

type SocialLinkRow = {
    id?: number | string
    order?: number | null
    createdAt?: string
}

export const sortSocialLinks = <T extends SocialLinkRow>(links: T[] | undefined | null): T[] => {
    return (links ?? [])
        .slice()
        .sort((a, b) => {
            const orderDiff = (a.order ?? 0) - (b.order ?? 0)
            if (orderDiff !== 0) return orderDiff
            return String(b.id ?? '').localeCompare(String(a.id ?? ''))
        })
}

export const sortContactRows = <T extends ContactRow>(rows: T[] | undefined | null): T[] => {
    return (rows ?? [])
        .slice()
        .sort((a, b) => {
            const primaryDiff = Number(!!b.isPrimary) - Number(!!a.isPrimary)
            if (primaryDiff !== 0) return primaryDiff
            return String(a.id ?? '').localeCompare(String(b.id ?? ''))
        })
}