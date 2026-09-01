import React from 'react'
import Link from 'next/link'
import Script from 'next/script'
import { getPayload } from 'payload'
import { ShoppingBag } from 'lucide-react'

import config from '@/payload.config'
import { Toaster } from '@/components/ui/sonner'
import { CartBadge } from '@/components/layout/CartBadge'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { getCurrentUser } from '@/lib/current-user'

import '../globals.css'

import type { Media, SiteSetting } from '@/payload-types'
import { LogoutButton } from '@/components/layout/LogoutButton'
import { t } from '@/lib/t'

export const dynamic = 'force-dynamic'

export const metadata = {
    description: 'A blank template using Payload in a Next.js app.',
    title: 'Payload Blank Template',
}

const NAV_LINKS = [
    { href: '/', label: 'خانه' },
    { href: '/products', label: 'محصولات' },
    { href: '/categories', label: 'دسته‌ها' },
    { href: '/brands', label: 'برندها' },
    { href: '/contact', label: 'تماس' },
] as const

async function getSiteSettings(): Promise<SiteSetting | null> {
    try {
        const payloadConfig = await config
        const payload = await getPayload({ config: payloadConfig })
        const data = await payload.findGlobal({
            slug: 'site-settings',
            depth: 1,
        })
        return data as unknown as SiteSetting
    } catch {
        return null
    }
}

function getLogoUrl(logo: SiteSetting['logo']): string | null {
    if (!logo) return null
    if (typeof logo === 'object' && logo !== null && 'url' in logo) {
        const media = logo as Media
        return media.url ?? null
    }
    return null
}

function getPrimary<T extends { isPrimary?: boolean | null }>(arr: T[] | null | undefined): T | null {
    if (!arr || arr.length === 0) return null
    return arr.find((i) => i.isPrimary) ?? arr[0] ?? null
}

