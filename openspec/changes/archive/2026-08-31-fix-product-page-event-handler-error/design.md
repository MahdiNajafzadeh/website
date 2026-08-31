## Context

The product detail page at `src/app/(app)/products/[slug]/page.tsx` is an async React Server Component. It currently renders two interactive buttons (Wishlist, Share) using the shadcn `Button` primitive, and one of them — Share — passes an inline `onClick={() => {}}` to the client-side `Button`. Next.js 16 rejects this at runtime with "Event handlers cannot be passed to Client Component props", which surfaces in the browser console and breaks the page's interactive controls even though the HTTP response is 200. See `proposal.md` for motivation and `openspec/changes/fix-product-page-event-handler-error/specs/` for the behavioral contract.

The fix is to move the interactive buttons into a Client Component so event handlers live on the client, and to wire them to real behavior (a persisted wishlist store and the Web Share / Clipboard APIs). The page itself stays a Server Component so it can keep doing the Payload `find` directly without an extra fetch round-trip.

Constraints in force:

- Stack: Next.js 16 (App Router, Turbopack), Payload CMS 3.88, Tailwind v4, shadcn/ui + `@base-ui/react/button`, zustand for client state, `sonner` for toasts, `lucide-react` for icons, Vitest + Playwright for tests.
- Package manager is `bun` only; commands run as `bun run`, `bunx --bun ...`.
- Public front-end lives under `src/app/(app)`; `(payload)` is reserved.
- `DESIGN.md` (Google `design.md` format) governs colors, typography, spacing, radii, and components. Tokens are referenced by path (e.g. `{colors.ink}`, `{rounded.full}`, `{component.button-icon-circular}`).
- Skills consulted: `.agents/skills/payload/SKILL.md` (not in scope for this change — no Payload work), `.agents/skills/shadcn/SKILL.md`, `.agents/skills/beui/SKILL.md` (no motion needed here — no `@beui/*` add). UI work is below the threshold for new shadcn/beui adds; we reuse the existing `Button` from `src/components/ui/button.tsx`.

## Goals / Non-Goals

**Goals:**

- Eliminate the runtime error on `(app)/products/[slug]` so the page renders interactive controls cleanly.
- Provide a real Wishlist action backed by a persisted zustand store, accessible from the existing UI.
- Provide a real Share action that uses `navigator.share` when available and falls back to copying the URL to the clipboard.
- Preserve the current visual appearance of the Wishlist and Share buttons (outline pill, `{colors.ink}` border, `{rounded.full}`).
- Keep the product detail page a Server Component and avoid a hydration mismatch.

**Non-Goals:**

- A dedicated `/wishlist` page, account-level wishlist sync, or server-side wishlist persistence. The store is browser-only; no Payload collection is added.
- Redesigning the Wishlist/Share controls to use `{component.button-icon-circular}`. Visual parity only; the deviation is flagged in `Risks` for a follow-up.
- Adding tests in this change. Vitest/Playwright scaffolding exists; we leave a hook for a future change to add coverage.
- Changing the Add-to-Cart control, the gallery, or any other surface on the page.

## Decisions

### 1. Extract Wishlist and Share into a new Client Component (`ProductActions`)

The buttons must accept `onClick`, `disabled`, and read store state — all client-only concerns. The page is an RSC that does a Payload `find`; pulling the whole page into a Client Component would force an extra fetch (or a server action). The standard App Router pattern is: keep the page an RSC, render a Client Component child for the interactive island.

- **File:** `src/components/product/ProductActions.tsx` (new).
- **Directive:** `'use client'` at the top.
- **Props:** `{ productId: number | string; productName: string }` — only what the client needs (id for store key + share payload; name for the toast and share title).
- **Composition:** renders two `Button`s with `variant="outline"`, identical className to the current inline buttons, wrapped in a `<div className="flex items-center gap-2 pt-2">` matching the existing container.
- **Alternative considered:** convert the whole page to `'use client'`. Rejected — loses the direct Payload `find` from the server, increases client JS, and contradicts the existing pattern (`AddToCartButton.tsx` is also an isolated `'use client'` island while the page itself is an RSC).
- **Alternative considered:** use a Next.js Server Action invoked from a `<form>`. Rejected — the buttons are not pure form submissions (no field to submit) and the UX wants an immediate, optimistic toggle, not a round-trip.

### 2. New client-only wishlist store (`useWishlistStore`)

Mirrors the patterns already established in `src/lib/cart-store.ts`:

- **File:** `src/lib/wishlist-store.ts` (new).
- **Library:** `zustand` + `zustand/middleware`'s `persist` + `createJSONStorage(() => localStorage)`. Same as `cart-store.ts`; no new dependency.
- **State shape:** `items: string[]` (product ids as strings, since `cart-store.ts` already canonicalizes ids to strings).
- **Actions:** `addItem(id)`, `removeItem(id)`, `toggleItem(id)`, `hasItem(id)`, `clear()`.
- **Persisted key:** `wishlist-storage` (matches the cart's `cart-storage` naming).
- **SSR safety:** because `persist` rehydrates on mount, importing the module from a Server Component is fine — the module is just a `create` call. But calling `useWishlistStore` from a Server Component would throw because zustand hooks need React context. Document this with a JSDoc note on the store; the only consumer in this change is the Client Component, so the rule is naturally enforced.
- **Alternative considered:** store full product objects (id, name, price, image). Rejected for v1 — wishlist UI today only needs the id for membership checks. We can promote to objects later without breaking the API (the `hasItem(id)` signature stays the same). A future `/wishlist` page change can extend the store.

### 3. Share action: Web Share API with clipboard fallback

```ts
async function share(productName: string, url: string) {
  if (typeof navigator !== 'undefined' && 'share' in navigator) {
    try {
      await navigator.share({ title: productName, url })
      return
    } catch {
      // user cancellation or unsupported payload — fall through
    }
  }
  await navigator.clipboard.writeText(url)
  toast.success('Link copied', { description: productName })
}
```

- URL is computed client-side from `window.location.href` (the only canonical URL the client knows). Server-side URL construction would need request headers and adds risk; the page is rendered behind middleware anyway and the share URL is what the user actually sees in the address bar, which is what they expect to send.
- If `navigator.share` throws (user cancellation, or `AbortError`), we silently fall back to the clipboard rather than showing an error — matching standard Web Share UX.
- Toast always fires on the clipboard fallback so the user gets feedback.
- **Alternative considered:** a Next.js Server Action that uses `req.headers` to construct an absolute URL. Rejected — heavier, requires a round-trip, and adds nothing the client can't already derive.

### 4. Wishlist action: optimistic toggle, persisted

The button calls `toggleItem(productId)`, immediately reflects the new state from the store (zustand re-renders subscribers on set), and fires a `sonner` toast. No server round-trip.

- **Accessibility:** `aria-pressed` is set to `hasItem(productId)` so screen readers announce the toggle state; the accessible name flips between "Add to wishlist" and "Remove from wishlist" accordingly.
- **Icon feedback:** swap `Heart` between outlined and filled variants based on `hasItem`. Use `lucide-react`'s `Heart` (currently used) and add a filled `Heart` variant via class — no new icon package.

### 5. Visual parity, not redesign

Both buttons keep the exact className the page uses today: `variant="outline"`, `flex-1`, `rounded-full`, `border-[#cacacb]`, `text-[#111111]`, `hover:bg-[#f5f5f5]`. This change is a bug fix, not a visual refresh.

- `DESIGN.md` defines `{component.button-icon-circular}` for wishlist/share hearts in chrome controls (line 422–423). The current implementation uses full-width pills that don't exactly match that spec (they're somewhere between `{component.filter-chip}` and a custom treatment). **We deliberately preserve that mismatch in this change** to keep the diff small; flag in `Risks` for a follow-up design pass.

### 6. Server → Client boundary contract

The Server Component `ProductDetailPage` passes only serializable props to `ProductActions`:

```tsx
<ProductActions productId={product.id} productName={product.name} />
```

No functions, no `Date`, no class instances, no Media objects. This is the rule that fixes the runtime error.

## Risks / Trade-offs

- **[Wishlist state diverges across devices]** → out of scope for this fix. The store is `localStorage`-only. A future "sync wishlist to user account" change can layer on top without breaking this API.
- **[Visual mismatch with `DESIGN.md`'s `{component.button-icon-circular}`]** → keep the current outline-pill treatment in this fix; open a follow-up issue to migrate to the circular icon control if the design owner agrees.
- **[Server-side use of the wishlist store]** → cannot happen because the only consumer is `'use client'`. Mitigated by adding a JSDoc warning on the store module.
- **[Web Share API not available on older browsers]** → clipboard fallback is unconditional and tested by `typeof navigator !== 'undefined' && 'share' in navigator`.
- **`[navigator.share` `AbortError` on user cancel]** → silently swallow and fall back to clipboard; if the user already cancelled, copying to the clipboard would be surprising, so we only fall back when `share` is unavailable or `share()` actually threw for a non-cancel reason. Refined rule: only `catch` when `err.name !== 'AbortError'`; on `AbortError` do nothing.
- **[Hydration mismatch from `hasItem` reading `localStorage`]** → zustand `persist` hydrates on the client after mount, so the first paint uses the SSR default (not-in-wishlist). This is a known and accepted pattern (the cart store uses it too); the button text doesn't visibly flash because the SSR default matches the "not in wishlist" state for a fresh session, and re-hydration only changes state for returning users.
- **[No automated tests added]** → flagging for a follow-up. The repo has Vitest + Playwright; we could add a Vitest unit test for `useWishlistStore` (idempotent add, toggle, clear) and a Playwright test for the page rendering without console errors. Scope kept tight in this change.

## Migration Plan

No data migration, no schema migration. Deployment is a normal Next.js build:

1. Land `src/lib/wishlist-store.ts` and `src/components/product/ProductActions.tsx`.
2. Update `src/app/(app)/products/[slug]/page.tsx` to drop the inline `onClick` and render `<ProductActions />`.
3. `bun run lint` (or `bunx biome check`, whatever the repo uses — confirm in `package.json`).
4. `bun run typecheck` (`tsc --noEmit`) to verify the boundary contract holds.
5. `bun run dev`, navigate to `/products/<any-slug>`, confirm:
   - No "Event handlers cannot be passed" error in browser console or server logs.
   - Click Wishlist → heart fills, toast appears, reload preserves state.
   - Click Share → native share sheet (Chrome/Edge/Safari) or "Link copied" toast (Firefox/desktop).
6. Rollback: revert the single page change; the new files are unreferenced and harmless.

## Open Questions

None. The wishlist-store type (string ids only) is intentionally minimal; a future `/wishlist` page change can extend it without touching this spec.
