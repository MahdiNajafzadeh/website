"use client";

import { Plus, ShoppingCart } from "lucide-react";
import { useState } from "react";

import { useTranslation } from "@/components/i18n/TranslationProvider";
import { Button } from "@/components/ui/button";
import { addToCart } from "@/lib/cart";
import type { Locale } from "@/lib/locale";
import { localizedValue } from "@/lib/localized";
import { mediaUrl } from "@/lib/media";
import type { Product } from "@/payload-types";

type Props = {
    product: Product;
    locale: Locale;
    disabled?: boolean;
};

export const AddToCart = ({ product, locale, disabled }: Props) => {
    const { t } = useTranslation();
    const [quantity, setQuantity] = useState(1);
    const [added, setAdded] = useState(false);

    const handleAdd = () => {
        if (disabled) return;
        addToCart({
            productId: product.id,
            slug: product.slug,
            name: localizedValue(product.name, locale),
            price: product.price,
            image: mediaUrl(product.images?.[0]?.image, "thumbnail"),
            quantity,
        });
        setAdded(true);
        window.setTimeout(() => setAdded(false), 1500);
    };

    return (
        <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center rounded-md border">
                <button
                    type="button"
                    aria-label={t("product.add.decrease")}
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3 py-2 text-lg"
                    disabled={disabled}
                >
                    −
                </button>
                <span className="min-w-10 border-x px-3 py-2 text-center text-sm">{quantity}</span>
                <button
                    type="button"
                    aria-label={t("product.add.increase")}
                    onClick={() => setQuantity((q) => q + 1)}
                    className="px-3 py-2 text-lg"
                    disabled={disabled}
                >
                    +
                </button>
            </div>
            <Button onClick={handleAdd} disabled={disabled} className="min-w-40">
                {added ? (
                    t("product.add.added")
                ) : (
                    <>
                        <ShoppingCart aria-hidden="true" />
                        {t("product.add.addToCart")}
                    </>
                )}
            </Button>
            <span role="status" aria-live="polite" className="sr-only">
                {added ? t("product.add.added") : ""}
            </span>
            {disabled ? <span className="text-sm text-destructive">{t("product.add.outOfStock")}</span> : null}
        </div>
    );
};