export default async function RootLayout(props: { children: React.ReactNode }) {
    const { children } = props
    const [siteSettings, currentUser] = await Promise.all([getSiteSettings(), getCurrentUser()])

    const siteName = siteSettings?.siteName?.fa || siteSettings?.siteName?.en || 'فروشگاه'
    const logoUrl = getLogoUrl(siteSettings?.logo)

    const primaryPhone = getPrimary(siteSettings?.phones as unknown as { label?: string | null; number: string; isPrimary?: boolean | null }[] | null | undefined)
    const primaryEmail = getPrimary(siteSettings?.emails as unknown as { label?: string | null; email: string; isPrimary?: boolean | null }[] | null | undefined)
    const primaryAddress = getPrimary(siteSettings?.addresses as unknown as { label?: string | null; address: string; isPrimary?: boolean | null }[] | null | undefined)
    const socialLinks = siteSettings?.socialLinks ?? []

    const initials = currentUser
        ? `${(currentUser.firstName?.[0] ?? '') + (currentUser.lastName?.[0] ?? '') || currentUser.phone?.slice(-2) || 'ک'}`
        : ''

    return (
        <html lang="fa" dir="rtl" suppressHydrationWarning>
            <head>
                <Script id="theme-pref" strategy="beforeInteractive">{`
          (function () {
            var KEY = 'theme-pref';
            var root = document.documentElement;
            var saved = null;
            try { saved = localStorage.getItem(KEY); } catch (e) { saved = null; }
            var theme = (saved === 'dark' || saved === 'light')
              ? saved
              : (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
            root.setAttribute('data-theme', theme);
            if (theme === 'dark') root.classList.add('dark'); else root.classList.remove('dark');
          })();
        `}</Script>
            </head>
            <body className="min-h-screen bg-background text-foreground antialiased">
                <header className="sticky top-0 z-50 border-b border-[#e5e5e5] bg-[#ffffff] text-[#111111] dark:border-[#39393b] dark:bg-[#111111] dark:text-white">
                    <div className="mx-auto flex h-14 max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
                        <Link href="/" className="flex items-center gap-3 shrink-0">
                            {logoUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={logoUrl} alt={siteName} className="h-8 w-8 object-contain" width={32} height={32} />
                            ) : (
                                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#111111] text-[12px] font-medium text-white dark:bg-white dark:text-[#111111]">
                                    {siteName.charAt(0).toUpperCase()}
                                </span>
                            )}
                            <span className="text-[16px] font-medium leading-[1.75] tracking-[0] text-[#111111] dark:text-white">{siteName}</span>
                        </Link>

                        <nav className="hidden items-center gap-6 md:flex" aria-label="Primary">
                            {NAV_LINKS.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="text-[16px] font-medium leading-[1.75] text-[#111111] transition-colors hover:text-[#707072] dark:text-white dark:hover:text-[#9e9ea0]"
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </nav>

                        <div className="flex items-center gap-2 sm:gap-3">
                            <Link
                                href="/cart"
                                aria-label="سبد خرید"
                                className="relative flex h-10 w-10 items-center justify-center rounded-full bg-[#f5f5f5] text-[#111111] transition-colors hover:bg-[#e5e5e5] dark:bg-[#39393b] dark:text-white dark:hover:bg-[#4b4b4d]"
                            >
                                <ShoppingBag className="h-5 w-5" />
                                <CartBadge />
                            </Link>

                            <ThemeToggle />

                            {currentUser ? (
                                <>
                                    <Link
                                        href="/account"
                                        aria-label={t('header.account')}
                                        className="flex h-9 w-9 items-center justify-center rounded-full bg-[#111111] text-[12px] font-medium text-white transition-opacity hover:opacity-90 dark:bg-white dark:text-[#111111]"
                                        data-od-id="header-avatar"
                                    >
                                        {initials.toUpperCase()}
                                    </Link>
                                    <LogoutButton />
                                </>
                            ) : (
                                <>
                                    <Link href="/login" className="hidden text-[14px] font-medium leading-[1.5] text-[#707072] hover:text-[#111111] dark:text-[#9e9ea0] dark:hover:text-white sm:inline-flex">
                                        {t('header.login')}
                                    </Link>
                                    <Link
                                        href="/register"
                                        className="inline-flex h-9 items-center justify-center rounded-full bg-[#111111] px-5 text-[14px] font-medium leading-[1.5] text-white transition-opacity hover:opacity-90 dark:bg-white dark:text-[#111111]"
                                    >
                                        {t('header.register')}
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="border-t border-[#f5f5f5] md:hidden dark:border-[#39393b]">
                        <nav className="flex gap-4 overflow-x-auto px-4 py-2" aria-label="Primary mobile">
                            {NAV_LINKS.map((link) => (
                                <Link key={link.href} href={link.href} className="whitespace-nowrap text-[14px] font-medium leading-[1.5] text-[#111111] dark:text-white">
                                    {link.label}
                                </Link>
                            ))}
                        </nav>
                    </div>
                </header>

                <main>{children}</main>

                <footer className="border-t border-[#cacacb] bg-[#ffffff] text-[#707072] dark:border-[#39393b] dark:bg-[#111111] dark:text-[#9e9ea0]">
                    <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
                        <div className="grid gap-8 md:grid-cols-3">
                            <div className="space-y-4">
                                <h3 className="text-[14px] font-medium leading-[1.5] text-[#111111] dark:text-white">تماس</h3>
                                <div className="space-y-3">
                                    {primaryPhone ? (
                                        <div>
                                            <p className="text-[12px] font-medium uppercase tracking-wide text-[#707072] dark:text-[#9e9ea0]">{primaryPhone.label || 'تلفن'}</p>
                                            <a href={`tel:${primaryPhone.number}`} className="text-[14px] font-medium leading-[1.5] text-[#111111] hover:underline dark:text-white">
                                                {primaryPhone.number}
                                            </a>
                                        </div>
                                    ) : (
                                        <p className="text-[14px] leading-[1.5]">شماره‌ای ثبت نشده</p>
                                    )}
                                    {primaryEmail ? (
                                        <div>
                                            <p className="text-[12px] font-medium uppercase tracking-wide text-[#707072] dark:text-[#9e9ea0]">{primaryEmail.label || 'ایمیل'}</p>
                                            <a href={`mailto:${primaryEmail.email}`} className="text-[14px] font-medium leading-[1.5] text-[#111111] hover:underline dark:text-white">
                                                {primaryEmail.email}
                                            </a>
                                        </div>
                                    ) : (
                                        <p className="text-[14px] leading-[1.5]">ایمیلی ثبت نشده</p>
                                    )}
                                    {primaryAddress ? (
                                        <div>
                                            <p className="text-[12px] font-medium uppercase tracking-wide text-[#707072] dark:text-[#9e9ea0]">{primaryAddress.label || 'آدرس'}</p>
                                            <p className="text-[14px] leading-[1.5] text-[#111111] dark:text-white">{primaryAddress.address}</p>
                                        </div>
                                    ) : (
                                        <p className="text-[14px] leading-[1.5]">آدرسی ثبت نشده</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-[14px] font-medium leading-[1.5] text-[#111111] dark:text-white">دسترسی</h3>
                                <ul className="space-y-2">
                                    {NAV_LINKS.map((link) => (
                                        <li key={link.href}>
                                            <Link href={link.href} className="text-[14px] font-medium leading-[1.5] hover:text-[#111111] hover:underline dark:hover:text-white">
                                                {link.label}
                                            </Link>
                                        </li>
                                    ))}
                                    <li>
                                        <Link href="/cart" className="text-[14px] font-medium leading-[1.5] hover:text-[#111111] hover:underline dark:hover:text-white">
                                            سبد خرید
                                        </Link>
                                    </li>
                                </ul>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-[14px] font-medium leading-[1.5] text-[#111111] dark:text-white">ما را دنبال کنید</h3>
                                {socialLinks && socialLinks.length > 0 ? (
                                    <ul className="flex flex-wrap gap-3">
                                        {socialLinks.map((social) => {
                                            const iconUrl =
                                                social.icon && typeof social.icon === 'object' && 'url' in social.icon ? (social.icon as Media).url ?? null : null
                                            return (
                                                <li key={social.id ?? social.url}>
                                                    <a
                                                        href={social.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        aria-label={social.name}
                                                        title={social.description ?? social.name}
                                                        className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f5f5f5] text-[#111111] transition-colors hover:bg-[#e5e5e5] dark:bg-[#39393b] dark:text-white"
                                                    >
                                                        {iconUrl ? (
                                                            // eslint-disable-next-line @next/next/no-img-element
                                                            <img src={iconUrl} alt="" className="h-5 w-5 object-contain" width={20} height={20} />
                                                        ) : (
                                                            <span className="text-[12px] font-medium">{social.name.charAt(0).toUpperCase()}</span>
                                                        )}
                                                    </a>
                                                </li>
                                            )
                                        })}
                                    </ul>
                                ) : (
                                    <p className="text-[14px] leading-[1.5]">شبکه اجتماعی ثبت نشده</p>
                                )}
                            </div>
                        </div>

                        <div className="mt-8 border-t border-[#e5e5e5] pt-6 dark:border-[#39393b]">
                            <p className="text-center text-[12px] font-medium leading-[1.5] text-[#707072] dark:text-[#9e9ea0] sm:text-right">
                                © {new Date().getFullYear()} {siteName}. همه حقوق محفوظ است.
                            </p>
                        </div>
                    </div>
                </footer>

                <Toaster richColors closeButton />
            </body>
        </html>
    )
}
