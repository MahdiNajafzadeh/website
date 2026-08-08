'use client'

import { Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet'
import { formatPriceToman } from '@/lib/format'
import { removeFromCart, updateQuantity } from '@/lib/cart'
import { useCart } from '@/lib/use-cart'

type Props = {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export const CartSheet = ({ open, onOpenChange }: Props) => {
    const { items, total } = useCart()

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                        <ShoppingCart className="size-5" />
                        سبد خرید
                    </SheetTitle>
                    <SheetDescription>
                        {items.length === 0 ? 'سبد خرید شما خالی است' : `${items.length} محصول`}
                    </SheetDescription>
                </SheetHeader>

                {items.length > 0 ? (
                    <>
                        <div className="flex-1 overflow-y-auto px-4">
                            <ul className="flex flex-col gap-3">
                                {items.map((item) => (
                                    <li
                                        key={String(item.productId)}
                                        className="flex gap-3 rounded-lg border p-2"
                                    >
                                        {item.image ? (
                                            <Image
                                                src={item.image}
                                                alt={item.name}
                                                width={64}
                                                height={64}
                                                className="size-16 rounded-md object-cover"
                                            />
                                        ) : (
                                            <div className="flex size-16 items-center justify-center rounded-md bg-muted text-xs text-muted-foreground">
                                                تصویر
                                            </div>
                                        )}
                                        <div className="flex flex-1 flex-col gap-1">
                                            <Link
                                                href={`/products/${item.slug}`}
                                                className="line-clamp-2 text-sm font-medium hover:underline"
                                                onClick={() => onOpenChange(false)}
                                            >
                                                {item.name}
                                            </Link>
                                            <p className="text-xs text-muted-foreground">
                                                {formatPriceToman(item.price)}
                                            </p>
                                            <div className="mt-auto flex items-center justify-between">
                                                <div className="flex items-center gap-1">
                                                    <Button
                                                        variant="outline"
                                                        size="icon-xs"
                                                        aria-label="کاهش تعداد"
                                                        onClick={() =>
                                                            updateQuantity(
                                                                item.productId,
                                                                item.quantity - 1,
                                                            )
                                                        }
                                                    >
                                                        <Minus />
                                                    </Button>
                                                    <span className="min-w-6 text-center text-sm">
                                                        {item.quantity}
                                                    </span>
                                                    <Button
                                                        variant="outline"
                                                        size="icon-xs"
                                                        aria-label="افزایش تعداد"
                                                        onClick={() =>
                                                            updateQuantity(
                                                                item.productId,
                                                                item.quantity + 1,
                                                            )
                                                        }
                                                    >
                                                        <Plus />
                                                    </Button>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon-xs"
                                                    aria-label="حذف"
                                                    onClick={() => removeFromCart(item.productId)}
                                                >
                                                    <Trash2 className="text-destructive" />
                                                </Button>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <Separator />
                        <SheetFooter>
                            <div className="flex w-full items-center justify-between text-sm">
                                <span className="text-muted-foreground">جمع کل:</span>
                                <span className="font-bold">{formatPriceToman(total)}</span>
                            </div>
                            <div className="flex w-full gap-2">
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => onOpenChange(false)}
                                >
                                    ادامه خرید
                                </Button>
                                <Button
                                    className="flex-1"
                                    onClick={() => onOpenChange(false)}
                                    render={<Link href="/checkout" />}
                                >
                                    تسویه حساب
                                </Button>
                            </div>
                        </SheetFooter>
                    </>
                ) : (
                    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 text-center">
                        <ShoppingCart className="size-12 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">محصولی در سبد خرید شما نیست</p>
                        <Button
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            render={<Link href="/products" />}
                        >
                            مشاهده محصولات
                        </Button>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    )
}