import { createElement, type ReactNode } from 'react'
import { describe, expect, it } from 'vitest'
import { renderHook } from '@testing-library/react'

import en from '@/locales/en.json'
import fa from '@/locales/fa.json'
import { getDictionary, getTranslator } from '@/lib/i18n'
import {
    TranslationProvider,
    useTranslation,
} from '@/components/i18n/TranslationProvider'

const isNonEmptyString = (value: unknown): value is string =>
    typeof value === 'string' && value.length > 0

describe('locale dictionaries', () => {
    it('en and fa contain the same key set', () => {
        const enKeys = Object.keys(en).sort()
        const faKeys = Object.keys(fa).sort()
        expect(faKeys).toEqual(enKeys)
    })

    it('every value in en is a non-empty string', () => {
        for (const [key, value] of Object.entries(en)) {
            expect(isNonEmptyString(value), `en["${key}"] is empty`).toBe(true)
        }
    })

    it('every value in fa is a non-empty string', () => {
        for (const [key, value] of Object.entries(fa)) {
            expect(isNonEmptyString(value), `fa["${key}"] is empty`).toBe(true)
        }
    })
})

describe('getTranslator', () => {
    it('returns the active locale value when present', () => {
        const en = getTranslator('en')
        expect(en.t('layout.nav.products')).toBe('Products')
        const fa = getTranslator('fa')
        expect(fa.t('layout.nav.products')).toBe('محصولات')
    })

    it('falls back to default locale when the active locale is invalid', () => {
        // The provider/dictionary path always passes a valid locale; the public
        // getTranslator API must still surface a usable translator when callers
        // somehow hand an unsupported string. We exercise that branch by passing
        // the unsupported value as a string cast.
        const translator = getTranslator('xx' as unknown as 'fa')
        expect(translator.locale).toBe('en')
        expect(translator.t('layout.nav.products')).toBe('Products')
    })

    it('returns the key itself when no dictionary contains it', () => {
        const { t } = getTranslator('en')
        expect(t('definitely.missing.key')).toBe('definitely.missing.key')
    })

    it('replaces named placeholders with supplied values', () => {
        const { t } = getTranslator('en')
        expect(t('layout.footer.copyright', { year: 2026, site: 'Abafarin' })).toBe(
            '© 2026 Abafarin — All rights reserved.',
        )
    })

    it('keeps unknown placeholders visible for diagnosis', () => {
        const { t } = getTranslator('en')
        const out = t('layout.footer.copyright', { year: 2026 })
        expect(out).toBe('© 2026 {site} — All rights reserved.')
    })

    it('getDictionary returns the requested locale', () => {
        expect(getDictionary('en')).toBe(en)
        expect(getDictionary('fa')).toBe(fa)
    })
})

describe('useTranslation', () => {
    const wrap = (locale: 'en' | 'fa') => {
        return ({ children }: { children: ReactNode }) =>
            createElement(TranslationProvider, { locale, children })
    }

    it('returns the locale-bound translator from the provider', () => {
        const { result } = renderHook(() => useTranslation(), { wrapper: wrap('fa') })
        expect(result.current.locale).toBe('fa')
        expect(result.current.t('layout.nav.cart')).toBe('سبد خرید')
    })

    it('throws a clear error when used without a provider in development', () => {
        const env = process.env as Record<string, string | undefined>
        const previous = env.NODE_ENV
        env.NODE_ENV = 'development'
        try {
            expect(() => renderHook(() => useTranslation())).toThrow(
                /TranslationProvider/,
            )
        } finally {
            env.NODE_ENV = previous
        }
    })
})
