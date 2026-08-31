'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'

// Tokens: {colors.ink} #111111, {colors.canvas} #ffffff, {colors.soft-cloud} #f5f5f5,
// {colors.hairline} #cacacb, {colors.mute} #707072, {colors.sale} #d30005,
// {typography.heading-xl} 32/500/1.2, {typography.heading-md} 16/500/1.75,
// {typography.button-md} 16/500/1.5, {rounded.full} 9999px, {rounded.md} 24px,
// {component.button-primary} bg ink / text on-primary / rounded-full / h-12

const PHONE_RE = /^09\d{9}$/

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const nextParam = searchParams.get('next') || '/'

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [address, setAddress] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const trimmedPhone = phone.trim()
    if (!PHONE_RE.test(trimmedPhone)) {
      setError('Invalid Iranian mobile number. Must be 11 digits starting with 09 (e.g. 09123456789).')
      return
    }
    if (!firstName.trim() || !lastName.trim()) {
      setError('First name and last name are required.')
      return
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setLoading(true)

    try {
      // 1) Create user via REST `POST /api/users` (no email sent).
      const createRes = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: trimmedPhone,
          password,
          address: address.trim() || undefined,
        }),
      })

      if (!createRes.ok) {
        const data = await createRes.json().catch(() => ({}))
        const msg =
          (data?.errors?.[0]?.message as string) ||
          (data?.message as string) ||
          'Registration failed.'
        throw new Error(msg)
      }

      // 2) Auto-login after registration — POST /api/users/login (phone-keyed).
      const loginRes = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ phone: trimmedPhone, password }),
      })

      if (!loginRes.ok) {
        // Registration succeeded but auto-login failed — send to login page
        router.push(`/login?next=${encodeURIComponent(nextParam)}`)
        return
      }

      router.push(nextParam)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'h-12 w-full rounded-[24px] border border-[#cacacb] bg-white px-4 text-base font-normal text-[#111111] placeholder:text-[#9e9ea0] outline-none focus:border-[#111111] focus:ring-2 focus:ring-[#111111]/10'
  const labelClass = 'block text-sm font-medium leading-[1.75] text-[#111111]'
  const textareaClass =
    'min-h-[96px] w-full rounded-[24px] border border-[#cacacb] bg-white px-4 py-3 text-base font-normal text-[#111111] placeholder:text-[#9e9ea0] outline-none focus:border-[#111111] focus:ring-2 focus:ring-[#111111]/10'

  return (
    <div className="min-h-[70vh] bg-white flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-[560px]">
        <h1
          className="text-[32px] font-medium leading-[1.2] text-[#111111] text-center"
          style={{ fontFamily: 'Helvetica Now Display Medium, Helvetica, Arial, sans-serif' }}
        >
          Create account
        </h1>
        <p className="mt-2 text-center text-sm font-medium text-[#707072]">
          Join with your phone — address is optional.
        </p>

        <form onSubmit={onSubmit} noValidate className="mt-8 space-y-5">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="firstName" className={labelClass}>
                First name <span className="text-[#d30005]">*</span>
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Ali"
                className={inputClass}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="lastName" className={labelClass}>
                Last name <span className="text-[#d30005]">*</span>
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Ahmadi"
                className={inputClass}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="phone" className={labelClass}>
              Phone <span className="text-[#d30005]">*</span>
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              inputMode="numeric"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="09123456789"
              pattern="09[0-9]{9}"
              className={inputClass}
            />
            <p className="text-xs font-medium text-[#707072]">Must be 11 digits starting with 09.</p>
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className={labelClass}>
              Password <span className="text-[#d30005]">*</span>
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className={inputClass}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="address" className={labelClass}>
              Address <span className="text-[#707072] font-normal">(optional)</span>
            </label>
            <textarea
              id="address"
              name="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Street, city, postal code…"
              rows={3}
              className={textareaClass}
            />
          </div>

          {error && (
            <div role="alert" className="rounded-[12px] border border-[#d30005]/20 bg-[#d30005]/5 px-4 py-3 text-sm font-medium text-[#d30005]">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex h-12 w-full items-center justify-center rounded-full bg-[#111111] px-8 text-base font-medium leading-[1.5] text-white transition-opacity hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            // {component.button-primary}
          >
            {loading ? 'Creating account…' : 'Create account'}
          </button>

          <p className="text-center text-sm font-medium text-[#707072]">
            Already have an account?{' '}
            <Link
              href={nextParam !== '/' ? `/login?next=${encodeURIComponent(nextParam)}` : '/login'}
              className="font-medium text-[#111111] underline underline-offset-4"
            >
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] bg-white flex items-center justify-center px-4 py-10">
          <p className="text-sm text-[#707072]">Loading…</p>
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  )
}
