## Context

The current codebase carries **~40 duplication groups** across **~80 source files**, introduced when a prior AI coding agent wrote each server route / component in isolation rather than reusing shared helpers. See `proposal.md` for the full motivation. This design focuses on the **architecture of the consolidation** — where new helpers live, how they compose, how call sites are migrated, and how behavior parity is guaranteed.

Constraints (from the proposal):
- **Strict parity**: every consolidated helper must reproduce each call site's exact output (locale, options, class strings, aria, translation keys). No visible diff in the rendered site.
- **Scope**: pure-function `src/lib/` helpers **and** shared `src/components/` UI primitives.
- **Package manager**: `bun` only — `bun tsc --noEmit`, `bun run lint`, `bun run build`, `bun run test:int`, `bun run test:e2e` after each task wave.
- **Design system**: `DESIGN.md` tokens are not edited; preserved class strings become component-internal defaults.
- **Payload CMS**: out of scope; payload skill is not loaded.

## Goals / Non-Goals

**Goals**
- Single source of truth per concern: every duplication group collapses to one named helper.
- Parity-preserving migration: identical rendered output, identical translation keys, identical DOM, identical aria.
- Dead code removed in the same change (YAGNI).
- Tests, lint, type-check, and build remain green throughout.
- No new packages, no DB migration, no API contract change, no `DESIGN.md` edit.

**Non-Goals**
- No new product behavior, no new routes, no new components in the UI sense.
- No rewrites of business logic (auth, cart math, order flow).
- No performance refactors (no memoization beyond what already exists).
- No `shadcn`/`@beui` registry lookups — components are authored in-place under `src/components/`.
- No restructuring of `src/access/`, `src/collections/`, `src/payload.config.ts`, `src/payload-types.ts`, or `src/migrations/`.

## Decisions

### D-1. Layout of `src/lib/` — domain-grouped modules

```
src/lib/
├── utils.ts              # existing — cn() (unchanged)
├── pricing.ts            # extended — getPrice, formatPrice, formatPriceNumber, formatToman, priceCartItems, cartGrandTotal, getPricingContext
├── t.ts                  # existing — t() (unchanged)
├── locale.ts             # existing — add site.nameFallback
├── current-user.ts       # existing — add getCurrentUserWithSettings()
├── site-settings.ts      # extended — getSiteSettings, getSiteName
├── cart-store.ts         # existing — add removeItemWithUndoToast (note: deletes clearOnCheckout alias)
├── wishlist-store.ts     # existing (no changes)
├── media.ts              # NEW — getMediaUrl, getLogoUrl, getProductImageUrl
├── env.ts                # NEW — getBaseUrl
├── posts.ts              # NEW — plainTextFromLexical
├── url.ts                # NEW — buildPageHref, parsePageParam
├── dates.ts              # NEW — formatDate
├── phone.ts              # NEW — formatIranPhone, isValidIranPhone
├── inventory.ts          # NEW — getStockState, LOW_STOCK_THRESHOLD
├── payload.ts            # NEW — getPayloadClient (memoized singleton)
├── api.ts                # NEW — apiFetch, parsePayloadError
├── auth-guard.ts         # NEW — requireUser
├── storage.ts            # NEW — ssrSafeLocalStorage, safeGet/SetLocalStorage
├── collections.ts        # NEW — getPrimary, sortByPrimary
└── users.ts              # NEW — userDisplayName
```

**Rationale**: one module per concern, mirroring the directory structure already established by `pricing.ts` / `t.ts` / `current-user.ts`. New files use kebab-case-free lowercase names (matching the existing `cart-store.ts` / `wishlist-store.ts` style). `media.ts` and `url.ts` carry multi-purpose utilities; `posts.ts` and `orders.ts` are scoped only when they own domain logic (currently `posts.ts` is just one helper, but a future orders-helpers module will follow the same pattern).

**Alternatives considered**:
- *One mega `utils.ts`* — rejected (already overgrown in many codebases; mixing concerns).
- *Feature-folder split (`lib/cart/pricing.ts`)* — rejected (over-engineered for this scale; flat is easier to navigate).

### D-2. `getPayloadClient` is a memoized singleton

