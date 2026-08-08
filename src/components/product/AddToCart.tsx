'use client'

import { Plus, ShoppingCart } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { addToCart } from '@/lib/cart'
import { mediaUrl } from '@/lib/media'
import type { Product } from '@/payload-types'

type Props = {
    product: Product
    disabled?: boolean
}

export const AddToCart = ({ product, disabled }: Props) => {
    const [quantity, setQuantity] = useState(1)
    const [added, setAdded] = useState(false)

    const handleAdd = () => {
        if (disabled) return
        addToCart({
            productId: product.id,
            slug: product.slug ?? String(product.id),
            name: product.name,
            price: product.price,
            image: mediaUrl(product.images?.[0]?.image, 'thumbnail'),
            quantity,
        })
        setAdded(true)
        window.setTimeout(() => setAdded(false), 1500)
    }

    return (
        <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center rounded-md border">
                <button
                    type="button"
                    aria-label="کاهش"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3 py-2 text-lg"
                    disabled={disabled}
                >
                    −
                </button>
                <span className="min-w-10 border-x px-3 py-2 text-center text-sm">{quantity}</span>
                <button
                    type="button"
                    aria-label="افزایش"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="px-3 py-2 text-lg"
                    disabled={disabled}
                >
                    +
                </button>
            </div>
            <Button onClick={handleAdd} disabled={disabled} className="min-w-40">
                {added ? (
                    'به سبد اضافه شد'
                ) : (
                    <>
                        <ShoppingCart />
                        افزودن به سبد خرید
                    </>
                )}
            </Button>
            {disabled ? (
                <span className="text-sm text-destructive">این محصول فعلاً ناموجود است</span>
            ) : null}
        </div>
    )
}