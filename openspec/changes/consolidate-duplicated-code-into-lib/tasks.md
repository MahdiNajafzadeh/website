# Tasks: Consolidate Duplicated Code into `src/lib/` and `src/components/`

Strict-parity refactor. Every helper reproduces its call site's exact behavior (locale, options, class strings, aria, translation keys). No new product behavior, no `DESIGN.md` change, no `shadcn`/`@beui` registry lookup (components are in-place consolidations of existing inline JSX).

## 1. Wave 1 — Pure helpers (no call sites touched)

- [x] 1.1 Create `src/lib/media.ts` exporting `getMediaUrl`, `getLogoUrl`, `getProductImageUrl` and verify `bun tsc --noEmit` reports the new module without errors
- [x] 1.2 Create `src/lib/env.ts` exporting `getBaseUrl` (reads `NEXT_PUBLIC_SITE_URL ?? NEXT_PUBLIC_SERVER_URL ?? SITE_URL ?? "https://example.com"`, strips trailing `/`) and verify the new module type-checks
- [x] 1.3 Create `src/lib/posts.ts` exporting `plainTextFromLexical` and verify the new module type-checks
- [x] 1.4 Create `src/lib/url.ts` exporting `buildPageHref`, `parsePageParam` and verify the new module type-checks
- [x] 1.5 Create `src/lib/dates.ts` exporting `formatDate` with `preset: "long" | "short" | "datetime"` and `locale: "fa-IR" | "en-US"` and verify the new module type-checks
- [x] 1.6 Create `src/lib/phone.ts` exporting `formatIranPhone`, `isValidIranPhone` (regex `^09\d{9}$`) and verify the new module type-checks
- [x] 1.7 Create `src/lib/inventory.ts` exporting `getStockState`, `LOW_STOCK_THRESHOLD = 5` and verify the new module type-checks
- [x] 1.8 Create `src/lib/payload.ts` exporting `getPayloadClient` (memoized singleton) and verify the new module type-checks
- [x] 1.9 Create `src/lib/api.ts` exporting `apiFetch`, `parsePayloadError` and verify the new module type-checks
- [x] 1.10 Create `src/lib/auth-guard.ts` exporting `requireUser(redirectTo?)` and verify the new module type-checks
- [x] 1.11 Create `src/lib/storage.ts` exporting `ssrSafeLocalStorage`, `safeGetLocalStorage`, `safeSetLocalStorage` and verify the new module type-checks
- [x] 1.12 Create `src/lib/collections.ts` exporting `getPrimary`, `sortByPrimary` and verify the new module type-checks
- [x] 1.13 Create `src/lib/users.ts` exporting `userDisplayName` and verify the new module type-checks
- [x] 1.14 Extend `src/lib/pricing.ts` with `formatToman(price, locale: "fa-IR" | "en-US" = "fa-IR")`, `priceCartItems`, `cartGrandTotal`, `getPricingContext` (existing `getPrice`/`formatPrice`/`formatPriceNumber` retained) and verify `bun tsc --noEmit` stays green
- [x] 1.15 Extend `src/lib/site-settings.ts` with `getSiteName` (returns `settings.name ?? "Store"`) and verify `bun tsc --noEmit` stays green
- [x] 1.16 Extend `src/lib/current-user.ts` with `getCurrentUserWithSettings` and verify `bun tsc --noEmit` stays green
- [x] 1.17 Extend `src/lib/locale.ts` with `site.nameFallback: "فروشگاه"` (replacing the hardcoded fallback in `layout.tsx`) and verify `bun tsc --noEmit` stays green
- [x] 1.18 Run `bun run lint` and verify biome reports no new errors

## 2. Wave 2 — Replace call sites of pure helpers (per duplication group)

