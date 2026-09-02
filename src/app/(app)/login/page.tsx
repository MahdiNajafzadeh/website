'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'
import { t } from '@/lib/t'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const nextParam = searchParams.get('next') || '/'

  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username: phone.trim(), password }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        const msg = (data?.errors?.[0]?.message as string) || (data?.message as string) || t('auth.errorLogin')
        throw new Error(msg)
      }
      router.push(nextParam)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : t('auth.loginFailed'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-white dark:bg-[#111111] px-4 py-12">
      <div className="w-full max-w-[440px]">
        <h1 className="text-center text-[32px] font-medium leading-[1.2] text-[#111111] dark:text-white" style={{ fontFamily: 'Helvetica Now Display Medium, Helvetica, Arial, sans-serif' }}>
          {t('auth.signInTitle')}
        </h1>
        <p className="mt-2 text-center text-sm font-medium leading-[1.5] text-[#707072] dark:text-[#9e9ea0]">{t('auth.signInSubtitle')}</p>

        <form onSubmit={onSubmit} noValidate className="mt-8 space-y-5">
          <div className="space-y-2">
            <label htmlFor="phone" className="block text-sm font-medium leading-[1.75] text-[#111111] dark:text-white">
              {t('auth.phone')}
            </label>
            <input id="phone" name="phone" type="tel" inputMode="numeric" autoComplete="username" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="09123456789" className="h-12 w-full rounded-[24px] border border-[#cacacb] bg-white dark:bg-[#1a1a1a] dark:border-[#39393b] dark:text-white px-4 text-base font-normal text-[#111111] placeholder:text-[#9e9ea0] outline-none focus:border-[#111111] focus:ring-2 focus:ring-[#111111]/10 dark:focus:border-white" />
            <p className="text-xs font-medium text-[#707072] dark:text-[#9e9ea0]">{t('auth.usePhoneHint')}</p>
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium leading-[1.75] text-[#111111] dark:text-white">
              {t('auth.password')}
            </label>
            <input id="password" name="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="h-12 w-full rounded-[24px] border border-[#cacacb] bg-white dark:bg-[#1a1a1a] dark:border-[#39393b] dark:text-white px-4 text-base font-normal text-[#111111] placeholder:text-[#9e9ea0] outline-none focus:border-[#111111] focus:ring-2 focus:ring-[#111111]/10 dark:focus:border-white" />
          </div>

          {error && (
            <div role="alert" className="rounded-[12px] border border-[#d30005]/20 bg-[#d30005]/5 px-4 py-3 text-sm font-medium text-[#d30005]">
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="flex h-12 w-full items-center justify-center rounded-full bg-[#111111] dark:bg-white dark:text-[#111111] px-8 text-base font-medium leading-[1.5] text-white transition-opacity hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50">
            {loading ? t('auth.signingIn') : t('auth.submitLogin')}
          </button>

          <p className="text-center text-sm font-medium text-[#707072] dark:text-[#9e9ea0]">
            {t('auth.noAccount')}{' '}
            <Link href={nextParam !== '/' ? `/register?next=${encodeURIComponent(nextParam)}` : '/register'} className="font-medium text-[#111111] dark:text-white underline underline-offset-4">
              {t('auth.createAccountLink')}
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[70vh] flex items-center justify-center bg-white dark:bg-[#111111] px-4 py-12"><p className="text-sm text-[#707072] dark:text-[#9e9ea0]">{t('auth.loading')}</p></div>}>
      <LoginForm />
    </Suspense>
  )
}
