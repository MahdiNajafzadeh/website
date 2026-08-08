import Link from 'next/link'

import { MediaImage } from '@/components/MediaImage'
import { SocialIcon } from '@/components/SocialIcon'
import { getSiteSettings, sortSocialLinks } from '@/lib/site-settings'

const normalizeUrlHref = (raw: string | null | undefined): string | null => {
    if (!raw) return null
    const trimmed = raw.trim()
    if (!trimmed) return null
    if (/^https?:\/\//i.test(trimmed)) return trimmed
    if (trimmed.startsWith('@')) return `https://t.me/${trimmed.slice(1)}`
    return `https://${trimmed}`
}

const normalizePhoneHref = (raw: string | null | undefined): string | null => {
    if (!raw) return null
    const digits = raw.replace(/[^\d+]/g, '')
    return digits ? `tel:${digits}` : null
}

const normalizeEmailHref = (raw: string | null | undefined): string | null => {
    if (!raw) return null
    return `mailto:${raw.trim()}`
}

type PhoneRow = { id?: number | string; number?: string | null; isPrimary?: boolean | null }
type EmailRow = { id?: number | string; email?: string | null; isPrimary?: boolean | null }

export const Footer = async () => {
    const settings = await getSiteSettings()
    const year = new Date().getFullYear()
    const contact = settings?.contactInfo
    const primaryPhone = (contact?.phones as PhoneRow[] | undefined)?.find((p) => p.isPrimary)
    const fallbackPhone = (contact?.phones as PhoneRow[] | undefined)?.[0]
    const primaryEmail = (contact?.emails as EmailRow[] | undefined)?.find((e) => e.isPrimary)
    const fallbackEmail = (contact?.emails as EmailRow[] | undefined)?.[0]
    const phone = primaryPhone ?? fallbackPhone
    const email = primaryEmail ?? fallbackEmail
    const socials = sortSocialLinks(settings?.socialLinks)
    const primaryAddress = (contact?.addresses as { id?: number | string; address?: string | null; isPrimary?: boolean | null }[] | undefined)?.find(
        (a) => a.isPrimary,
    )
    const fallbackAddress = (contact?.addresses as { id?: number | string; address?: string | null; isPrimary?: boolean | null }[] | undefined)?.[0]
    const address = primaryAddress ?? fallbackAddress

    return (
        <footer className="mt-16 border-t bg-muted/30">
            <div className="container mx-auto grid gap-8 px-4 py-10 md:grid-cols-4">
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <MediaImage
                            media={settings?.logo}
                            alt={settings?.siteName ?? 'آبفارین'}
                            width={32}
                            height={32}
                            className="size-8 rounded-md object-cover"
                        />
                        <span className="text-base font-bold">
                            {settings?.siteName ?? 'آبفارین'}
                        </span>
                    </div>
                    {address?.address ? (
                        <p className="whitespace-pre-line text-sm text-muted-foreground">
                            {address.address}
                        </p>
                    ) : null}
                </div>

                <div className="space-y-2">
                    <h3 className="text-sm font-semibold">دسترسی سریع</h3>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                        <li>
                            <Link href="/products" className="hover:text-foreground">
                                محصولات
                            </Link>
                        </li>
                        <li>
                            <Link href="/brands" className="hover:text-foreground">
                                برندها
                            </Link>
                        </li>
                        <li>
                            <Link href="/cart" className="hover:text-foreground">
                                سبد خرید
                            </Link>
                        </li>
                        <li>
                            <Link href="/contact" className="hover:text-foreground">
                                تماس با ما
                            </Link>
                        </li>
                        <li>
                            <Link href="/login" className="hover:text-foreground">
                                ورود / ثبت‌نام
                            </Link>
                        </li>
                    </ul>
                </div>

                <div className="space-y-2">
                    <h3 className="text-sm font-semibold">تماس</h3>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                        {phone?.number ? (
                            <li>
                                <span>تلفن: </span>
                                {(() => {
                                    const href = normalizePhoneHref(phone.number)
                                    return href ? (
                                        <a dir="ltr" href={href} className="hover:text-foreground">
                                            {phone.number}
                                        </a>
                                    ) : (
                                        <span dir="ltr">{phone.number}</span>
                                    )
                                })()}
                            </li>
                        ) : null}
                        {email?.email ? (
                            <li>
                                <span>ایمیل: </span>
                                {(() => {
                                    const href = normalizeEmailHref(email.email)
                                    return href ? (
                                        <a dir="ltr" href={href} className="hover:text-foreground">
                                            {email.email}
                                        </a>
                                    ) : (
                                        <span dir="ltr">{email.email}</span>
                                    )
                                })()}
                            </li>
                        ) : null}
                    </ul>
                </div>

                <div className="space-y-2">
                    <h3 className="text-sm font-semibold">پیام‌رسان‌ها</h3>
                    {socials.length > 0 ? (
                        <ul className="flex flex-wrap gap-2">
                            {socials.map((s) => {
                                const href = normalizeUrlHref(s.url)
                                const icon =
                                    s.icon && typeof s.icon !== 'number' && typeof s.icon !== 'string'
                                        ? s.icon
                                        : null
                                return (
                                    <li key={String(s.id)}>
                                        {href ? (
                                            <a
                                                href={href}
                                                target="_blank"
                                                rel="noreferrer"
                                                title={s.description ?? s.label ?? s.name ?? ''}
                                                aria-label={s.label ?? s.name ?? ''}
                                                className="inline-block"
                                            >
                                                <SocialIcon icon={icon} name={s.name ?? s.label ?? ''} size="sm" />
                                            </a>
                                        ) : (
                                            <SocialIcon
                                                icon={icon}
                                                name={s.name ?? s.label ?? ''}
                                                size="sm"
                                            />
                                        )}
                                    </li>
                                )
                            })}
                        </ul>
                    ) : (
                        <p className="text-sm text-muted-foreground">هنوز موردی ثبت نشده.</p>
                    )}
                </div>
            </div>

            <div className="border-t py-4">
                <div className="container mx-auto flex flex-col items-center justify-between gap-2 px-4 text-xs text-muted-foreground sm:flex-row">
                    <span>© {year} {settings?.siteName ?? 'آبفارین'} — تمامی حقوق محفوظ است.</span>
                    {settings?.brandLogos && settings.brandLogos.length > 0 ? (
                        <div className="flex flex-wrap items-center gap-2">
                            {settings.brandLogos.map((logo, i) =>
                                logo.image ? (
                                    <MediaImage
                                        key={i}
                                        media={logo.image}
                                        alt={logo.alt ?? ''}
                                        width={48}
                                        height={24}
                                        className="h-6 w-12 object-contain opacity-60 grayscale"
                                    />
                                ) : null,
                            )}
                        </div>
                    ) : null}
                </div>
            </div>
        </footer>
    )
}