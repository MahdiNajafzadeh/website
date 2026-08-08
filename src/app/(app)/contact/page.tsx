import { Building2, Mail, MapPin, Phone } from 'lucide-react'

import { SocialIcon } from '@/components/SocialIcon'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getSiteSettings, sortContactRows, sortSocialLinks } from '@/lib/site-settings'

export const metadata = {
    title: 'تماس با ما | آبفارین',
    description: 'راه‌های ارتباطی با فروشگاه آبفارین',
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

const normalizeUrlHref = (raw: string | null | undefined): string | null => {
    if (!raw) return null
    const trimmed = raw.trim()
    if (!trimmed) return null
    if (/^https?:\/\//i.test(trimmed)) return trimmed
    if (trimmed.startsWith('@')) return `https://t.me/${trimmed.slice(1)}`
    return `https://${trimmed}`
}

type PhoneRow = { id?: number | string; label?: string | null; number?: string | null; isPrimary?: boolean | null }
type EmailRow = { id?: number | string; label?: string | null; email?: string | null; isPrimary?: boolean | null }
type AddressRow = { id?: number | string; label?: string | null; address?: string | null; isPrimary?: boolean | null }

export default async function ContactPage() {
    const settings = await getSiteSettings()
    const contact = settings?.contactInfo
    const phones = sortContactRows(contact?.phones as PhoneRow[] | undefined)
    const emails = sortContactRows(contact?.emails as EmailRow[] | undefined)
    const addresses = sortContactRows(contact?.addresses as AddressRow[] | undefined)
    const socials = sortSocialLinks(settings?.socialLinks)

    const hasPhones = phones.length > 0
    const hasEmails = emails.length > 0
    const hasAddresses = addresses.length > 0
    const hasSocials = socials.length > 0
    const hasAny = hasPhones || hasEmails || hasAddresses || hasSocials

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold">تماس با ما</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                    از طریق یکی از راه‌های زیر با ما در ارتباط باشید
                </p>
            </div>

            {!hasAny ? (
                <Card className="p-10 text-center text-muted-foreground">
                    اطلاعات تماس هنوز در پنل مدیریت تنظیم نشده است.
                </Card>
            ) : (
                <div className="grid gap-6 md:grid-cols-2">
                    {hasPhones ? (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Phone className="size-4" />
                                    تلفن‌ها
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                {phones.map((p) => {
                                    const href = normalizePhoneHref(p.number)
                                    return (
                                        <div
                                            key={String(p.id)}
                                            className="flex items-start justify-between gap-3 rounded-md border p-3"
                                        >
                                            <div className="flex-1">
                                                <p className="font-medium">{p.label}</p>
                                                {href ? (
                                                    <a
                                                        href={href}
                                                        dir="ltr"
                                                        className="text-muted-foreground hover:text-foreground"
                                                    >
                                                        {p.number}
                                                    </a>
                                                ) : (
                                                    <span dir="ltr" className="text-muted-foreground">
                                                        {p.number}
                                                    </span>
                                                )}
                                            </div>
                                            {p.isPrimary ? <Badge>اصلی</Badge> : null}
                                        </div>
                                    )
                                })}
                            </CardContent>
                        </Card>
                    ) : null}

                    {hasEmails ? (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Mail className="size-4" />
                                    ایمیل‌ها
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                {emails.map((e) => {
                                    const href = normalizeEmailHref(e.email)
                                    return (
                                        <div
                                            key={String(e.id)}
                                            className="flex items-start justify-between gap-3 rounded-md border p-3"
                                        >
                                            <div className="flex-1">
                                                <p className="font-medium">{e.label}</p>
                                                {href ? (
                                                    <a
                                                        href={href}
                                                        dir="ltr"
                                                        className="text-muted-foreground hover:text-foreground"
                                                    >
                                                        {e.email}
                                                    </a>
                                                ) : (
                                                    <span dir="ltr" className="text-muted-foreground">
                                                        {e.email}
                                                    </span>
                                                )}
                                            </div>
                                            {e.isPrimary ? <Badge>اصلی</Badge> : null}
                                        </div>
                                    )
                                })}
                            </CardContent>
                        </Card>
                    ) : null}

                    {hasAddresses ? (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MapPin className="size-4" />
                                    آدرس‌ها
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                {addresses.map((a) => (
                                    <div
                                        key={String(a.id)}
                                        className="flex items-start justify-between gap-3 rounded-md border p-3"
                                    >
                                        <div className="flex-1">
                                            <p className="font-medium">{a.label}</p>
                                            <p className="whitespace-pre-line text-muted-foreground">
                                                {a.address}
                                            </p>
                                        </div>
                                        {a.isPrimary ? <Badge>اصلی</Badge> : null}
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    ) : null}

                    {hasSocials ? (
                        <Card>
                            <CardHeader>
                                <CardTitle>پیام‌رسان‌ها و شبکه‌های اجتماعی</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {socials.map((s) => {
                                    const href = normalizeUrlHref(s.url)
                                    const icon =
                                        s.icon && typeof s.icon !== 'number' && typeof s.icon !== 'string'
                                            ? s.icon
                                            : null
                                    return (
                                        <div
                                            key={String(s.id)}
                                            className="flex items-start gap-3 rounded-md border p-3"
                                        >
                                            <SocialIcon icon={icon} name={s.name ?? s.label ?? ''} size="md" />
                                            <div className="min-w-0 flex-1">
                                                <p className="font-medium">{s.name}</p>
                                                <p className="text-sm text-muted-foreground">{s.label}</p>
                                                {s.description ? (
                                                    <p className="mt-1 text-xs text-muted-foreground">
                                                        {s.description}
                                                    </p>
                                                ) : null}
                                                {href ? (
                                                    <a
                                                        href={href}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        dir="ltr"
                                                        className="mt-1 block truncate text-xs text-primary hover:underline"
                                                    >
                                                        {s.url}
                                                    </a>
                                                ) : null}
                                            </div>
                                        </div>
                                    )
                                })}
                            </CardContent>
                        </Card>
                    ) : null}
                </div>
            )}

            <Card className="mt-6">
                <CardContent className="flex items-start gap-3 p-4 text-sm">
                    <Building2 className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
                    <p className="text-muted-foreground">
                        {settings?.siteName
                            ? `تیم ${settings.siteName} در سریع‌ترین زمان ممکن به پیام شما پاسخ خواهد داد.`
                            : 'تیم فروش در سریع‌ترین زمان ممکن به پیام شما پاسخ خواهد داد.'}
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}