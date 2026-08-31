## Why

The product detail page at `src/app/(app)/products/[slug]/page.tsx` is an async React Server Component, but it passes an `onClick` event handler to the `<Button>` Share button on line 240. Next.js 16 (App Router) rejects this at runtime because functions cannot be serialized across the server→client boundary, throwing:

> Event handlers cannot be passed to Client Component props.

The page (`/products/<slug>`, e.g. `/products/pipeline`) returns a 200 only because the error is swallowed in a streaming shell, but the interactive content crashes and the browser logs an uncaught error. This blocks any product detail from rendering interactive controls (wishlist, share) without further runtime errors. We need to remove the invalid server-side event handler and move interactive product actions into a proper Client Component so future functionality (wishlist store, navigator.share) can be wired in safely.

## What Changes

- Remove the empty `onClick={() => {}}` placeholder from the Share button in the product detail server component.
- Extract the Wishlist and Share buttons into a new Client Component (`src/components/product/ProductActions.tsx`, marked `'use client'`).
- Render `<ProductActions productId={product.id} productName={product.name} />` from the server component in place of the inline buttons.
- Keep Wishlist and Share as visually identical outline pill buttons using the existing `DESIGN.md` tokens (`{colors.ink}` border `#cacacb`, `{rounded.full}`) — no visual change.
- Wire Wishlist and Share to actual behavior in the new client component:
  - **Wishlist**: add the product to a new `useWishlistStore` (zustand + persist), toggle on re-click, show a `sonner` toast.
  - **Share**: prefer `navigator.share({ title, url })` when available, fall back to copying the current URL to the clipboard with a `sonner` toast.
- Add `src/lib/wishlist-store.ts` modeled on `src/lib/cart-store.ts` (zustand + `persist` + `createJSONStorage`), with type-safe actions (`addItem`, `removeItem`, `toggleItem`, `hasItem`, `clear`).
- No new dependencies; reuses `zustand`, `sonner`, `lucide-react`, and the existing shadcn `Button`.

## Capabilities

### New Capabilities

- `product-actions`: Client-side Wishlist and Share actions on the product detail page, backed by a persisted wishlist store and the Web Share / Clipboard APIs.
- `wishlist-store`: Persisted client-side wishlist store (zustand) used by product actions and any future wishlist UI.

### Modified Capabilities

- `collection-product`: No requirement changes — the Payload collection schema is unaffected. This change touches the storefront rendering of a product, not the data model.

## Impact

- `src/app/(app)/products/[slug]/page.tsx` — remove inline buttons + `onClick`, render `<ProductActions />`.
- `src/components/product/AddToCartButton.tsx` — unchanged reference; remains the model for the new client component.
- `src/components/product/ProductActions.tsx` — **new** Client Component.
- `src/lib/wishlist-store.ts` — **new** zustand store, mirrors `src/lib/cart-store.ts`.
- No Payload collections, globals, or migrations are touched.
- No new npm dependencies.
- No design-system token changes; buttons continue to use `{colors.ink}`-on-white outline + `{rounded.full}` per `DESIGN.md`.
- Front-end stays under `src/app/(app)`; new client component lives under `src/components/product/` consistent with `AddToCartButton.tsx`.