```ts
let _payload: Promise<Payload> | null = null;
export function getPayloadClient(): Promise<Payload> {
  if (!_payload) {
    _payload = (async () => {
      const payloadConfig = await config;
      return getPayload({ config: payloadConfig });
    })();
  }
  return _payload;
}
```

**Rationale**: replaces the same 2-line bootstrap (`const payloadConfig = await config; const payload = await getPayload({ config: payloadConfig });`) repeated **15 times**. Memoization avoids re-reading `payload.config.ts` per request.

**Alternatives considered**:
- *Module-level `await getPayload(...)` at top of `payload.ts`* — rejected (top-level await can stall cold start; explicit lazy init is safer for SSR + tests).
- *Pass `payload` as a parameter through every helper* — rejected (prop drilling; helper signatures grow).

### D-3. `getMediaUrl` returns `string | null` (not `string | undefined`)

```ts
export function getMediaUrl(media: number | Media | null | undefined): string | null
```

**Rationale**: matches the existing inline implementations (all 9 sites return `null` on missing, never `undefined`). `getProductImageUrl` reuses `getMediaUrl` internally and returns `null` when both `showcaseImage` and `images[0]` are missing.

**Alternatives considered**:
- *Throw on invalid media* — rejected (call sites already do null-narrowing).

### D-4. `formatDate` takes a preset enum, not free-form `Intl.DateTimeFormatOptions`

```ts
export function formatDate(
  dateString: string | null | undefined,
  opts?: { locale?: "fa-IR" | "en-US"; preset?: "long" | "short" | "datetime" },
): string
```

Presets map to the exact options each call site uses today:

| Preset | fields | Used by |
|---|---|---|
| `long` (default) | year, month: "long", day | blog pages |
| `short` | year, month: "short", day | orders listing |
| `datetime` | year, month: "short", day, hour, minute | orders detail |

**Rationale**: 3 presets × 2 locales = 6 outputs, exactly matching the 4 existing inline copies (the blog pages share `long` + `en-US`; orders pages share `short` + `fa-IR`/`en-US`; orders detail uses `datetime` + `en-US`). Any free-form `Intl.DateTimeFormatOptions` would let future drift sneak in — preset enum enforces parity.