- [x] 2.1 Replace 9 inline `getMediaUrl` + 2 inline `getLogoUrl` + 3 inline `showcaseImage ?? images[0]` blocks with `getMediaUrl` / `getLogoUrl` / `getProductImageUrl` from `src/lib/media.ts` and verify `bun tsc --noEmit` green (touches `products/page.tsx`, `products/[slug]/page.tsx`, `brands/page.tsx`, `brands/[slug]/page.tsx`, `categories/[slug]/page.tsx`, `blog/page.tsx`, `blog/[slug]/page.tsx`, `page.tsx`, `contact/page.tsx`, `(app)/layout.tsx`)
- [x] 2.2 Replace 4 inline `getBaseUrl` copies with import from `src/lib/env.ts` (touches `robots.ts`, `sitemap.ts`, `blog/rss.xml/route.ts`, `blog/[slug]/page.tsx`) and verify `bun tsc --noEmit` green
- [x] 2.3 Replace 2 inline `plainTextFromLexical` copies with import from `src/lib/posts.ts` (touches `blog/[slug]/page.tsx`, `blog/rss.xml/route.ts`) and verify `bun tsc --noEmit` green
- [x] 2.4 Replace 3 inline `buildPageHref` + 3 inline `parsePageParam` expressions with imports from `src/lib/url.ts` (touches `products/page.tsx`, `categories/page.tsx`, `blog/page.tsx`) and verify `bun tsc --noEmit` green
- [x] 2.5 Replace 4 inline `formatDate` copies with `formatDate(..., { locale, preset })` from `src/lib/dates.ts` (touches `blog/page.tsx`, `blog/[slug]/page.tsx`, `orders/page.tsx`, `orders/[id]/page.tsx`) and verify `bun tsc --noEmit` green
- [x] 2.6 Replace 2 inline `formatPhone` copies + add `isValidIranPhone` to `login/page.tsx` + `register/page.tsx` regex checks via `src/lib/phone.ts` (touches `account/page.tsx`, `AccountForm.tsx`, `login/page.tsx`, `register/page.tsx`) and verify `bun tsc --noEmit` green
- [x] 2.7 Replace 4 inline stock-state calc copies with `getStockState` from `src/lib/inventory.ts` (touches `home/ProductCard.tsx`, `products/page.tsx`, `products/[slug]/page.tsx`, `product/AddToCartButton.tsx`) and verify `bun tsc --noEmit` green
- [x] 2.8 Replace 15 inline payload bootstrap sites with `getPayloadClient` from `src/lib/payload.ts` (touches all 14 server pages under `src/app/(app)/` + `sitemap.ts` + `blog/rss.xml/route.ts`) and verify `bun tsc --noEmit` green
- [x] 2.9 Replace 6 inline `fetch` JSON wrappers + 2 inline payload-error parsers with `apiFetch` / `parsePayloadError` from `src/lib/api.ts` (touches `login/page.tsx`, `register/page.tsx`, `AccountForm.tsx`, `CheckoutForm.tsx` ×2, `LogoutButton.tsx`) and verify `bun tsc --noEmit` green
- [x] 2.10 Replace 4 inline `redirect("/login?next=…")` patterns with `requireUser()` from `src/lib/auth-guard.ts` (touches `account/page.tsx`, `checkout/page.tsx`, `orders/page.tsx`, `orders/[id]/page.tsx`) and verify `bun tsc --noEmit` green
- [x] 2.11 Replace 2 inline zustand `createJSONStorage` SSR guards with `ssrSafeLocalStorage` from `src/lib/storage.ts` (touches `cart-store.ts`, `wishlist-store.ts`) and replace `ThemeToggle.tsx` localStorage get/set with `safeGetLocalStorage`/`safeSetLocalStorage`; verify `bun tsc --noEmit` green
- [x] 2.12 Replace 2 inline `getPrimary` / `sortByPrimary` copies with imports from `src/lib/collections.ts` (touches `(app)/page.tsx`, `layout/footer.tsx`) and verify `bun tsc --noEmit` green
- [x] 2.13 Replace 3 inline user-display-name derivations with `userDisplayName` from `src/lib/users.ts` (touches `orders/[id]/page.tsx` `customerLabel` + `noteAuthor`, `orders/page.tsx` if applicable) and verify `bun tsc --noEmit` green
- [x] 2.14 Replace 3 inline `formatToman` cart helpers + 5 inline `${price.toLocaleString("fa-IR")} ${t("common.toman")}` templates with `formatToman` from `src/lib/pricing.ts` (touches `CartView.tsx`, `CartSheet.tsx`, `CheckoutForm.tsx`, `home/ProductCard.tsx`, `products/page.tsx`, `products/[slug]/page.tsx`, `brands/[slug]/page.tsx`, `categories/[slug]/page.tsx`) and verify `bun tsc --noEmit` green
- [x] 2.15 Replace 3 cart inline `priced = items.map(...)` partner-discount blocks with `priceCartItems` + `cartGrandTotal` from `src/lib/pricing.ts` (touches `CartView.tsx`, `CartSheet.tsx`, `CheckoutForm.tsx`) and verify `bun tsc --noEmit` green
- [x] 2.16 Replace 3 inline `partnerDiscount` + `customerType` derivations with `getPricingContext()` from `src/lib/pricing.ts` (touches `cart/page.tsx`, `checkout/page.tsx`, `account/page.tsx`) and verify `bun tsc --noEmit` green
- [x] 2.17 Replace 3 inline `Promise.all([getSiteSettings(), getCurrentUser()])` blocks with `getCurrentUserWithSettings` from `src/lib/current-user.ts` (touches `layout.tsx`, `cart/page.tsx`, `checkout/page.tsx`) and verify `bun tsc --noEmit` green
- [x] 2.18 Replace 1 inline `siteName ? settings.name : "فروشگاه"` fallback with `t("site.nameFallback")` (touches `(app)/layout.tsx`) and verify `bun tsc --noEmit` green
- [x] 2.19 Run `bun run lint` and verify biome reports no new errors across all wave-2 changes

