'use client'

import { Copy, Check } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { AlertCircle, CheckCircle2 } from 'lucide-react'

import { useTranslation } from '@/components/i18n/TranslationProvider'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { Locale } from '@/lib/locale'
import { localeHref } from '@/lib/locale'
import { sanitizeRedirect } from '@/lib/redirect'
import { useBeforeUnload } from '@/lib/use-before-unload'

type Props = {
    redirectTo?: string
    locale: Locale
}

// ponytail: lenient — strip non-digits, require 11 digits.
const validatePhone = (raw: string): boolean => raw.replace(/\D+/g, '').length === 11

type SuccessPayload = {
    phone: string
    password: string
}

export const RegisterForm = ({ redirectTo, locale }: Props) => {
    const router = useRouter()
    const { t } = useTranslation()
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [dirty, setDirty] = useState(false)
    const [success, setSuccess] = useState<SuccessPayload | null>(null)
    const [copied, setCopied] = useState(false)
    useBeforeUnload(dirty && !submitting && !success)

    const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setSubmitting(true)
        setError(null)
        const fd = new FormData(event.currentTarget)
        const firstName = String(fd.get('firstName') ?? '').trim()
        const lastName = String(fd.get('lastName') ?? '').trim()
        const phone = String(fd.get('phone') ?? '').trim()
        const email = String(fd.get('email') ?? '').trim()
        const city = String(fd.get('city') ?? '').trim()
        const address = String(fd.get('address') ?? '').trim()
        const province = String(fd.get('province') ?? '').trim()

        if (!firstName || !lastName) {
            setError(t('auth.register.errorFallback'))
            setSubmitting(false)
            return
        }
        if (!validatePhone(phone)) {
            setError(t('auth.register.errorFallback'))
            setSubmitting(false)
            return
        }
        if (!city || !address) {
            setError(t('auth.register.errorFallback'))
            setSubmitting(false)
            return
        }

        try {
            const res = await fetch('/api/users/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    firstName,
                    lastName,
                    phone,
                    email: email || undefined,
                    addresses: [
                        {
                            label: 'منزل',
                            fullName: `${firstName} ${lastName}`.trim(),
                            phone,
                            address,
                            city,
                            province,
                            isPrimary: true,
                        },
                    ],
                }),
            })
            const data = await res.json()
            if (!res.ok) {
                throw new Error(data?.message ?? t('auth.register.errorFallback'))
            }
            setSuccess({ phone: data?.user?.phone ?? phone.replace(/\D+/g, ''), password: data?.password })
        } catch (e) {
            setError(e instanceof Error ? e.message : t('common.unknownError'))
        } finally {
            setSubmitting(false)
        }
    }

    const copyPassword = async () => {
        if (!success) return
        try {
            await navigator.clipboard.writeText(success.password)
            setCopied(true)
            window.setTimeout(() => setCopied(false), 2000)
        } catch {
            // ignore
        }
    }

    const continueAfter = () => {
        router.refresh()
        router.push(redirectTo ? sanitizeRedirect(redirectTo) : localeHref(locale, '/account'))
    }

    if (success) {
        return (
            <div className="grid gap-4">
                <Alert role="status" aria-live="polite">
                    <CheckCircle2 className="size-4" aria-hidden="true" />
                    <AlertTitle>{t('auth.register.successTitle')}</AlertTitle>
                    <AlertDescription>{t('auth.register.successBody')}</AlertDescription>
                </Alert>

                <div className="rounded-md border bg-muted/40 p-4 text-sm">
                    <p className="mb-2 font-medium">{t('auth.register.credentialsLabel')}</p>
                    <div className="grid gap-2">
                        <div className="flex items-center justify-between gap-2">
                            <span className="text-muted-foreground">{t('auth.login.phone')}</span>
                            <code className="rounded bg-background px-2 py-1 text-xs" dir="ltr">
                                {success.phone}
                            </code>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                            <span className="text-muted-foreground">
                                {t('auth.register.credentialsLabel')}
                            </span>
                            <div className="flex items-center gap-1">
                                <code
                                    className="rounded bg-background px-2 py-1 text-xs"
                                    dir="ltr"
                                >
                                    {success.password}
                                </code>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={copyPassword}
                                    aria-label={t('auth.register.copyPassword')}
                                >
                                    {copied ? (
                                        <Check className="size-4 text-green-600" />
                                    ) : (
                                        <Copy className="size-4" />
                                    )}
                                </Button>
                                {copied ? (
                                    <span className="text-xs text-muted-foreground">
                                        {t('auth.register.copied')}
                                    </span>
                                ) : null}
                            </div>
                        </div>
                    </div>
                </div>

                <Button type="button" onClick={continueAfter}>
                    {t('auth.login.submit')}
                </Button>
            </div>
        )
    }

    return (
        <form onSubmit={onSubmit} className="grid gap-4" onChange={() => setDirty(true)}>
            <div className="grid gap-1.5">
                <Label htmlFor="firstName">{t('auth.register.firstName')}</Label>
                <Input id="firstName" name="firstName" required autoComplete="given-name" />
            </div>
            <div className="grid gap-1.5">
                <Label htmlFor="lastName">{t('auth.register.lastName')}</Label>
                <Input id="lastName" name="lastName" required autoComplete="family-name" />
            </div>
            <div className="grid gap-1.5">
                <Label htmlFor="phone">{t('auth.register.phone')}</Label>
                <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    required
                    spellCheck={false}
                />
            </div>
            <div className="grid gap-1.5">
                <Label htmlFor="email">{t('auth.register.emailOptional')}</Label>
                <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    spellCheck={false}
                />
            </div>
            <div className="grid gap-1.5">
                <Label htmlFor="address">{t('auth.register.address')}</Label>
                <Textarea id="address" name="address" required rows={2} autoComplete="street-address" />
            </div>
            <div className="grid gap-1.5">
                <Label htmlFor="city">{t('auth.register.city')}</Label>
                <Input id="city" name="city" required autoComplete="address-level2" />
            </div>
            <div className="grid gap-1.5">
                <Label htmlFor="province">{t('cart.checkout.province')}</Label>
                <Input id="province" name="province" autoComplete="address-level1" />
            </div>

            {error ? (
                <Alert role="alert" aria-live="assertive" variant="destructive">
                    <AlertCircle className="size-4" aria-hidden="true" />
                    <AlertTitle>{t('common.error')}</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            ) : null}

            <Button type="submit" disabled={submitting}>
                {submitting ? t('auth.register.submitting') : t('auth.register.submit')}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
                {t('auth.register.haveAccount')}{' '}
                <Link
                    href={`${localeHref(locale, '/login')}${redirectTo ? `?redirect=${encodeURIComponent(redirectTo)}` : ''}`}
                    className="text-primary hover:underline"
                >
                    {t('auth.register.signinCta')}
                </Link>
            </p>
        </form>
    )
}
