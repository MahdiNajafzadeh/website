'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'

// Design tokens used:
// {colors.ink} #111111, {colors.canvas} #ffffff, {colors.soft-cloud} #f5f5f5,
// {colors.hairline} #cacacb, {colors.mute} #707072,
// {typography.heading-md} 16/500/1.75, {typography.heading-xl} 32/500/1.2,
// {typography.body-md} 16/400/1.5, {typography.button-md} 16/500/1.5,
// {rounded.full} 9999px (rounded-full), {rounded.md} 24px,
// {component.button-primary} bg {colors.ink} text {colors.on-primary} rounded-full h-12 px-8

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
        body: JSON.stringify({ phone: phone.trim(), password }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        const msg =
          (data?.errors?.[0]?.message as string) ||
          (data?.message as string) ||
          'Login failed. Check phone and password.'
        throw new Error(msg)
      }

      router.push(nextParam)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[70vh] bg-white flex items-center justify-center px-4 py-12">
      {/* canvas {colors.canvas} */}
      <div className="w-full max-w-[440px]">
        <h1
          className="text-[32px] font-medium leading-[1.2] text-[#111111] text-center"
          style={{ fontFamily: 'Helvetica Now Display Medium, Helvetica, Arial, sans-serif' }}
        >
          {/* {typography.heading-xl} */}
          Sign in
        </h1>
        <p className="mt-2 text-center text-sm font-medium text-[#707072] leading-[1.5]">
          {/* {colors.mute} */}
          Enter your phone and password.
        </p>

        <form onSubmit={onSubmit} noValidate className="mt-8 space-y-5">
          <div className="space-y-2">
            <label
              htmlFor="phone"
              className="block text-sm font-medium leading-[1.75] text-[#111111]"
            >
              {/* {typography.heading-md} on {colors.ink} */}
              Phone
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              inputMode="numeric"
              autoComplete="username"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="09123456789"
              className="h-12 w-full rounded-[24px] border border-[#cacacb] bg-white px-4 text-base font-normal text-[#111111] placeholder:text-[#9e9ea0] outline-none focus:border-[#111111] focus:ring-2 focus:ring-[#111111]/10"
              // {colors.hairline} border, {rounded.md}, {typography.body-md}, focus {colors.ink}
            />
            <p className="text-xs font-medium text-[#707072]">Use the 11-digit Iranian mobile starting with 09.</p>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="block text-sm font-medium leading-[1.75] text-[#111111]"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="h-12 w-full rounded-[24px] border border-[#cacacb] bg-white px-4 text-base font-normal text-[#111111] placeholder:text-[#9e9ea0] outline-none focus:border-[#111111] focus:ring-2 focus:ring-[#111111]/10"
            />
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-[12px] border border-[#d30005]/20 bg-[#d30005]/5 px-4 py-3 text-sm font-medium text-[#d30005]"
            >
              {/* {colors.sale} */}
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex h-12 w-full items-center justify-center rounded-full bg-[#111111] px-8 text-base font-medium leading-[1.5] text-white transition-opacity hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            // {component.button-primary} : {colors.ink} bg, {colors.on-primary} text, {typography.button-md}, {rounded.full}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>

          <p className="text-center text-sm font-medium text-[#707072]">
            No account?{' '}
            <Link
              href={nextParam !== '/' ? `/register?next=${encodeURIComponent(nextParam)}` : '/register'}
              className="font-medium text-[#111111] underline underline-offset-4"
            >
              {/* {typography.link-md} / {colors.ink} */}
              Create account
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] bg-white flex items-center justify-center px-4 py-12">
          <p className="text-sm text-[#707072]">Loading…</p>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  )
}