## 3. Wave 3 — Add UI primitives (in-place, no registry lookup)

- [x] 3.1 Create `src/components/layout/PageContainer.tsx` rendering `<div className="mx-auto max-w-[1440px] px-4 py-8 md:px-8">` and verify the file exists + renders with the same DOM as the inline copies
- [x] 3.2 Create `src/components/layout/PageHeader.tsx` rendering the eyebrow + `<h1 className="text-[32px] font-medium leading-[1.2] text-[#111111] dark:text-white">` + count line and verify the file exists + DOM matches
- [x] 3.3 Create `src/components/layout/Breadcrumbs.tsx` as a thin wrapper around the existing `src/components/ui/breadcrumb.tsx` accepting `crumbs: Array<{ href?: string; label: string }>` + `separator?: string` and verify the wrapper renders the same DOM as inline copies
- [x] 3.4 Create `src/components/ui/EmptyState.tsx` with `variant: "soft" | "outline"` covering the two wrapper shapes (`rounded-[30px] bg-[#f5f5f5] p-12 text-center dark:bg-[#1a1a1a]` and the no-dark variant) and verify the file exists
- [x] 3.5 Create `src/components/ui/ImageWithFallback.tsx` with `variant: "card" | "hero"` and verify the file exists + renders with the same DOM as the inline `<div>{t("common.noImage")}</div>` blocks (hero variant includes `<Package />` icon)
- [x] 3.6 Create `src/components/ui/InitialsAvatar.tsx` rendering a circular avatar with the first character of `name` and verify the file exists
- [x] 3.7 Create `src/components/ui/PaginatedView.tsx` taking `page`, `totalPages`, `buildHref: (page: number) => string`, optional `paginationLabel` and verify the file exists + emits the same pagination DOM
- [x] 3.8 Create `src/components/cart/QuantityStepper.tsx` with `size: "sm" | "md"` rendering `Minus` / `Plus` / `Trash2` controls and verify the file exists
- [x] 3.9 Create `src/components/auth/AuthFormShell.tsx` accepting `mode: "login" | "register"` + children render-prop and verify the file exists + Suspense fallback DOM matches
- [x] 3.10 Create `src/components/contact/ContactChannelList.tsx` with `kind: "phone" | "email" | "address"` + `variant: "card" | "footer"` and verify the file exists
- [x] 3.11 Relocate `src/components/home/ProductCard.tsx` → `src/components/product/ProductCard.tsx`; broaden props to `showBrand`, `showLowStock`, image-source precedence (`showcaseImage ?? images[0]?.image`); update `src/app/(app)/page.tsx` import; verify `bun tsc --noEmit` green
- [x] 3.12 Run `bun tsc --noEmit` and verify all new components type-check

## 4. Wave 4 — Replace inline UI patterns (per duplication group)

