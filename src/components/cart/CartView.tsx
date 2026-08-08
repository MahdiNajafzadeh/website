'use client'

import { Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { formatPriceToman } from '@/lib/format'
import { removeFromCart, updateQuantity } from '@/lib/cart'
import { useCart } from '@/lib/use-cart'

export const CartView = () => {
    const { items, total } = useCart()

    if (items.length === 0) {
        return (
            <Card className="flex flex-col items-center gap-4 p-10 text-center">
                <ShoppingCart className="size-12 text-muted-foreground" />
                <p className="text-muted-foreground">سبد خرید شما خالی است.</p>
                <Button render={<Link href="/products" />}>مشاهده محصولات</Button>
            </Card>
        )
    }

    return (
        <div className="grid gap-6 md:grid-cols-[1fr_320px]">
            <div className="space-y-3">
                {items.map((item) => (
                    <Card key={String(item.productId)} className="p-4">
                        <div className="flex gap-4">
                            {item.image ? (
                                <Image
                                    src={item.image}
                                    alt={item.name}
                                    width={96}
                                    height={96}
                                    className="size-24 rounded-md object-cover"
                                />
                            ) : (
                                <div className="flex size-24 items-center justify-center rounded-md bg-muted text-xs text-muted-foreground">
                                    تصویر
                                </div>
                            )}
                            <div className="flex flex-1 flex-col gap-2">
                                <div className="flex items-start justify-between gap-2">
                                    <Link
                                        href={`/products/${item.slug}`}
                                        className="font-medium hover:underline"
                                    >
                                        {item.name}
                                    </Link>
                                    <Button
                                        variant="ghost"
                                        size="icon-sm"
                                        aria-label="حذف"
                                        onClick={() => removeFromCart(item.productId)}
                                    >
                                        <Trash2 className="text-destructive" />
                                    </Button>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    {formatPriceToman(item.price)}
                                </p>
                                <div className="mt-auto flex items-center gap-2">
                                    <div className="flex items-center rounded-md border">
                                        <button
                                            type="button"
                                            aria-label="کاهش"
                                            onClick={() =>
                                                updateQuantity(item.productId, item.quantity - 1)
                                            }
                                            className="px-3 py-1"
                                        >
                                            <Minus className="size-3" />
                                        </button>
                                        <span className="min-w-8 border-x px-2 py-1 text-center text-sm">
                                            {item.quantity}
                                        </span>
                                        <button
                                            type="button"
                                            aria-label="افزایش"
                                            onClick={() =>
                                                updateQuantity(item.productId, item.quantity + 1)
                                            }
                                            className="px-3 py-1"
                                        >
                                            <Plus className="size-3" />
                                        </button>
                                    </div>
                                    <span className="ms-auto text-sm font-bold">
                                        {formatPriceToman(item.price * item.quantity)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            <Card className="h-fit p-4">
                <h2 className="mb-3 text-base font-semibold">خلاصه سفارش</h2>
                <div className="flex flex-col gap-1.5 text-sm">
                    {items.map((item) => (
                        <div
                            key={String(item.productId)}
                            className="flex justify-between text-muted-foreground"
                        >
                            <span className="line-clamp-1">
                                {item.name} × {item.quantity}
                            </span>
                            <span>{formatPriceToman(item.price * item.quantity)}</span>
                        </div>
                    ))}
                </div>
                <Separator className="my-3" />
                <div className="flex items-center justify-between">
                    <span className="font-medium">جمع کل:</span>
                    <span className="text-lg font-bold">{formatPriceToman(total)}</span>
                </div>
                <Button className="mt-4 w-full" render={<Link href="/checkout" />}>
                    ادامه فرایند خرید
                </Button>
            </Card>
        </div>
    )
}