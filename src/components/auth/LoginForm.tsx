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

export const LoginForm = ({ redirectTo }: Props) => {
    const router = useRouter()
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setSubmitting(true)
        setError(null)
        const fd = new FormData(event.currentTarget)
        const email = String(fd.get('email') ?? '')
        const password = String(fd.get('password') ?? '')

        try {
            const res = await fetch('/api/users/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ email, password }),
            })
            const data = await res.json()
            if (!res.ok) {
                throw new Error(data?.errors?.[0]?.message ?? 'خطا در ورود')
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
                    autoComplete="current-password"
                />
            </div>

            {error ? (
                <Alert variant="destructive">
                    <AlertCircle className="size-4" />
                    <AlertTitle>خطا</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            ) : null}

            <Button type="submit" disabled={submitting}>
                {submitting ? 'در حال ورود...' : 'ورود'}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
                حساب ندارید؟{' '}
                <Link
                    href={`/register${redirectTo ? `?redirect=${encodeURIComponent(redirectTo)}` : ''}`}
                    className="text-primary hover:underline"
                >
                    ثبت‌نام کنید
                </Link>
            </p>
        </form>
    )
}