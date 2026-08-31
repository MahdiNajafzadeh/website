/**
 * Pricing utilities — partner discount handling.
 * Spec: getPrice(product, customerType, discount)
 * - if partner and discount > 0 then price * (1 - discount/100) else price
 */

export type CustomerType = 'regular' | 'partner'

export function getPrice(
  product: { price: number },
  customerType: CustomerType,
  discount: number,
): number {
  const price = product.price ?? 0
  if (customerType === 'partner' && discount > 0) {
    const clamped = Math.min(Math.max(discount, 0), 100)
    return price * (1 - clamped / 100)
  }
  return price
}

export function formatPrice(
  price: number,
  locale = 'en-US',
  currency = 'USD',
): string {
  // For IR project this could be 'fa-IR' / 'IRR' but default stays USD for test stability
  // Callers can pass 'fa-IR' explicitly when rendering.
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(price)
}

/** Convenience: format as plain number with locale separator */
export function formatPriceNumber(price: number, locale = 'en-US'): string {
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(price)
}
