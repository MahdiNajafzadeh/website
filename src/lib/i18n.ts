import { DEFAULT_LOCALE, isLocale, type Locale } from "@/lib/locale";

import en from "@/locales/en.json";
import fa from "@/locales/fa.json";

const DICTIONARIES: Record<Locale, Dictionary> = {
    en: en as Dictionary,
    fa: fa as Dictionary,
};

export type Dictionary = Record<string, string>;

export type TranslationKey = keyof typeof en;

const DICTIONARY_VALUES = new Map<Locale, Dictionary>([
    ["en", DICTIONARIES.en],
    ["fa", DICTIONARIES.fa],
]);

export type Translator = {
    t: (key: string, params?: Record<string, string | number>) => string;
    locale: Locale;
};

const interpolate = (template: string, params?: Record<string, string | number>): string => {
    if (!params) return template;
    return template.replace(/\{(\w+)\}/g, (match, name: string) => {
        if (Object.prototype.hasOwnProperty.call(params, name)) {
            return String(params[name]);
        }
        return match;
    });
};

const isDev = (): boolean => typeof process !== "undefined" && process.env?.NODE_ENV !== "production";

const warnMissing = (key: string, locale: Locale): void => {
    if (!isDev()) return;
    if (typeof console !== "undefined") {
        console.warn(`[i18n] Missing translation for "${key}" in locale "${locale}"`);
    }
};

const resolveRaw = (key: string, locale: Locale): string | undefined => {
    const active = DICTIONARY_VALUES.get(locale);
    const fromActive = active?.[key];
    if (typeof fromActive === "string" && fromActive.length > 0) {
        return fromActive;
    }
    if (locale !== DEFAULT_LOCALE) {
        const fallback = DICTIONARY_VALUES.get(DEFAULT_LOCALE);
        const fromDefault = fallback?.[key];
        if (typeof fromDefault === "string" && fromDefault.length > 0) {
            return fromDefault;
        }
    }
    return undefined;
};

export const getTranslator = (locale: Locale): Translator => {
    const boundLocale: Locale = isLocale(locale) ? locale : DEFAULT_LOCALE;
    return {
        locale: boundLocale,
        t: (key, params) => {
            const raw = resolveRaw(key, boundLocale);
            if (raw === undefined) {
                warnMissing(key, boundLocale);
                return key;
            }
            return interpolate(raw, params);
        },
    };
};

export const getDictionary = (locale: Locale): Dictionary => {
    if (isLocale(locale)) {
        return DICTIONARIES[locale];
    }
    return DICTIONARIES[DEFAULT_LOCALE];
};
