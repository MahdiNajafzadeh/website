'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { AlertCircle } from 'lucide-react'

import { useTranslation } from '@/components/i18n/TranslationProvider'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Locale } from '@/lib/locale'
import { localeHref } from '@/lib/locale'
import { sanitizeRedirect } from '@/lib/redirect'
import { useBeforeUnload } from '@/lib/use-before-unload'

type Props = {
    redirectTo?: string
    locale: Locale
}

export const RegisterForm = ({ redirectTo, locale }: Props) => {
    const router = useRouter()
    const { t } = useTranslation()
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [dirty, setDirty] = useState(false)
    useBeforeUnload(dirty && !submitting)

    const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setSubmitting(true)
        setError(null)
        const fd = new FormData(event.currentTarget)
        const name = String(fd.get('name') ?? '')
        const email = String(fd.get('email') ?? '')
        const password = String(fd.get('password') ?? '')

        try {
            const res = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ name, email, password, role: 'customer' }),
            })
            const data = await res.json()
            if (!res.ok) {
                throw new Error(data?.errors?.[0]?.message ?? t('auth.register.errorFallback'))
            }
            const loginRes = await fetch('/api/users/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ email, password }),
            })
            if (!loginRes.ok) {
                throw new Error(t('auth.register.autoLoginFailed'))
            }
            router.refresh()
            router.push(redirectTo ? sanitizeRedirect(redirectTo) : localeHref(locale, '/account'))
        } catch (e) {
            setError(e instanceof Error ? e.message : t('common.unknownError'))
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <form onSubmit={onSubmit} className="grid gap-4" onChange={() => setDirty(true)}>
            <div className="grid gap-1.5">
                <Label htmlFor="name">{t('auth.register.name')}</Label>
                <Input id="name" name="name" required autoComplete="name" />
            </div>
            <div className="grid gap-1.5">
                <Label htmlFor="email">{t('auth.register.email')}</Label>
                <Input id="email" name="email" type="email" required autoComplete="email" inputMode="email" spellCheck={false} />
            </div>
            <div className="grid gap-1.5">
                <Label htmlFor="password">{t('auth.register.password')}</Label>
                <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    minLength={8}
                    autoComplete="new-password"
                />
                <p className="text-xs text-muted-foreground">{t('auth.register.passwordHint')}</p>
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
