'use client'

import { createContext, useContext, useMemo, type ReactNode } from 'react'

import { DEFAULT_LOCALE, isLocale, type Locale } from '@/lib/locale'
import {
    getTranslator,
    type Dictionary,
    type Translator,
} from '@/lib/i18n'

type ProviderDictionary = Dictionary | undefined

type TranslationContextValue = Translator

const TranslationContext = createContext<TranslationContextValue | null>(null)

const MissingProviderError = new Error(
    '[i18n] useTranslation must be used inside a <TranslationProvider />. Wrap the localized layout children with the provider.',
)

type Props = {
    locale: Locale
    dictionary?: ProviderDictionary
    children: ReactNode
}

export const TranslationProvider = ({ locale, dictionary, children }: Props) => {
    const translator = useMemo<Translator>(() => {
        const bound = isLocale(locale) ? locale : DEFAULT_LOCALE
        if (dictionary) {
            const t = (key: string, params?: Record<string, string | number>) => {
                const raw = dictionary[key]
                if (typeof raw === 'string' && raw.length > 0) {
                    return interpolate(raw, params)
                }
                return getTranslator(bound).t(key, params)
            }
            return { locale: bound, t }
        }
        return getTranslator(bound)
    }, [locale, dictionary])

    return (
        <TranslationContext.Provider value={translator}>
            {children}
        </TranslationContext.Provider>
    )
}

export const useTranslation = (): Translator => {
    const context = useContext(TranslationContext)
    if (!context) {
        if (typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production') {
            throw MissingProviderError
        }
        return { locale: DEFAULT_LOCALE, t: (key) => key }
    }
    return context
}

const interpolate = (
    template: string,
    params?: Record<string, string | number>,
): string => {
    if (!params) return template
    return template.replace(/\{(\w+)\}/g, (match, name: string) => {
        if (Object.prototype.hasOwnProperty.call(params, name)) {
            return String(params[name])
        }
        return match
    })
}
