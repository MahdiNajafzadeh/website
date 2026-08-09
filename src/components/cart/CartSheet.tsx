'use client'

import { useState } from 'react'
import { Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

import { useTranslation } from '@/components/i18n/TranslationProvider'
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
import { UndoToast } from '@/components/ui/undo-toast'
import { formatPriceToman } from '@/lib/format'
import { removeFromCart, restoreCartItem, updateQuantity } from '@/lib/cart'
import type { CartItem } from '@/lib/cart'
import type { Locale } from '@/lib/locale'
import { localeHref } from '@/lib/locale'
import { useCart } from '@/lib/use-cart'

type Props = {
    open: boolean
    onOpenChange: (open: boolean) => void
    locale: Locale
}

export const CartSheet = ({ open, onOpenChange, locale }: Props) => {
    const { t } = useTranslation()
    const { items, total } = useCart()
    const [pendingUndo, setPendingUndo] = useState<CartItem | null>(null)

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                        <ShoppingCart className="size-5" />
                        {t('cart.sheet.title')}
                    </SheetTitle>
                    <SheetDescription>
                        {items.length === 0
                            ? t('cart.sheet.empty')
                            : t('cart.sheet.itemCount', { count: items.length })}
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
                                                {t('cart.sheet.itemImage')}
                                            </div>
                                        )}
                                        <div className="flex flex-1 flex-col gap-1">
                                            <Link
                                                href={localeHref(locale, `/products/${item.slug}`)}
                                                className="line-clamp-2 text-sm font-medium hover:underline"
                                                onClick={() => onOpenChange(false)}
                                            >
                                                {item.name}
                                            </Link>
                                            <p className="text-xs text-muted-foreground">
                                                {formatPriceToman(item.price, locale)}
                                            </p>
                                            <div className="mt-auto flex items-center justify-between">
                                                <div className="flex items-center gap-1">
                                                    <Button
                                                        variant="outline"
                                                        size="icon-xs"
                                                        aria-label={t('cart.sheet.decrease')}
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
                                                        aria-label={t('cart.sheet.increase')}
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
                                                    aria-label={t('cart.sheet.remove')}
                                                    onClick={() => {
                                                        setPendingUndo(item)
                                                        removeFromCart(item.productId)
                                                    }}
                                                >
                                                    <Trash2 className="text-destructive" aria-hidden="true" />
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
                                <span className="text-muted-foreground">{t('cart.sheet.total')}</span>
                                <span className="font-bold">{formatPriceToman(total, locale)}</span>
                            </div>
                            <div className="flex w-full gap-2">
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => onOpenChange(false)}
                                >
                                    {t('cart.sheet.continue')}
                                </Button>
                                <Button
                                    className="flex-1"
                                    onClick={() => onOpenChange(false)}
                                    render={<Link href={localeHref(locale, '/checkout')} />}
                                >
                                    {t('cart.sheet.checkout')}
                                </Button>
                            </div>
                        </SheetFooter>
                    </>
                ) : (
                    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 text-center">
                        <ShoppingCart className="size-12 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                            {t('cart.sheet.emptyBody')}
                        </p>
                        <Button
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            render={<Link href={localeHref(locale, '/products')} />}
                        >
                            {t('cart.sheet.browse')}
                        </Button>
                    </div>
                )}
                {pendingUndo ? (
                    <UndoToast
                        message={t('cart.sheet.removed')}
                        actionLabel={t('cart.sheet.undo')}
                        onUndo={() => {
                            restoreCartItem(pendingUndo)
                            setPendingUndo(null)
                        }}
                        onExpire={() => setPendingUndo(null)}
                    />
                ) : null}
            </SheetContent>
        </Sheet>
    )
}
