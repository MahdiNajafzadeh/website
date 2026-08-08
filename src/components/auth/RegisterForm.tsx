'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { AlertCircle } from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type Props = {
    redirectTo?: string
}

export const RegisterForm = ({ redirectTo }: Props) => {
    const router = useRouter()
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

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
                throw new Error(data?.errors?.[0]?.message ?? 'خطا در ثبت‌نام')
            }
            const loginRes = await fetch('/api/users/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ email, password }),
            })
            if (!loginRes.ok) {
                throw new Error('ثبت‌نام انجام شد ولی ورود خودکار ناموفق بود. لطفاً وارد شوید.')
            }
            router.refresh()
            router.push(redirectTo ?? '/account')
        } catch (e) {
            setError(e instanceof Error ? e.message : 'خطای ناشناخته')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <form onSubmit={onSubmit} className="grid gap-4">
            <div className="grid gap-1.5">
                <Label htmlFor="name">نام و نام خانوادگی</Label>
                <Input id="name" name="name" required autoComplete="name" />
            </div>
            <div className="grid gap-1.5">
                <Label htmlFor="email">ایمیل</Label>
                <Input id="email" name="email" type="email" required autoComplete="email" />
            </div>
            <div className="grid gap-1.5">
                <Label htmlFor="password">رمز عبور</Label>
                <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    minLength={8}
                    autoComplete="new-password"
                />
                <p className="text-xs text-muted-foreground">حداقل ۸ کاراکتر</p>
            </div>

            {error ? (
                <Alert variant="destructive">
                    <AlertCircle className="size-4" />
                    <AlertTitle>خطا</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            ) : null}

            <Button type="submit" disabled={submitting}>
                {submitting ? 'در حال ثبت‌نام...' : 'ثبت‌نام'}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
                قبلاً ثبت‌نام کرده‌اید؟{' '}
                <Link
                    href={`/login${redirectTo ? `?redirect=${encodeURIComponent(redirectTo)}` : ''}`}
                    className="text-primary hover:underline"
                >
                    وارد شوید
                </Link>
            </p>
        </form>
    )
}