import React from 'react'
import Link from 'next/link'
import Script from 'next/script'
import { getPayload } from 'payload'
import { ShoppingBag } from 'lucide-react'

import config from '@/payload.config'
import { Toaster } from '@/components/ui/sonner'
import { CartBadge } from '@/components/layout/CartBadge'
import { ThemeToggle } from '@/components/layout/ThemeToggle'

import '../globals.css'
import './styles.css'

import type { Media, SiteSetting } from '@/payload-types'

export const metadata = {
  description: 'A blank template using Payload in a Next.js app.',
  title: 'Payload Blank Template',
}

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/products', label: 'Products' },
  { href: '/brands', label: 'Brands' },
  { href: '/blog', label: 'Blog' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
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
  const siteSettings = await getSiteSettings()

  const siteName = siteSettings?.siteName?.en || siteSettings?.siteName?.fa || 'Store'
  const logoUrl = getLogoUrl(siteSettings?.logo)

  const primaryPhone = getPrimary(siteSettings?.phones as unknown as { label?: string | null; number: string; isPrimary?: boolean | null }[] | null | undefined)
  const primaryEmail = getPrimary(siteSettings?.emails as unknown as { label?: string | null; email: string; isPrimary?: boolean | null }[] | null | undefined)
  const primaryAddress = getPrimary(siteSettings?.addresses as unknown as { label?: string | null; address: string; isPrimary?: boolean | null }[] | null | undefined)
  const socialLinks = siteSettings?.socialLinks ?? []

  return (
    <html lang="fa" suppressHydrationWarning>
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
          })();
        `}</Script>
      </head>
      <body className="min-h-screen bg-white antialiased">
        {/* Header — {colors.canvas} #ffffff bg, {colors.ink} #111111 text, {component.primary-nav} height 56px, border {colors.hairline-soft} #e5e5e5 */}
        <header
          // {colors.canvas} #ffffff, {colors.ink} #111111, {colors.hairline-soft} #e5e5e5, {typography.heading-md} 16px/500/1.75, {rounded.full}
          className="sticky top-0 z-50 border-b border-[#e5e5e5] bg-[#ffffff] text-[#111111]"
        >
          <div className="mx-auto flex h-14 max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            {/* Logo + siteName — {typography.heading-md} 16px/500/1.75, {colors.ink} #111111 */}
            <Link href="/" className="flex items-center gap-3 shrink-0">
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={logoUrl}
                  alt={siteName}
                  className="h-8 w-8 object-contain"
                  width={32}
                  height={32}
                />
              ) : (
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#111111] text-[12px] font-medium text-white">
                  {siteName.charAt(0).toUpperCase()}
                </span>
              )}
              <span
                // {typography.heading-md} 16px/500/1.75, {colors.ink} #111111
                className="text-[16px] font-medium leading-[1.75] tracking-[0] text-[#111111]"
              >
                {siteName}
              </span>
            </Link>

            {/* Primary nav — {typography.body-strong} 16px/500, {colors.ink} #111111, hidden on mobile */}
            <nav className="hidden items-center gap-6 md:flex" aria-label="Primary">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  // {typography.heading-md} 16px/500/1.75 for nav links, {colors.ink} #111111, hover {colors.mute} #707072
                  className="text-[16px] font-medium leading-[1.75] text-[#111111] transition-colors hover:text-[#707072]"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right cluster — cart + auth — {rounded.full} pills, {colors.ink} / {colors.soft-cloud} */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Cart icon with badge — {component.button-icon-circular} 40px, {colors.soft-cloud} #f5f5f5, badge {colors.ink} #111111 */}
              <Link
                href="/cart"
                aria-label="Cart"
                className="relative flex h-10 w-10 items-center justify-center rounded-full bg-[#f5f5f5] text-[#111111] transition-colors hover:bg-[#e5e5e5]"
              >
                <ShoppingBag className="h-5 w-5" />
                <CartBadge />
              </Link>

              {/* Theme toggle — {component.button-icon-circular} 40px, {colors.soft-cloud} #f5f5f5 */}
              <ThemeToggle />

              {/* Auth links — {typography.button-sm} 14px/500, pill variants */}
              <Link
                href="/login"
                // {typography.caption-md} 14px/500/1.5, {colors.mute} #707072 hover {colors.ink} #111111 on mobile, auth pill on desktop
                className="hidden text-[14px] font-medium leading-[1.5] text-[#707072] hover:text-[#111111] sm:inline-flex"
              >
                Login
              </Link>
              <Link
                href="/register"
                // {component.button-primary} bg {colors.ink} #111111 text {colors.canvas} #ffffff, {rounded.full} 9999px, {typography.button-sm}
                className="inline-flex h-9 items-center justify-center rounded-full bg-[#111111] px-5 text-[14px] font-medium leading-[1.5] text-white transition-opacity hover:opacity-90"
              >
                Sign up
              </Link>
            </div>
          </div>

          {/* Mobile nav row — scrollable, {typography.caption-md} */}
          <div className="border-t border-[#f5f5f5] md:hidden">
            <nav className="flex gap-4 overflow-x-auto px-4 py-2" aria-label="Primary mobile">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="whitespace-nowrap text-[14px] font-medium leading-[1.5] text-[#111111]"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>

        <main>{children}</main>

        {/* Footer — {component.footer} bg {colors.canvas} #ffffff, text {colors.mute} #707072, {typography.caption-md} 14px/500/1.5, top divider {colors.hairline} #cacacb */}
        <footer className="border-t border-[#cacacb] bg-[#ffffff] text-[#707072]">
          <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
            <div className="grid gap-8 md:grid-cols-3">
              {/* Contact primary — labels {typography.caption-md} 14px/500, values {colors.ink} #111111 or {colors.mute} */}
              <div className="space-y-4">
                <h3 className="text-[14px] font-medium leading-[1.5] text-[#111111]">Contact</h3>
                <div className="space-y-3">
                  {primaryPhone ? (
                    <div>
                      <p className="text-[12px] font-medium uppercase tracking-wide text-[#707072]">{primaryPhone.label || 'Phone'}</p>
                      <a href={`tel:${primaryPhone.number}`} className="text-[14px] font-medium leading-[1.5] text-[#111111] hover:underline">
                        {primaryPhone.number}
                      </a>
                    </div>
                  ) : (
                    <p className="text-[14px] leading-[1.5]">No phone configured</p>
                  )}
                  {primaryEmail ? (
                    <div>
                      <p className="text-[12px] font-medium uppercase tracking-wide text-[#707072]">{primaryEmail.label || 'Email'}</p>
                      <a href={`mailto:${primaryEmail.email}`} className="text-[14px] font-medium leading-[1.5] text-[#111111] hover:underline">
                        {primaryEmail.email}
                      </a>
                    </div>
                  ) : (
                    <p className="text-[14px] leading-[1.5]">No email configured</p>
                  )}
                  {primaryAddress ? (
                    <div>
                      <p className="text-[12px] font-medium uppercase tracking-wide text-[#707072]">{primaryAddress.label || 'Address'}</p>
                      <p className="text-[14px] leading-[1.5] text-[#111111]">{primaryAddress.address}</p>
                    </div>
                  ) : (
                    <p className="text-[14px] leading-[1.5]">No address configured</p>
                  )}
                </div>
              </div>

              {/* Navigation */}
              <div className="space-y-4">
                <h3 className="text-[14px] font-medium leading-[1.5] text-[#111111]">Explore</h3>
                <ul className="space-y-2">
                  {NAV_LINKS.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="text-[14px] font-medium leading-[1.5] hover:text-[#111111] hover:underline">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                  <li>
                    <Link href="/cart" className="text-[14px] font-medium leading-[1.5] hover:text-[#111111] hover:underline">
                      Cart
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Social — icons open in new tab, fallback text if no icon */}
              <div className="space-y-4">
                <h3 className="text-[14px] font-medium leading-[1.5] text-[#111111]">Follow us</h3>
                {socialLinks && socialLinks.length > 0 ? (
                  <ul className="flex flex-wrap gap-3">
                    {socialLinks.map((social) => {
                      const iconUrl =
                        social.icon && typeof social.icon === 'object' && 'url' in social.icon
                          ? (social.icon as Media).url ?? null
                          : null
                      return (
                        <li key={social.id ?? social.url}>
                          <a
                            href={social.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={social.name}
                            title={social.description ?? social.name}
                            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f5f5f5] text-[#111111] transition-colors hover:bg-[#e5e5e5]"
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
                  <p className="text-[14px] leading-[1.5]">No social links configured</p>
                )}
              </div>
            </div>

            {/* Copyright — {typography.utility-xs} 9px/500/1.75, {colors.mute} #707072 */}
            <div className="mt-8 border-t border-[#e5e5e5] pt-6">
              <p className="text-center text-[12px] font-medium leading-[1.5] text-[#707072] sm:text-left">
                © {new Date().getFullYear()} {siteName}. All rights reserved.
              </p>
            </div>
          </div>
        </footer>

        <Toaster richColors closeButton />
      </body>
    </html>
  )
}
