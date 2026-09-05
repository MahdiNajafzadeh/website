## Why

A previous AI coding agent that built this codebase did not enforce YAGNI / DRY, leaving **~40 distinct duplication groups across ~80 source files**. The same helpers (`getMediaUrl`, `formatToman`, `parsePageParam`, partner-discount maps, payload bootstrap, page containers, breadcrumb nav, product cards, empty states, etc.) are reimplemented inline at every call site. Consequences today:

- **~15 payload client boilerplate sites** — each server route repeats `const payload = await getPayload({ config })` and the same `Promise.all([getSiteSettings(), getCurrentUser()])` patterns.
- **14 inline page-container `<div>`s** with identical `mx-auto max-w-[1440px] px-4 py-8 md:px-8` class strings; **9 inline `<h1>` + count headers**; **13 inline breadcrumb `<nav>` blocks** while a shadcn `breadcrumb.tsx` already exists and is unused.
- **9 inline `getMediaUrl` copies** + **3 inline `showcaseImage ?? images[0]` blocks** + **8 inline `noImage` placeholders** — every product/card render reimplements the same Media narrowing and fallback.
- **3 cart components** each reimplement the partner-discount price-map (`items.map(getPrice + hasDiscount)`) and the cart-quantity toolbar.
- **5 dead-code items** (entire unused `CartSheet.tsx`, `isOwnerOrAdmin`, `isAdminFieldAccess`, `clearOnCheckout` alias, `getCategoryImageFallback`) that nobody imports — YAGNI in spirit.

Consolidating eliminates the duplication, restores a single source of truth per concern (so future edits touch one file), and deletes code nobody reads. **Behavior is preserved bit-for-bit at every call site** (strict parity mode chosen by the user): same locale, same digit grouping, same aria, same DOM, same translation strings — only the location of the code changes.

## What Changes

- Add 13 new pure-function helpers under `src/lib/` and extend 2 existing ones (`pricing.ts`, `site-settings.ts`) so all 40 duplication groups collapse to one canonical home. New lib files: `media.ts`, `env.ts`, `posts.ts`, `url.ts`, `dates.ts`, `phone.ts`, `inventory.ts`, `payload.ts`, `api.ts`, `auth-guard.ts`, `storage.ts`, `collections.ts`, `users.ts`.
- Add 10 new components under `src/components/` that replace inline JSX patterns: `ui/EmptyState.tsx`, `ui/ImageWithFallback.tsx`, `ui/PaginatedView.tsx`, `ui/InitialsAvatar.tsx`, `layout/PageContainer.tsx`, `layout/PageHeader.tsx`, `product/ProductCard.tsx`, `cart/QuantityStepper.tsx`, `auth/AuthFormShell.tsx`, `contact/ContactChannelList.tsx`.
- Broaden the existing `src/components/home/ProductCard.tsx` semantics (or relocate to `src/components/product/ProductCard.tsx`) so it accepts the same fields the inline server-page product cards render, then replace those 3 inline copies.
- Replace every duplicated call site under `src/app/(app)/` and `src/components/` with an import from the new home. All replacements preserve exact behavior per call site (locale, options, class strings, aria attributes, translation keys).
- Wire the existing-but-unused `src/components/ui/breadcrumb.tsx` into the 13 page templates that currently inline their own breadcrumb markup.
- **Delete dead code** in the same change: `src/components/cart/CartSheet.tsx` (entire file — 222 lines, no callers), `src/access/index.ts` exports `isAdminFieldAccess` and `isOwnerOrAdmin` (no callers), `src/lib/cart-store.ts` deprecated alias `clearOnCheckout` (no callers), `src/components/home/CategoryCard.tsx` helper `getCategoryImageFallback` (returns `null`, no callers).
- Front-end changes target `src/app/(app)` only. No DB migration, no new package, no API contract change, no `DESIGN.md` token changes (visual output is identical), no Payload collection/global/field changes. UI components added are local files — no new `shadcn` or `@beui` registry lookup needed.

## Capabilities

### New Capabilities

_None_ — no new product behavior; this is a pure code-organization refactor with deleted dead code.

### Modified Capabilities

_None_ — rendered output, locale strings, placeholder interpolation, status colors, breadcrumb DOM, pagination DOM, and aria labels are preserved exactly. No `openspec/specs/` requirement text changes; `skip_specs: true` is set in `.openspec.yaml`.

## Impact

- **Code (new lib files)**: `src/lib/media.ts`, `src/lib/env.ts`, `src/lib/posts.ts`, `src/lib/url.ts`, `src/lib/dates.ts`, `src/lib/phone.ts`, `src/lib/inventory.ts`, `src/lib/payload.ts`, `src/lib/api.ts`, `src/lib/auth-guard.ts`, `src/lib/storage.ts`, `src/lib/collections.ts`, `src/lib/users.ts` — each module-level exports listed in `design.md` §"New lib exports".
- **Code (extended lib files)**:
  - `src/lib/pricing.ts` — add `formatToman`, `priceCartItems`, `cartGrandTotal`, `getPricingContext` (existing `getPrice` / `formatPrice` / `formatPriceNumber` retained).
  - `src/lib/site-settings.ts` — add `getSiteName` (existing `getSiteSettings` retained).
- **Code (new components)**: 10 files listed above under `src/components/`.
- **Code (broadened)**: `src/components/home/ProductCard.tsx` gains props for `showBrand`, `showLowStock`, image-source precedence (`showcaseImage ?? images[0]?.image`); or relocate entirely to `src/components/product/ProductCard.tsx` and leave `home/ProductCard.tsx` as a thin re-export.
- **Code (call-site rewrites)**: every file under `src/app/(app)/` that has any of the patterns above (`page.tsx`, `products/page.tsx`, `products/[slug]/page.tsx`, `categories/page.tsx`, `categories/[slug]/page.tsx`, `brands/page.tsx`, `brands/[slug]/page.tsx`, `blog/page.tsx`, `blog/[slug]/page.tsx`, `blog/rss.xml/route.ts`, `orders/page.tsx`, `orders/[id]/page.tsx`, `account/page.tsx`, `cart/page.tsx`, `checkout/page.tsx`, `contact/page.tsx`, `about/page.tsx`, `sitemap.ts`, `robots.ts`, `layout.tsx`), plus `src/components/{cart/*, account/*, home/*, layout/*, product/*, ui/breadcrumb.tsx}`.
- **Code (dead-code deletion)**: `src/components/cart/CartSheet.tsx`, `isAdminFieldAccess` + `isOwnerOrAdmin` from `src/access/index.ts`, `clearOnCheckout` from `src/lib/cart-store.ts`, `getCategoryImageFallback` from `src/components/home/CategoryCard.tsx`.
- **APIs / Dependencies**: None added. `bun` remains the sole runner (`bun tsc --noEmit`, `bun run lint`, `bun run build`, `bun run test:int`, `bun run test:e2e` after each wave). No new `bunx --bun shadcn@latest add` calls — components are authored in-place.
- **Tests / Tooling**: existing Vitest + Playwright suites must continue to pass without modification (asserted copy + DOM structure are preserved). Lint (`bun run lint`) must remain green. `bun tsc --noEmit` must remain green.
- **Design system**: No visual changes — `DESIGN.md` tokens are not touched; the few preserved class strings (`rounded-[30px] bg-[#f5f5f5] p-12 text-center`, `mx-auto max-w-[1440px] px-4 py-8 md:px-8`, etc.) become component-internal default props.
- **Payload CMS**: Out of scope — no collections, globals, hooks, access functions, or jobs change. Payload skill at `.agents/skills/payload/SKILL.md` does not need to be loaded for this change.