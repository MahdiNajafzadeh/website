import { DEFAULT_LOCALE, LOCALES, isLocale, type Locale } from '@/lib/locale'

type LocalizedShape = Partial<Record<Locale, string | null | undefined>> & {
    [key: string]: string | null | undefined
}

export const localizedValue = <T>(
    value: T | LocalizedShape | null | undefined,
    locale: Locale,
): string => {
    if (value === null || value === undefined) return ''
    if (typeof value === 'string') {
        const trimmed = value.trim()
        if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
            try {
                const parsed: unknown = JSON.parse(trimmed)
                if (
                    parsed !== null &&
                    typeof parsed === 'object' &&
                    !Array.isArray(parsed) &&
                    LOCALES.some((code) => code in parsed)
                ) {
                    return localizedValue(parsed as LocalizedShape, locale)
                }
            } catch {
                return value
            }
        }
        return value
    }
    if (typeof value === 'number') return String(value)

    if (typeof value !== 'object') return ''

    const obj = value as LocalizedShape

    const active = obj[locale]
    if (typeof active === 'string' && active.length > 0) return active

    if (!isLocale(locale)) {
        const fallback = obj[DEFAULT_LOCALE]
        if (typeof fallback === 'string' && fallback.length > 0) return fallback
    } else {
        const fallback = obj[DEFAULT_LOCALE]
        if (typeof fallback === 'string' && fallback.length > 0) return fallback
    }

    for (const code of LOCALES) {
        const candidate = obj[code]
        if (typeof candidate === 'string' && candidate.length > 0) return candidate
    }

    const firstString = Object.values(obj).find(
        (v): v is string => typeof v === 'string' && v.length > 0,
    )
    return firstString ?? ''
}
