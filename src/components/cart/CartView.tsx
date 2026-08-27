"use client";

import { useState } from "react";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { useTranslation } from "@/components/i18n/TranslationProvider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { UndoToast } from "@/components/ui/undo-toast";
import { removeFromCart, restoreCartItem, updateQuantity } from "@/lib/cart";
import type { CartItem } from "@/lib/cart";
import type { Locale } from "@/lib/locale";
import { localeHref } from "@/lib/locale";
import { formatPriceToman } from "@/lib/format";
import { useCart } from "@/lib/use-cart";

type Props = {
    locale: Locale;
};

export const CartView = ({ locale }: Props) => {
    const { t } = useTranslation();
    const { items, total } = useCart();
    const [pendingUndo, setPendingUndo] = useState<CartItem | null>(null);

    if (items.length === 0 && !pendingUndo) {
        return (
            <Card className="flex flex-col items-center gap-4 p-10 text-center">
                <ShoppingCart className="size-12 text-muted-foreground" />
                <p className="text-muted-foreground">{t("cart.view.empty")}</p>
                <Button render={<Link href={localeHref(locale, "/products")} />}>{t("cart.sheet.browse")}</Button>
            </Card>
        );
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
                                    {t("cart.sheet.itemImage")}
                                </div>
                            )}
                            <div className="flex min-w-0 flex-1 flex-col gap-2">
                                <div className="flex items-start justify-between gap-2">
                                    <Link
                                        href={localeHref(locale, `/products/${item.slug}`)}
                                        className="font-medium hover:underline"
                                    >
                                        {item.name}
                                    </Link>
                                    <Button
                                        variant="ghost"
                                        size="icon-sm"
                                        aria-label={t("cart.sheet.remove")}
                                        onClick={() => {
                                            setPendingUndo(item);
                                            removeFromCart(item.productId);
                                        }}
                                    >
                                        <Trash2 className="text-destructive" aria-hidden="true" />
                                    </Button>
                                </div>
                                <p className="text-sm text-muted-foreground">{formatPriceToman(item.price, locale)}</p>
                                <div className="mt-auto flex items-center gap-2">
                                    <div className="flex items-center rounded-md border">
                                        <button
                                            type="button"
                                            aria-label={t("cart.sheet.decrease")}
                                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                            className="px-3 py-1"
                                        >
                                            <Minus className="size-3" aria-hidden="true" />
                                        </button>
                                        <span className="min-w-8 border-x px-2 py-1 text-center text-sm">
                                            {item.quantity}
                                        </span>
                                        <button
                                            type="button"
                                            aria-label={t("cart.sheet.increase")}
                                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                            className="px-3 py-1"
                                        >
                                            <Plus className="size-3" aria-hidden="true" />
                                        </button>
                                    </div>
                                    <span className="ms-auto text-sm font-bold">
                                        {formatPriceToman(item.price * item.quantity, locale)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            <Card className="h-fit p-4">
                <h2 className="mb-3 text-base font-semibold">{t("cart.view.summary")}</h2>
                <div className="flex flex-col gap-1.5 text-sm">
                    {items.map((item) => (
                        <div key={String(item.productId)} className="flex justify-between text-muted-foreground">
                            <span className="line-clamp-1">
                                {item.name} × {item.quantity}
                            </span>
                            <span>{formatPriceToman(item.price * item.quantity, locale)}</span>
                        </div>
                    ))}
                </div>
                <Separator className="my-3" />
                <div className="flex items-center justify-between">
                    <span className="font-medium">{t("cart.sheet.total")}</span>
                    <span className="text-lg font-bold">{formatPriceToman(total, locale)}</span>
                </div>
                <Button className="mt-4 w-full" render={<Link href={localeHref(locale, "/checkout")} />}>
                    {t("cart.view.continue")}
                </Button>
            </Card>

            {pendingUndo ? (
                <UndoToast
                    message={t("cart.sheet.removed")}
                    actionLabel={t("cart.sheet.undo")}
                    onUndo={() => {
                        restoreCartItem(pendingUndo);
                        setPendingUndo(null);
                    }}
                    onExpire={() => setPendingUndo(null)}
                />
            ) : null}
        </div>
    );
};