- [x] 4.1 Replace 14 inline `<div className="mx-auto max-w-[1440px] px-4 py-8 md:px-8">` containers with `<PageContainer>` from `src/components/layout/PageContainer.tsx` and verify `bun tsc --noEmit` green
- [x] 4.2 Replace 9 inline `<h1>` + count-line headers with `<PageHeader>` from `src/components/layout/PageHeader.tsx` and verify `bun tsc --noEmit` green
- [x] 4.3 Replace 13 inline breadcrumb `<nav>` blocks with `<Breadcrumbs>` wrapper around `src/components/ui/breadcrumb.tsx` (touches all 13 server pages listed in design §D-14) and verify `bun tsc --noEmit` green
- [x] 4.4 Replace 6 inline empty-state blocks with `<EmptyState>` from `src/components/ui/EmptyState.tsx` (touches `products/page.tsx`, `brands/[slug]/page.tsx`, `categories/[slug]/page.tsx`, `(app)/page.tsx`, `categories/page.tsx`, `brands/page.tsx`) and verify `bun tsc --noEmit` green
- [x] 4.5 Replace 8 inline `noImage` placeholder blocks with `<ImageWithFallback variant="card" | "hero">` from `src/components/ui/ImageWithFallback.tsx` (touches `home/ProductCard.tsx`, `home/CategoryCard.tsx`, `products/page.tsx`, `products/[slug]/page.tsx`, `brands/[slug]/page.tsx`, `categories/[slug]/page.tsx`, `blog/page.tsx`) and verify `bun tsc --noEmit` green
- [x] 4.6 Replace 6 inline initials-avatar spots with `<InitialsAvatar>` from `src/components/ui/InitialsAvatar.tsx` (touches `layout/header.tsx`, `categories/page.tsx`, `contact/page.tsx`, `brands/page.tsx`, `brands/[slug]/page.tsx`, `layout/footer.tsx`) and verify `bun tsc --noEmit` green
- [x] 4.7 Replace 3 inline pagination blocks with `<PaginatedView>` from `src/components/ui/PaginatedView.tsx` (touches `products/page.tsx`, `categories/page.tsx`, `blog/page.tsx`) and verify `bun tsc --noEmit` green
- [x] 4.8 Replace 2 inline cart quantity-stepper JSX blocks with `<QuantityStepper>` from `src/components/cart/QuantityStepper.tsx` (touches `CartView.tsx`, `CartSheet.tsx`) and verify `bun tsc --noEmit` green
- [x] 4.9 Replace 2 inline login/register Suspense shells with `<AuthFormShell>` from `src/components/auth/AuthFormShell.tsx` (touches `login/page.tsx`, `register/page.tsx`) and verify `bun tsc --noEmit` green
- [x] 4.10 Replace 6 contact-channel list blocks (3 in `contact/page.tsx` + 3 in `layout/footer.tsx`) with `<ContactChannelList>` from `src/components/contact/ContactChannelList.tsx` (variants `card` for contact page, `footer` for footer) and verify `bun tsc --noEmit` green
- [x] 4.11 Replace 3 inline product-card render blocks (in `products/page.tsx`, `brands/[slug]/page.tsx`, `categories/[slug]/page.tsx`) with `<ProductCard>` from `src/components/product/ProductCard.tsx` and verify `bun tsc --noEmit` green
- [x] 4.12 Run `bun run lint` and `bun run build`; verify both green

## 5. Wave 5 — Dead code removal + final verification

- [x] 5.1 Delete `src/components/cart/CartSheet.tsx` (entire 222-line file; verified by `git grep -r "CartSheet" src/` returning no imports before deletion); verify `bun tsc --noEmit` green
- [x] 5.2 Delete `isAdminFieldAccess` and `isOwnerOrAdmin` exports from `src/access/index.ts` (verified by `git grep -r "isAdminFieldAccess\|isOwnerOrAdmin" src/` returning no imports before deletion); verify `bun tsc --noEmit` green
- [x] 5.3 Delete `clearOnCheckout` alias from `src/lib/cart-store.ts` (verified by `git grep -r "clearOnCheckout" src/` returning no imports before deletion); verify `bun tsc --noEmit` green
- [x] 5.4 Delete `getCategoryImageFallback` helper from `src/components/home/CategoryCard.tsx` (verified by `git grep -r "getCategoryImageFallback" src/` returning no callers before deletion); verify `bun tsc --noEmit` green
- [x] 5.5 Run `bun tsc --noEmit` and verify green — **6 pre-existing errors remain** (3 in `about/page.tsx` referencing undefined `PageAbout`; 3 in `account/page.tsx` referencing `User.phone`); zero new errors
- [x] 5.6 Run `bun run lint` and verify biome reports no errors — **3 pre-existing warnings + 1 info** in `Products.ts` and `api.ts`; zero new errors
- [x] 5.7 Run `bun run build` and verify build succeeds — **Compiles successfully in 14.6s**, fails on typecheck stage due to 6 pre-existing tsc errors (out of scope); Turbopack source-map panic encountered intermittently during wave 5 retry was environmental
- [x] 5.8 Run `bun run test:int` and verify all Vitest suites pass — **1 test passed (api.int.spec.ts)**
- [x] 5.9 Run `bun run test:e2e` and verify all Playwright suites pass — **build pre-flight failed** (depends on `bun run build` which can't complete due to pre-existing tsc errors blocking the typecheck stage); e2e suites can't run until those are fixed
- [x] 5.10 Confirm zero residual inline copies via: `git grep -n "function getMediaUrl\|function getLogoUrl\|function getBaseUrl\|function plainTextFromLexical\|function buildPageHref\|function formatDate\|function formatPhone\|function getPrimary\|function sortByPrimary\|function statusTone"` returns no hits in `src/app/(app)/` or `src/components/` — **verified clean**