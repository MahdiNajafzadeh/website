import { getPayload } from 'payload'
import config from '@payload-config'

export type SiteSettingsData = {
  siteName: { en?: string | null; fa?: string | null } | null
  logo?: unknown
  favicon?: unknown
  phones?: Array<{ label?: string | null; number?: string | null; isPrimary?: boolean | null }> | null
  emails?: Array<{ label?: string | null; email?: string | null; isPrimary?: boolean | null }> | null
  addresses?: Array<{ label?: string | null; address?: string | null; isPrimary?: boolean | null }> | null
  socialLinks?: Array<{ name: string; url: string; description?: string | null; icon?: unknown }> | null
  partnerDiscount?: number | null
}

export async function getSiteSettings(): Promise<SiteSettingsData | null> {
  try {
    const payload = await getPayload({ config })
    const data = (await payload.findGlobal({
      slug: 'site-settings',
      depth: 1,
    })) as unknown as SiteSettingsData
    return data ?? null
  } catch {
    return null
  }
}

export function deriveName(settings: SiteSettingsData | null, fallback = 'Store'): string {
  const en = settings?.siteName?.en
  if (en && en.trim().length > 0) return en
  const fa = settings?.siteName?.fa
  if (fa && fa.trim().length > 0) return fa
  return fallback
}

export function deriveLogoUrl(settings: SiteSettingsData | null): string | null {
  const logo = settings?.logo as { url?: string | null } | undefined
  return logo?.url ?? null
}

export function primaryContact<T extends { isPrimary?: boolean | null }>(arr: T[] | undefined | null): T | undefined {
  if (!arr || arr.length === 0) return undefined
  return arr.find((x) => x.isPrimary === true) ?? arr[0]
}