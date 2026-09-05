import { t } from "@/lib/t";

/**
 * Pricing utilities — partner discount handling.
 * Spec: getPrice(product, customerType, discount)
 * - if partner and discount > 0 then price * (1 - discount/100) else price
 *
 * Pure helpers only — no server-only imports here. The server-side
 * `getPricingContext` lives in `@/lib/current-user`.
 */

export type CustomerType = "regular" | "partner";

export function getPrice(product: { price: number }, customerType: CustomerType, discount: number): number {
	const price = product.price ?? 0;
	if (customerType === "partner" && discount > 0) {
		const clamped = Math.min(Math.max(discount, 0), 100);
		return price * (1 - clamped / 100);
	}
	return price;
}

export function formatPrice(price: number, locale = "en-US", currency = "USD"): string {
	// For IR project this could be 'fa-IR' / 'IRR' but default stays USD for test stability
	// Callers can pass 'fa-IR' explicitly when rendering.
	return new Intl.NumberFormat(locale, {
		style: "currency",
		currency,
		maximumFractionDigits: 0,
	}).format(price);
}

/** Convenience: format as plain number with locale separator */
export function formatPriceNumber(price: number, locale = "en-US"): string {
	return new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(price);
}

export function formatToman(price: number, locale: "fa-IR" | "en-US" = "fa-IR"): string {
	return `${Math.round(price).toLocaleString(locale)} ${t("common.toman")}`;
}

export type PricedCartItem<T extends { price: number; quantity: number }> = T & {
	discounted: number;
	hasDiscount: boolean;
};

export function priceCartItems<T extends { price: number; quantity: number }>(
	items: T[],
	customerType: CustomerType,
	partnerDiscount: number,
): PricedCartItem<T>[] {
	return items.map((item) => {
		const discounted = getPrice({ price: item.price }, customerType, partnerDiscount);
		const hasDiscount =
			discounted !== item.price && customerType === "partner" && partnerDiscount > 0;
		return { ...item, discounted, hasDiscount };
	});
}

export function cartGrandTotal(priced: Array<{ discounted: number; quantity: number }>): number {
	return priced.reduce((sum, i) => sum + i.discounted * i.quantity, 0);
}
