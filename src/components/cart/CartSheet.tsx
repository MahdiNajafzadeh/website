"use client"

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { useCartStore } from '@/lib/cart-store'
import { getPrice, type CustomerType } from '@/lib/pricing'

type Props = {
  /** Partner discount 0–100 fetched server-side — when provided cart totals are discounted */
  partnerDiscount?: number
  /** Customer type from users.customerType — 'regular' | 'partner' */
  customerType?: CustomerType
  /** Optional trigger variant — default bag button */
  triggerClassName?: string
}

function formatToman(n: number): string {
  return `${Math.round(n).toLocaleString('en-US')} تومان`
}

/**
 * CartSheet — slide-over cart preview triggered from header.
 * Design: SheetContent side="right" width sm:max-w-sm, bg {colors.canvas} #ffffff, text {colors.ink} #111111
 * Badge count = sum(qty) via cart-store. Remove shows sonner Undo toast 3s.
 * When partnerDiscount+customerType supplied, prices use getPrice and show original strikethrough with {colors.mute} #707072.
 */
export function CartSheet({ partnerDiscount = 0, customerType = 'regular', triggerClassName }: Props) {
  const [mounted, setMounted] = useState(false)
  const items = useCartStore((s) => s.items)
  const updateQuantity = useCartStore((s) => s.updateQuantity)
  const removeItem = useCartStore((s) => s.removeItem)
  const undoRemove = useCartStore((s) => s.undoRemove)

  useEffect(() => setMounted(true), [])

  const count = mounted ? items.reduce((sum, i) => sum + i.quantity, 0) : 0

  const priced = items.map((item) => {
    const discounted = getPrice({ price: item.price }, customerType, partnerDiscount)
    const hasDiscount = discounted !== item.price && customerType === 'partner' && partnerDiscount > 0
    return { ...item, discounted, hasDiscount }
  })

  const grandTotal = priced.reduce((sum, i) => sum + i.discounted * i.quantity, 0)

  const handleRemove = (id: string, name: string) => {
    removeItem(id)
    toast(`Removed ${name}`, {
      duration: 3000,
      action: {
        label: 'Undo',
        onClick: () => undoRemove(),
      },
    })
  }

  return (
    <Sheet>
      <SheetTrigger
        {...({ 'aria-label': 'Open cart' } as unknown as Record<string, unknown>)}
        className={
          triggerClassName ??
          'relative flex h-10 w-10 items-center justify-center rounded-full bg-[#f5f5f5] text-[#111111] transition-colors hover:bg-[#e5e5e5]'
        }
        // {component.button-icon-circular} 40px, {colors.soft-cloud} #f5f5f5, {colors.ink} #111111, {rounded.full}
      >
        <ShoppingBag className="h-5 w-5" />
        {mounted && count > 0 && (
          <span
            // {colors.ink} #111111 bg, {colors.canvas} #ffffff text, {rounded.full}, {typography.caption-sm}
            className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#111111] px-1 text-[11px] font-medium leading-none text-white"
            aria-label={`${count} items in cart`}
          >
            {count > 99 ? '99+' : count}
          </span>
        )}
      </SheetTrigger>

      {/* Slide-over from right — {colors.canvas} #ffffff, border {colors.hairline-soft} #e5e5e5 */}
      <SheetContent side="right" className="w-[90vw] sm:max-w-sm bg-[#ffffff] p-0 flex flex-col">
        <SheetHeader className="border-b border-[#e5e5e5] p-4">
          {/* {typography.heading-md} 16px/500 */}
          <SheetTitle className="text-[16px] font-medium leading-[1.75] text-[#111111]">
            Cart {count > 0 ? `· ${count} item${count > 1 ? 's' : ''}` : ''}
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          {priced.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#f5f5f5]">
                <ShoppingBag className="h-7 w-7 text-[#9e9ea0]" />
              </div>
              <p className="text-[16px] font-medium text-[#111111]">Your cart is empty</p>
              <p className="text-[14px] font-medium text-[#707072]">Browse products to add items.</p>
              <Link
                href="/products"
                className="mt-2 inline-flex h-10 items-center justify-center rounded-full bg-[#111111] px-6 text-[14px] font-medium text-white hover:opacity-90"
                // {component.button-primary}
              >
                Browse Products
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-[#f5f5f5]">
              {priced.map((item) => (
                <li key={item.id} className="flex gap-3 px-4 py-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-[18px] bg-[#f5f5f5]">
                    {item.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                    ) : (
                      <ShoppingBag className="h-6 w-6 text-[#9e9ea0]" />
                    )}
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <p className="line-clamp-2 text-[14px] font-medium leading-[1.5] text-[#111111]">{item.name}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      {item.hasDiscount ? (
                        <>
                          <span className="text-[14px] font-medium text-[#111111]">{formatToman(item.discounted)}</span>
                          <span className="text-[12px] font-medium text-[#707072] line-through">{formatToman(item.price)}</span>
                          {/* {colors.mute} #707072 strike-through original */}
                        </>
                      ) : (
                        <span className="text-[14px] font-medium text-[#111111]">{formatToman(item.price)}</span>
                      )}
                      <span className="text-[12px] text-[#707072]">× {item.quantity}</span>
                      <span className="text-[12px] font-medium text-[#111111]">
                        = {formatToman(item.discounted * item.quantity)}
                      </span>
                    </div>

                    <div className="mt-1 flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="icon-sm"
                        aria-label={`Decrease quantity for ${item.name}`}
                        className="h-7 w-7 rounded-full border-[#cacacb]"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </Button>
                      <span className="w-8 text-center text-[14px] font-medium text-[#111111]">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon-sm"
                        aria-label={`Increase quantity for ${item.name}`}
                        className="h-7 w-7 rounded-full border-[#cacacb]"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Remove ${item.name}`}
                        className="ml-auto h-7 w-7 rounded-full text-[#d30005] hover:bg-[#d30005]/10 hover:text-[#d30005]"
                        onClick={() => handleRemove(item.id, item.name)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {priced.length > 0 && (
          <div className="border-t border-[#e5e5e5] bg-white p-4 space-y-3">
            {/* Summary — grand total with {typography.body-strong} */}
            <div className="flex items-center justify-between">
              <span className="text-[16px] font-medium leading-[1.5] text-[#111111]">Total</span>
              <span className="text-[16px] font-medium leading-[1.5] text-[#111111]">{formatToman(grandTotal)}</span>
            </div>
            <div className="flex gap-2">
              <Link
                href="/cart"
                className="flex flex-1 h-10 items-center justify-center rounded-full bg-[#f5f5f5] px-4 text-[14px] font-medium text-[#111111] ring-1 ring-[#e5e5e5] hover:bg-[#e5e5e5]"
                // {component.button-secondary}
              >
                View Cart
              </Link>
              <Link
                href="/checkout"
                className="flex flex-1 h-10 items-center justify-center rounded-full bg-[#111111] px-4 text-[14px] font-medium text-white hover:opacity-90"
                // {component.button-primary} — {colors.ink} #111111, {rounded.full} 9999px, {typography.button-sm}
              >
                Checkout
              </Link>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
