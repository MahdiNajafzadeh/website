export const LOCALES = ['en', 'fa'] as const
export type Locale = (typeof LOCALES)[number]
export const DEFAULT_LOCALE: Locale = 'en'

export const isLocale = (value: string | undefined | null): value is Locale =>
    typeof value === 'string' && (LOCALES as readonly string[]).includes(value)

export const ensureLocale = (value: string | undefined | null): Locale => {
    if (!isLocale(value)) {
        throw new Error(`Unsupported locale: ${String(value)}`)
    }
    return value
}

export const localeDir = (locale: Locale): 'ltr' | 'rtl' => (locale === 'fa' ? 'rtl' : 'ltr')

export const localeHref = (locale: Locale, path = '/'): string => {
    const normalized = path.startsWith('/') ? path : `/${path}`
    if (normalized === '/') return `/${locale}`
    return `/${locale}${normalized}`
}

export const stripLocale = (pathname: string): { locale: Locale | null; rest: string } => {
    const segments = pathname.split('/')
    if (segments.length > 1 && isLocale(segments[1])) {
        const locale = segments[1] as Locale
        const rest = '/' + segments.slice(2).join('/')
        return { locale, rest: rest === '/' ? '/' : rest.replace(/\/+$/, '') || '/' }
    }
    return { locale: null, rest: pathname }
}

export const switchLocaleHref = (
    pathname: string,
    nextLocale: Locale,
): string => {
    const { locale: currentLocale, rest } = stripLocale(pathname)
    if (currentLocale === nextLocale) return pathname
    if (rest === '/' || rest === '') return `/${nextLocale}`
    return `/${nextLocale}${rest}`
}