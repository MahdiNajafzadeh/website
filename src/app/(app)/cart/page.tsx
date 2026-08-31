import Link from 'next/link'

import { CartView } from '@/components/cart/CartView'
import { getSiteSettings } from '@/lib/site-settings'
import { getCurrentUser } from '@/lib/current-user'

export const metadata = {
  title: 'Cart',
  description: 'Review and update your cart items before checkout.',
}

export default async function CartPage() {
  const [settings, currentUser] = await Promise.all([getSiteSettings(), getCurrentUser()])
  const partnerDiscount = settings?.partnerDiscount ?? 0
  const customerType = currentUser?.customerType ?? 'regular'

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* {typography.heading-xl} 32px/500 */}
      <h1 className="text-[32px] font-medium leading-[1.2] text-[#111111] mb-2">Your Cart</h1>
      <p className="text-[14px] font-medium text-[#707072] mb-8">
        Review your items and proceed to checkout.
      </p>

      <CartView partnerDiscount={partnerDiscount} customerType={customerType} />

      <div className="mt-8 flex items-center justify-between">
        <Link
          href="/products"
          className="inline-flex h-12 items-center justify-center rounded-full border border-[#cacacb] bg-[#ffffff] px-8 text-[16px] font-medium text-[#111111] hover:bg-[#f5f5f5]"
          // {component.button-outline-on-image} style
        >
          Continue Shopping
        </Link>
        <Link
          href="/checkout"
          className="inline-flex h-12 items-center justify-center rounded-full bg-[#111111] px-8 text-[16px] font-medium leading-[1.5] text-white hover:opacity-90"
          // {component.button-primary}
        >
          Proceed to Checkout
        </Link>
      </div>
    </div>
  )
}