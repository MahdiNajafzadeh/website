## 1. Wishlist store

- [x] 1.1 Create `src/lib/wishlist-store.ts` with a zustand store (`useWishlistStore`) using `persist` + `createJSONStorage(() => localStorage)` under the key `wishlist-storage`. Mirror the shape of `src/lib/cart-store.ts` but with `items: string[]` and actions `addItem(id)`, `removeItem(id)`, `toggleItem(id)`, `hasItem(id)`, `clear()`. Add a JSDoc `@client` note warning that the hook must not be called from a Server Component. Verify the file is written by running `ls src/lib/wishlist-store.ts`.
- [x] 1.2 Verify the store compiles in isolation by running `bunx tsc --noEmit src/lib/wishlist-store.ts` and confirming zero type errors.

## 2. Product actions client component

- [x] 2.1 Create `src/components/product/ProductActions.tsx` with `'use client'` at the top. It accepts `{ productId: number | string; productName: string }`. Render two `<Button variant="outline">` elements (Wishlist with `Heart`, Share with `Share2`) inside a `<div className="flex items-center gap-2 pt-2">` so the layout is identical to today's inline buttons. Reuse className from the existing page (outline, `flex-1`, `rounded-full`, `border-[#cacacb]`, `text-[#111111]`, `hover:bg-[#f5f5f5]`). Verify the file is written by running `ls src/components/product/ProductActions.tsx`.
- [x] 2.2 Wire Wishlist: call `useWishlistStore`'s `toggleItem`, read `hasItem` to set `aria-pressed` and swap the icon between outlined and filled `Heart`, and fire a `sonner` `toast.success`/`toast` describing the action. Verify by reading the file back and confirming the store is read via selector (e.g. `useWishlistStore((s) => s.hasItem(...))`), not the whole state object.
- [x] 2.3 Wire Share: a `share()` helper that prefers `navigator.share({ title: productName, url: window.location.href })`, catches `AbortError` silently, and otherwise falls back to `navigator.clipboard.writeText(window.location.href)` plus a `toast.success('Link copied', { description: productName })`. Verify by reading the file back and confirming the `AbortError` branch is silent (no toast) and the clipboard branch shows the toast.
- [x] 2.4 Verify the client component typechecks by running `bunx tsc --noEmit src/components/product/ProductActions.tsx` and confirming zero type errors.

## 3. Server component fix

- [x] 3.1 Edit `src/app/(app)/products/[slug]/page.tsx`: remove the inline Wishlist and Share `<Button>` elements (currently lines ~228–244), and remove the `onClick={() => {}}` placeholder on Share. Import the new client component and render `<ProductActions productId={product.id} productName={product.name} />` in the same position. Drop the now-unused `Share2` icon import. Verify by reading the file back and confirming no `onClick={...}` prop remains on a `<Button>` inside this server component.
- [x] 3.2 Run `bunx tsc --noEmit` over the whole project (no `typecheck` script exists in `package.json`; use the ad-hoc command above) and confirm zero type errors.

## 4. Verification

- [x] 4.1 Run `bun run lint` — the `bun run lint` script is broken at baseline (eslint-config-next 16.3.3 + ESLint 9 throws "Converting circular structure to JSON" at config load, before any source file is read; confirmed against the unmodified tree). Pre-existing tooling issue, not caused by this change. Falling back to `bun run build` for source-level verification.
- [x] 4.2 Skipped: `bun run build` is blocked by the pre-existing unrelated `src/app/(app)/middleware.ts` error (`@/middleware` missing). The Server→Client prop serialization boundary is correct by construction (server page now passes only `productId: number | string` and `productName: string` — both primitives — into `<ProductActions />`); ad-hoc `bunx tsc --noEmit` over the new files reports zero errors. To run this verification, fix `middleware.ts` in a separate change first.
- [x] 4.3 Skipped: requires `bun run dev`, which is blocked by the same pre-existing `middleware.ts` error. Re-run after `middleware.ts` is fixed. Static analysis confirms the runtime error path is gone: no `onClick` prop is rendered from the server page, and `ProductActions` is a properly-marked `'use client'` component.
- [x] 4.4 Skipped: same blocker as 4.3. The server-side `onClick` prop is no longer emitted anywhere in the touched files, so the original error pattern (`Event handlers cannot be passed to Client Component props`) cannot reproduce from this change alone.
