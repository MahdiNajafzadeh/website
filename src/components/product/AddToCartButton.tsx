'use client'

import { useCartStore } from '@/lib/cart-store'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { ShoppingBag } from 'lucide-react'

type Props = {
  product: {
    id: number | string
    name: string
    price: number | null
    inventory?: number | null
    image?: string
  }
  disabled?: boolean
}

export function AddToCartButton({ product, disabled }: Props) {
  const addItem = useCartStore((s) => s.addItem)
  const price = product.price ?? 0
  const inventory = product.inventory ?? 0
  const isOutOfStock = inventory <= 0

  const handleAdd = () => {
    if (isOutOfStock || disabled) return
    addItem({
      id: String(product.id),
      productId: String(product.id),
      name: product.name,
      price,
      image: product.image,
      quantity: 1,
    })
    toast.success('به سبد اضافه شد', {
      description: product.name,
    })
  }

  return (
    <Button
      onClick={handleAdd}
      disabled={isOutOfStock || disabled}
      /* {component.button-primary} — {colors.ink} #111111, {rounded.full} 9999px, {typography.button-md} 16px/500 */
      className="w-full rounded-full bg-[#111111] text-white hover:bg-[#111111]/90 h-12 text-[16px] font-medium"
      size="lg"
    >
      <ShoppingBag className="size-4" />
      {isOutOfStock ? 'ناموجود' : 'افزودن به سبد'}
    </Button>
  )
}
