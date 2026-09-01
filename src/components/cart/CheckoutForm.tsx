"use client"

import { useEffect, useState, useTransition } from 'react'
import Link from 'next/link'
import { t, tFmt } from '@/lib/t'
import { useRouter } from 'next/navigation'
import { ShoppingBag } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useCartStore } from '@/lib/cart-store'
import { getPrice, type CustomerType } from '@/lib/pricing'

type Props = {
  initialAddress: string
  customerId: number
  partnerDiscount?: number
  customerType?: CustomerType
}

function formatToman(n: number): string {
  return `${Math.round(n).toLocaleString('en-US')} تومان`
}

export function CheckoutForm({
  initialAddress,
  customerId,
  partnerDiscount = 0,
  customerType = 'regular',
}: Props) {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [address, setAddress] = useState(initialAddress)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isPending, startTransition] = useTransition()
  const items = useCartStore((s) => s.items)
  const clearCart = useCartStore((s) => s.clearCart)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="rounded-[18px] bg-[#f5f5f5] p-8 text-center text-[14px] font-medium text-[#707072]">
        Loading…
      </div>
    )
  }

  if (items.length === 0 && !success) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-[18px] bg-[#f5f5f5] py-16 text-center">
        <ShoppingBag className="h-10 w-10 text-[#9e9ea0]" />
        <p className="text-[16px] font-medium text-[#111111]">{t('cart.empty')}</p>
        <Link
          href="/products"
          className="mt-2 inline-flex h-10 items-center justify-center rounded-full bg-[#111111] px-6 text-[14px] font-medium text-white hover:opacity-90"
        >
          {t('cart.browseProducts')}
        </Link>
      </div>
    )
  }

  const priced = items.map((item) => {
    const discounted = getPrice({ price: item.price }, customerType, partnerDiscount)
    const hasDiscount = discounted !== item.price && customerType === 'partner' && partnerDiscount > 0
    return { ...item, discounted, hasDiscount }
  })
  const grandTotal = priced.reduce((sum, i) => sum + i.discounted * i.quantity, 0)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!address.trim()) {
      setError('Shipping address is required.')
      return
    }
    startTransition(async () => {
      try {
        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            customer: customerId,
            shippingAddress: address,
            items: items.map((item) => ({
              product: item.productId ?? null,
              name: item.name,
              price: getPrice({ price: item.price }, customerType, partnerDiscount),
              quantity: item.quantity,
            })),
            status: 'review',
          }),
        })
        if (!res.ok) {
          const txt = await res.text()
          throw new Error(txt || `Order failed (${res.status})`)
        }
        // save address to profile too
        await fetch('/api/users/me', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ address }),
        }).catch(() => undefined)
        clearCart()
        setSuccess(true)
        startTransition(() => router.push('/orders'))
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Order failed'
        setError(msg)
      }
    })
  }

  return (
    <div className="grid gap-8 md:grid-cols-[1fr_360px]">
      <form onSubmit={onSubmit} className="space-y-4 rounded-[18px] border border-[#cacacb] bg-[#ffffff] p-6">
        <h2 className="text-[16px] font-medium text-[#111111]">Shipping Address</h2>
        <textarea
          required
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          rows={4}
          placeholder="Enter your full shipping address"
          className="w-full rounded-[18px] border border-[#cacacb] bg-[#ffffff] p-3 text-[14px] leading-[1.5] text-[#111111] focus:border-[#111111] focus:outline-none"
          // {component.search-pill} / {rounded.md}
        />
        {error && (
          <p className="rounded-[18px] bg-[#d30005]/10 p-3 text-[14px] font-medium text-[#d30005]">
            {error}
          </p>
        )}
        <Button
          type="submit"
          disabled={isPending}
          className="h-12 w-full rounded-full bg-[#111111] text-[16px] font-medium leading-[1.5] text-white hover:opacity-90"
        >
          {isPending ? 'Placing Order…' : 'Place Order'}
        </Button>
      </form>

      <aside className="h-fit rounded-[18px] border border-[#cacacb] bg-[#ffffff] p-6 space-y-4">
        <h2 className="text-[16px] font-medium text-[#111111]">Order Summary</h2>
        <div className="space-y-2 border-y border-[#e5e5e5] py-3">
          {priced.map((item) => (
            <div key={item.id} className="flex items-center justify-between text-[14px]">
              <span className="text-[#707072] truncate max-w-[200px]">
                {item.name} × {item.quantity}
              </span>
              <span className="text-[#111111] font-medium">
                {formatToman(item.discounted * item.quantity)}
              </span>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[16px] font-medium text-[#111111]">Total</span>
          <span className="text-[16px] font-medium text-[#111111]">{formatToman(grandTotal)}</span>
        </div>
        {customerType === 'partner' && partnerDiscount > 0 && (
          <p className="text-[12px] font-medium text-[#007d48]">
            Partner discount {partnerDiscount}% applied.
          </p>
        )}
      </aside>
    </div>
  )
}