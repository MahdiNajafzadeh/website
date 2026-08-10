import { Vazirmatn } from 'next/font/google'
import { notFound } from 'next/navigation'
import React from 'react'

import { Footer } from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'
import { ThemeProvider } from '@/components/theme/ThemeProvider'
import { TranslationProvider } from '@/components/i18n/TranslationProvider'
import { ensureLocale, isLocale, localeDir } from '@/lib/locale'
import { getDictionary, getTranslator } from '@/lib/i18n'

import './styles.css'

const vazirmatn = Vazirmatn({
    subsets: ['arabic', 'latin'],
    display: 'swap',
    variable: '--font-vazirmatn',
})

export const viewport = {
    themeColor: [
        { media: '(prefers-color-scheme: light)', color: '#ffffff' },
        { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
    ],
}

type Params = Promise<{ locale: string }>

export async function generateMetadata({ params }: { params: Params }) {
    const rawLocale = (await params).locale
    if (!isLocale(rawLocale)) {
        return {}
    }
    const locale = ensureLocale(rawLocale)
    const { t } = getTranslator(locale)
    return {
        title: t('layout.header.siteNameFallback'),
        description: t('layout.footer.copyright', { year: new Date().getFullYear(), site: t('layout.header.siteNameFallback') }),
    }
}

export default async function RootLayout(props: {
    children: React.ReactNode
    params: Params
}) {
    const { locale: rawLocale } = await props.params
    if (!isLocale(rawLocale)) notFound()
    const locale = ensureLocale(rawLocale)
    const dir = localeDir(locale)
    const dictionary = getDictionary(locale)
    const { t } = getTranslator(locale)

    return (
        <html lang={locale} dir={dir} className={vazirmatn.variable} suppressHydrationWarning>
            <body
                className={`${vazirmatn.className} flex min-h-screen flex-col bg-background text-foreground antialiased`}
            >
                <a
                    href="#main"
                    className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:start-2 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-sm focus:text-primary-foreground focus:shadow"
                >
                    {t('layout.skipToContent')}
                </a>
                <TranslationProvider locale={locale} dictionary={dictionary}>
                    <ThemeProvider
                        attribute="class"
                        defaultTheme="system"
                        enableSystem
                        disableTransitionOnChange
                    >
                        <Header locale={locale} />
                        <main id="main" className="flex-1">
                            {props.children}
                        </main>
                        <Footer locale={locale} />
                    </ThemeProvider>
                </TranslationProvider>
            </body>
        </html>
    )
}