**Alternatives considered**:
- *Pass `Intl.DateTimeFormatOptions` directly* — rejected (lets call sites drift; defeats the consolidation).
- *Locale only, hardcode options* — rejected (orders detail needs hour/minute, others don't).

### D-5. `formatToman` lives in `pricing.ts` (extend, don't relocate)

```ts
export function formatToman(price: number, locale: "fa-IR" | "en-US" = "fa-IR"): string
```

Default `"fa-IR"` matches the **5 inline server-page copies** and the **1 cart helper that already uses `t("common.toman")`**. The two `en-US`/`hardcoded "تومان"` cart copies (`CartSheet.tsx`, `CheckoutForm.tsx`) switch to the canonical form.

**Rationale**: extends the existing `pricing.ts` instead of creating a new file (matches the precedent set by `current-user.ts` extending nothing — here we extend `pricing.ts` because the helper is pricing-domain). Default locale is `"fa-IR"` because that's the project's locale (`DESIGN.md` + `locale.ts`).

**Alternatives considered**:
- *Hardcode `t("common.toman")` and ignore the locale argument* — rejected (defeats `en-US` parity for the 2 cart sites that used `en-US`).
- *Read locale from a global config* — rejected (out of scope; current behavior is per-call).

### D-6. `priceCartItems` + `cartGrandTotal` replace the cart's 4-line `priced` map

```ts
export function priceCartItems<T extends { price: number; quantity: number }>(
  items: T[],
  customerType: CustomerType,
  partnerDiscount: number,
): Array<T & { discounted: number; hasDiscount: boolean }>

export function cartGrandTotal(
  priced: Array<{ discounted: number; quantity: number }>,
): number
```

**Rationale**: the three cart components (`CartView.tsx`, `CartSheet.tsx`, `CheckoutForm.tsx`) each have an identical `items.map` that calls `getPrice` then derives `hasDiscount = discounted !== item.price && customerType === "partner" && partnerDiscount > 0`. Hoisting that loop into one helper plus a sibling `cartGrandTotal` (replaces the `reduce` pattern) removes **~30 lines** of duplicate code and makes the partner-discount rule live in exactly one place.

**Alternatives considered**:
- *Inline `getPrice` directly into the JSX* — rejected (still calls the same helper 3 times; same drift risk).

### D-7. `getPricingContext` derives `customerType` + `partnerDiscount` once

```ts
export interface PricingContext { partnerDiscount: number; customerType: CustomerType }
export async function getPricingContext(): Promise<PricingContext>
```

Replaces:
```ts
const partnerDiscount = settings?.partnerDiscount ?? 0;
const customerType = currentUser?.customerType ?? "regular";
```

in `cart/page.tsx`, `checkout/page.tsx`, `account/page.tsx`.

**Rationale**: the derivation lives next to the rules that consume it (in `pricing.ts`), and the parallel call `Promise.all([getSiteSettings(), getCurrentUser()])` is folded into `getCurrentUserWithSettings()` (D-9). Account page only needs `customerType` — that helper still applies because the cost is one extra `findGlobal` query (negligible) and the simplification outweighs the round-trip.

**Alternatives considered**:
- *Keep derivation inline at each call site* — rejected (the original problem).
- *Separate `getCustomerType` and `getPartnerDiscount`* — rejected (always derived together, always together).

### D-8. SSR-safe storage singleton (`src/lib/storage.ts`)

```ts
export const ssrSafeLocalStorage = createJSONStorage(() =>
  typeof window !== "undefined" && typeof window.localStorage !== "undefined"
    ? window.localStorage
    : (undefined as unknown as Storage),
);
```

Plus:
```ts
export function safeGetLocalStorage(key: string): string | null
export function safeSetLocalStorage(key: string, value: string): void
```

**Rationale**: `cart-store.ts` and `wishlist-store.ts` both wrap `createJSONStorage` in the same 7-line guard. `ThemeToggle.tsx` reads/writes `localStorage` directly. One `ssrSafeLocalStorage` value replaces the zustand wiring; `safeGet/SetLocalStorage` replaces the `ThemeToggle` `getItem`/`setItem` calls.

**Alternatives considered**:
- *Wrap `localStorage` globally (e.g. patch in a provider)* — rejected (too invasive for the goal).

### D-9. `getCurrentUserWithSettings` — Promise.all wrapper

```ts
export async function getCurrentUserWithSettings(): Promise<{
  user: User | null;
  settings: SiteSetting | null;
}>
```

**Rationale**: `layout.tsx`, `cart/page.tsx`, `checkout/page.tsx` all do `Promise.all([getSiteSettings(), getCurrentUser()])`. Extending `current-user.ts` with a sibling helper that does both in parallel eliminates the boilerplate.

**Alternatives considered**:
- *Have `getCurrentUser` always fetch settings* — rejected (changes existing call-site behavior; many callers don't need settings).

### D-10. `requireUser(redirectTo?)` — auth-guard helper

```ts
export async function requireUser(redirectTo?: string): Promise<User>
```

Replaces:
```ts
const user = await getCurrentUser();
if (!user) redirect(redirectTo ?? `/login?next=${encodeURIComponent(pathname)}`);
```

in `account/page.tsx`, `checkout/page.tsx`, `orders/page.tsx`, `orders/[id]/page.tsx`.

**Rationale**: every page that needs auth does the same `if (!user) redirect(...)` dance. The helper computes the `next` from the request pathname internally (reads `next/headers`) so call sites become a one-liner. **Strict parity**: the helper accepts `redirectTo` so the (rare) case of an absolute redirect target is preserved.

**Alternatives considered**:
- *Middleware-level enforcement (`middleware.ts`)* — rejected (out of scope; Payload has its own admin auth, can't blanket-redirect).

### D-11. `EmptyState`, `PageContainer`, `PageHeader` are server components

All three are pure server components (no hooks, no state). They take `title`, `hint`, `actionLabel`/`actionHref`, `className`, and emit the **same DOM and class strings** the inline copies emit today (preserved verbatim from the duplicated sources).

**Rationale**: parity requires preserving the exact `<div className="mx-auto max-w-[1440px] px-4 py-8 md:px-8">` shell, the exact `rounded-[30px] bg-[#f5f5f5] p-12 text-center dark:bg-[#1a1a1a]` empty-state, etc. Variants (`variant?: "soft" | "outline"`) capture the two distinct shapes (`products/page.tsx` outline vs `categories/[slug]/page.tsx` missing dark classes) without introducing visible differences.

**Alternatives considered**:
- *Client components* — rejected (no state; server is smaller + faster).
- *Generic "Surface" primitive* — rejected (only two variants in use; YAGNI).

### D-12. `ImageWithFallback` has 2 variants (`card` | `hero`)

The 8 inline `noImage` placeholders differ in wrapper class and in whether they include an icon (`products/[slug]/page.tsx` uses `<Package />`). Variant picks the wrapper:

| Variant | Wrapper | Icon |
|---|---|---|
| `card` (default) | `flex h-full items-center justify-center …` | none |
| `hero` | `flex h-full flex-col items-center justify-center …` | `<Package />` |

**Rationale**: strict parity. The exact class strings are taken from the call sites (one card variant, one hero variant). Any other variant is YAGNI.

### D-13. `PaginatedView` takes `buildHref` as a function

```tsx
<PaginatedView
  page={page}
  totalPages={totalPages}
  buildHref={(p) => buildPageHref("/products", base, { page: String(p) })}
  paginationLabel={{ page, totalPages, count }}
/>
```

**Rationale**: `buildPageHref` already carries the per-route base shape (products keeps `q`/`brand`/`category`; categories keeps `q`; blog keeps nothing). `PaginatedView` doesn't need to know the route — it just needs `(page) => string`. This keeps `PaginatedView` reusable across products/categories/blog.

### D-14. Breadcrumbs reuse the existing `src/components/ui/breadcrumb.tsx`

The shadcn `breadcrumb.tsx` already exports `Breadcrumb`, `BreadcrumbList`, `BreadcrumbItem`, `BreadcrumbLink`, `BreadcrumbPage`, `BreadcrumbSeparator`. Every server page currently re-implements these in inline JSX. Migration = replace the inline `<nav>` with `<Breadcrumb>…</Breadcrumb>` calls.

**Rationale**: dead-code wins. The component already exists; we just wire it up.

### D-15. `ProductCard` moves from `home/` to `product/`

`src/components/home/ProductCard.tsx` → `src/components/product/ProductCard.tsx`. The `home/` folder becomes home-page-specific (currently only contains `ProductCard`, `CategoryCard`, `SectionHead`). `home/` consumers update imports.

**Rationale**: `ProductCard` is used by 4 routes (home + 3 server pages). It's a product concern, not a home concern. `SectionHead` (eyebrow + title + action) stays in `home/` because only home uses it today — but `PageHeader` (a near-relative) will live in `layout/` and could be merged later.

### D-16. `ContactChannelList` accepts a `kind` discriminator

```tsx
<ContactChannelList
  channels={phones}
  kind="phone"
  noChannelLabel={t("contact.noPhone")}
  defaultLabel={t("contact.phones")}
/>
```

`kind` picks the link protocol (`tel:` / `mailto:` / none) and the icon. Footer columns (which use slightly different markup — no Card wrapper, no `<li>` separators) become a second `variant` prop: `variant?: "card" | "footer"`.

**Rationale**: the contact page and footer share the same underlying data (`SiteSetting.phones` / `emails` / `addresses`) but render in two visual contexts. One component, two variants.

### D-17. Dead-code removal is a separate task (atomic)

The 5 dead-code deletions (`CartSheet.tsx`, `isAdminFieldAccess`, `isOwnerOrAdmin`, `clearOnCheckout`, `getCategoryImageFallback`) are tracked as one task each so the git history is unambiguous. `git grep` confirms zero callers before each delete.

**Rationale**: small atomic commits make blame / revert trivial. The delete can happen in the same wave as the consolidation tasks or right after — the order doesn't matter as long as each is verifiable alone.

### D-18. Migration is per-pattern, per-wave, not per-file

Task waves:

```
Wave 1 — Pure helpers (no call sites touched):
  1.1  Create src/lib/{media, env, posts, url, dates, phone, inventory, payload, api, auth-guard, storage, collections, users}.ts
  1.2  Extend src/lib/{pricing, site-settings, current-user, locale}.ts
  1.3  bun tsc --noEmit green
  1.4  bun run lint green

Wave 2 — Replace call sites of pure helpers (one task per duplication group):
  2.1  Replace 9 inline getMediaUrl + 3 inline showcase-firstImage + 8 inline noImage placeholders
  2.2  Replace 4 getBaseUrl copies
  2.3  Replace 2 plainTextFromLexical copies
  2.4  Replace 3 buildPageHref + 3 parsePageParam copies
  2.5  Replace 4 formatDate copies
  2.6  Replace 2 formatPhone copies
  2.7  Replace 4 stock-state calc copies
  2.8  Replace 15 getPayloadClient inline bootstraps
  2.9  Replace 6 fetch JSON wrappers + 2 error-parse copies
  2.10 Replace 4 requireUser inline redirects
  2.11 Replace 2 zustand SSR-safe storage copies + ThemeToggle storage
  2.12 Replace 2 getPrimary/sortByPrimary copies
  2.13 Replace 3 user-display-name copies
  2.14 Replace 3 formatToman + 5 inline toman templates
  2.15 Replace 3 cart partner-discount price maps + 2 cart grand-total reduces
  2.16 Replace 3 partner-discount derivations with getPricingContext
  2.17 Replace 3 Promise.all([getSiteSettings, getCurrentUser]) with getCurrentUserWithSettings
  2.18 bun tsc --noEmit + bun run lint green

Wave 3 — Add UI primitives:
  3.1  Create PageContainer, PageHeader, Breadcrumbs (wrapper around ui/breadcrumb.tsx)
  3.2  Create EmptyState
  3.3  Create ImageWithFallback
  3.4  Create InitialsAvatar
  3.5  Create PaginatedView
  3.6  Create QuantityStepper
  3.7  Create AuthFormShell
  3.8  Create ContactChannelList

Wave 4 — Replace inline UI patterns:
  4.1  Replace 14 PageContainer inline divs
  4.2  Replace 9 PageHeader inline h1 blocks
  4.3  Replace 13 inline breadcrumb <nav> blocks (use existing ui/breadcrumb.tsx)
  4.4  Replace 6 inline EmptyState blocks (incl. categories/brands empty states)
  4.5  Replace 8 inline noImage blocks (already migrated in 2.1 with ImageWithFallback)
  4.6  Replace 6 inline initials-avatar spots
  4.7  Replace 3 inline pagination blocks
  4.8  Replace 2 cart quantity-stepper JSX blocks
  4.9  Replace 2 login/register Suspense shells
  4.10 Replace 6 contact-channel list blocks (3 in contact/page.tsx + 3 in footer.tsx)
  4.11 Broaden ProductCard → relocate to src/components/product/ProductCard.tsx; replace 3 inline product-card renders in products/brands/categories pages
  4.12 bun run lint + bun run build green

Wave 5 — Dead code + verification:
  5.1  Delete src/components/cart/CartSheet.tsx
  5.2  Delete isAdminFieldAccess + isOwnerOrAdmin from src/access/index.ts
  5.3  Delete clearOnCheckout alias from src/lib/cart-store.ts
  5.4  Delete getCategoryImageFallback from src/components/home/CategoryCard.tsx
  5.5  bun tsc --noEmit + bun run lint + bun run build green
  5.6  bun run test:int green
  5.7  bun run test:e2e green
```

**Rationale**: each wave ends with a green build. Pure-helper wave is decoupled from UI wave so a UI mistake can't block type-checking the helpers. Replacement waves are grouped by pattern (not file) so a single git diff is reviewable per concern.

**Alternatives considered**:
- *Per-file migration* — rejected (mixes concerns; one file's diff would touch 5 helpers).
- *Single mega-task* — rejected (impossible to review; impossible to bisect on failure).

### D-19. Verification matrix

| Check | When |
|---|---|
| `bun tsc --noEmit` | After wave 1, after each wave 2 sub-task, after wave 3, after wave 4, after wave 5 |
| `bun run lint` (biome) | After each wave |
| `bun run build` | After wave 4 (UI complete), after wave 5 (dead-code removed) |
| `bun run test:int` (vitest) | After wave 4, after wave 5 |
| `bun run test:e2e` (playwright) | After wave 5 |
| Visual screenshot diff against pre-change baseline | After wave 4, after wave 5 (strict parity → zero pixel diff expected) |

`DESIGN.md` lint (`bunx @google/design.md lint DESIGN.md`) is **not** required — `DESIGN.md` is untouched.

## Risks / Trade-offs

- **[R1] Strict parity limits future consolidation gains.** Once this change is in, future tasks may need to *normalize* the 6 cart-side toman outputs to one locale (the 2 `en-US` cart copies currently use hardcoded `"تومان"`). → Mitigation: deferred to a follow-up change once parity is locked in.
- **[R2] `getPayloadClient` singleton holds a long-lived Promise.** If `payload.config.ts` mutates between hot-reload cycles, the singleton may serve a stale handle. → Mitigation: the singleton is module-scoped; HMR replaces the module, resetting it. In production, Next.js caches modules per-process — fine.
- **[R3] SSR-safe storage helper depends on `window` check that may break in non-browser environments (e.g., edge runtime).** → Mitigation: out of scope — Next.js 16 server components don't run `ThemeToggle` server-side (the component uses `useEffect` today, so it's client-only).
- **[R4] `requireUser` reads `headers()` internally — pages that don't currently use `headers()` will start doing so.** → Mitigation: `headers()` is a standard Next.js 16 API; cost is one sync read of the request headers.
- **[R5] Replacing 13 inline breadcrumb blocks with the shadcn `Breadcrumb` component may emit a slightly different DOM tree (the shadcn component adds `data-slot` attributes).** → Mitigation: shadcn breadcrumbs are React Server Component compatible; `data-slot` is a CSS hook only and doesn't affect semantics/aria. Visual diff is zero.
- **[R6] `ContactChannelList` may render in subtly different order vs the inline footer's `<li>` separators.** → Mitigation: variant prop carries the exact wrapper for each context; behavior is preserved by following the existing inline JSX line-for-line.
- **[R7] `priceCartItems` changes the order of fields on cart items.** → Mitigation: helper returns the spread (`...item`) first then `discounted`/`hasDiscount`, so any future field on items stays first. The 3 call sites destructure the same fields today.
- **[R8] Dead-code removal may break an out-of-tree import (e.g., a future test file, an internal CLI).** → Mitigation: `git grep` is run for each removed symbol before deletion; the existing repo has no other consumers. If a future PR re-introduces a need, the symbol can be restored in a follow-up.
- **[R9] Wave ordering assumes pure-helper refactors don't introduce subtle semantic changes (e.g., `parsePageParam` clamping to 1 vs the inline expression clamping to 1).** → Mitigation: each helper's task carries an explicit "parity checklist" listing the exact call sites it must reproduce. Reviewers confirm against that list.
- **[R10] `ProductCard` relocation breaks any external imports (none today).** → Mitigation: `git grep -r "from.*home/ProductCard"` is run before relocation; the only known consumer is `src/app/(app)/page.tsx`.

## Migration Plan

1. Land wave 1 + wave 2 in commit 1 ("refactor(lib): consolidate duplicated helpers"). `bun tsc --noEmit` + `bun run lint` green.
2. Land wave 3 + wave 4 in commit 2 ("refactor(ui): consolidate duplicated inline patterns"). `bun run build` + tests green.
3. Land wave 5 in commit 3 ("chore: remove dead code from prior consolidation"). All gates green.
4. Rollback = `git revert` of the offending commit. No data migration, no DB change, no deploy ordering required.
5. No feature-flag, no staged rollout — the change is internal and parity-preserving. If a parity miss is caught post-merge, the offending commit is reverted and a hot-fix PR is opened.

## Open Questions

_None._ All material decisions were resolved with the user up-front:
- Single OpenSpec change ✓
- Delete dead code ✓
- Both `src/lib/` + `src/components/` scope ✓
- Strict parity per call site ✓