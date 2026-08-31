## Context

See `proposal.md` — Why (14 specs ratified, implementation at zero beyond `Users`/`Media` starter). Current repo: `src/payload.config.ts` has only `Users`+`Media`, `src/app/(app)` has placeholder `page.tsx`, `DESIGN.md` Nike tokens are the visual contract, Payload `lexicalEditor()` is global, `bun` is the mandated runner. Load order is strict: `.agents/skills/payload/SKILL.md` before any collection/global work; `.agents/skills/beui/SKILL.md` + `.agents/skills/shadcn/SKILL.md` before any UI work (verified via `bunx --bun shadcn@latest search` and `curl -fsS https://beui.dev/r/registry.json`).

Constraints: All public UI MUST live under `src/app/(app)` (route group); `(payload)` is admin/api only. Visuals MUST use `DESIGN.md` token paths, not ad-hoc hex/px. All commands use `bun` (`bunx --bun`, `bun run`). SQLite via `DATABASE_URL`, `PAYLOAD_SECRET` for 24h sessions, ISR for blog.

## Goals / Non-Goals

**Goals:**
- Implement all 14 specs vertically so integration tests can run end-to-end (Payload → `(app)` rendering → SEO surfaces).
- Enforce RBAC (`admin`/`employee`/`customer`, `customerType` `regular`/`partner`) at Payload `access` layer and `(app)` middleware.
- Deliver blog SSR/ISR, sitemap/robots/RSS, cart persistence, partner pricing, and order lifecycle with snapshot/total hooks.
- Use `shadcn`+`beui (@beui/*)` via `bunx --bun shadcn@latest add` for every UI surface; only bespoke where registry gap is proven.

**Non-Goals:**
- No new spec capabilities — this is implementation against frozen specs (deltas are binding clarifications only).
- No `DESIGN.md` token additions without linted proposal (`bunx @google/design.md lint DESIGN.md`).
- No payment gateway, real SMS provider, or i18n framework beyond what specs require (notified via mock).
- No migration of historical email-based auth users in this phase beyond dual-field fallback.

## Decisions

### 1. Payload data layer — extend config per skill, not ad-hoc
**Choice:** Define 5 new collections (`products`, `brands`, `categories`, `posts`, `orders`) + 2 globals (`site-settings`, `page-about`) in `src/collections/` & `src/globals/` and import into `src/payload.config.ts`, following `.agents/skills/payload/SKILL.md` patterns (field `required`/`unique`/`validate`, `admin.useAsTitle`, `access` functions, `hooks.beforeChange/afterChange`). Regenerate types via `bun run generate:types` → `src/payload-types.ts`.
**Why:** Skill is source of truth for Lexical, upload, and access patterns; avoids drift from Payload 3.88 conventions.
**Alternatives:** Single-file config — rejected (unmaintainable at 7+ entities). Prisma surrogate — rejected (Payload is auth + admin).
**Mapping:** `collection-post` → `posts` (`name` required, `slug` unique auto-derived, `content` `richText`, `published` default false, `coverImage` upload→`media`, `excerpt` 160, `publishedAt` hook); `collection-product` → `products` (`name`, `visible` default false, `price` 0, `inventory` 0, `brand`/`category` relationship, `images` array, `showcaseImage`); `collection-brand/category` similarly; `collection-order` → `orders` (`items` array with snapshot `{name,price,quantity}`, `total` computed hook, `status` enum, `notes` array, `shippingAddress`); `users` extended (`firstName`, `lastName`, `phone` unique+validate `/^09\d{9}$/`, `role` select, `customerType`); `site-settings` global (siteName En/Fa, logo/favicon upload, phones/emails/addresses arrays with `isPrimary`, socialLinks `{icon, name, url, description}`, `partnerDiscount` 0–100); `page-about` global (`content` `richText`).
**Verified by:** `openspec validate --strict` passes; `bunx --bun tsc --noEmit`.

### 2. Auth & RBAC — Payload auth on `phone`, middleware guards
**Choice:** Switch `Users` auth to `phone` field (fallback `email` for migration), `auth: { tokenExpiration: 86400 }` (24h), hash via Payload default. `access` helpers: `isAdmin`, `isAdminOrEmployee`, `isOwnerOrAdmin`. `role` assignment only by `admin`. Middleware `src/app/(app)/middleware.ts` redirects `/checkout` & `/orders` & `/account` to `/login?next=...` and `/admin` to `/` for `customer`.
**Alternatives:** NextAuth — rejected (duplicates Payload sessions). JWT custom — rejected (Payload already manages `sessions`).
**Risk:** Email→phone migration breaking existing seed users → Mitigation: keep `email` field optional, dual lookup in `login` hook for one release.

### 3. Frontend structure — `(app)` isolation
**Choice:**
```
src/app/(app)/layout.tsx          // header/footer consuming site-settings, CartProvider, Toaster
src/app/(app)/page.tsx            // home
src/app/(app)/products/page.tsx + [slug]/page.tsx
src/app/(app)/brands/page.tsx + [slug]/page.tsx
src/app/(app)/categories/[slug]/page.tsx
src/app/(app)/blog/page.tsx + [slug]/page.tsx + rss.xml/route.ts
src/app/(app)/cart/page.tsx
src/app/(app)/checkout/page.tsx
src/app/(app)/orders/page.tsx + [id]/page.tsx
src/app/(app)/contact/page.tsx    // page-contract
src/app/(app)/about/page.tsx
src/app/(app)/account/page.tsx
src/app/(app)/sitemap.ts | robots.ts
src/components/ (cart, product, blog, layout)
src/lib/cart-store.ts (zustand + persist)
src/lib/pricing.ts (partner discount)
```
**Why:** Satisfies rule `src/app/(app)` only; keeps `(payload)` isolated. Server components for data fetching (`getPayload` + `payload.find`) with `where[published][equals]=true` for public reads; client components only for cart interactions.

### 4. UI system — shadcn + beui first
**Choice:** Registry-first workflow: `bunx --bun shadcn@latest search <need>` and `curl -fsS https://beui.dev/r/registry.json | jq` before any custom UI. Expected installs: `bunx --bun shadcn@latest add @beui/button @beui/card @beui/sheet @beui/badge @beui/breadcrumb @beui/pagination @beui/carousel @beui/form @beui/table` etc. plus `shadcn` primitives (`sheet`, `card`, `breadcrumb`, `pagination`, `form`, `table`, `badge`).
**Alternatives:** Custom motion — rejected (duplicates beui, harder to maintain).
**DESIGN.md mapping (read first, lint on change):**
- Shell: `{colors.ink}` header/footer, `{colors.canvas}` pages, `{colors.soft-cloud}` stages, `{colors.hairline}` dividers, `{typography.heading-xl}`/`{typography.body-md}`, `{rounded.lg}`/`{rounded.full}`, `{spacing.section}`.
- Product card: `{component.product-card}` + `{colors.soft-cloud}` photo, `{typography.body-strong}` name, `{typography.caption-md}` price, `{colors.sale}` sale.
- CTAs: `{component.button-primary}` (`{colors.ink}`→`{colors.on-primary}`, `{rounded.full}`, `{typography.button-md}`).

### 5. Cart & pricing — client store + server snapshot
**Choice:** Zustand `persist` (localStorage) store with `items: {productId, name, price, image, quantity}`, derived `total`/`count`, `add` (merge if exists), `updateQuantity` (0→remove), `remove` with undo toast (3s, `sonner`), `clear`. Partner discount resolved server-side via `site-settings.partnerDiscount` and applied at display and at order creation snapshot (`pricing.getPrice(product, customerType, discount)`). `Add to Cart` button shows `Added`+checkmark 1.5s.
**Alternatives:** Server session cart — rejected (guest cart would require auth). Cookie cart — rejected (size limits).

### 6. Blog & SEO — SSR/ISR + revalidation
**Choice:** `src/app/(app)/blog/page.tsx` paginated (12/page, `?page=` query, `sort: -createdAt`, `where published`). Detail `generateMetadata` builds `title: "${post.name} | ${siteName}"`, `description: excerpt||truncate(content,160)`, `openGraph: {title, description, images:[coverImage.url], type:'article', publishedTime: publishedAt}`. `src/app/(app)/sitemap.ts` and `robots.ts` and `rss.xml/route.ts` query published posts. `export const revalidate = 300` ISR; Payload `afterChange` hook on `posts` calls `revalidatePath('/blog')` & `revalidatePath('/blog/[slug]')`.
**Alternatives:** Full SSG at build — rejected (needs redeploy on publish).

### 7. Order lifecycle — hooks for total/snapshot/status
**Choice:** `orders` `beforeChange` hook computes `total = sum(price*qty)` + flags `hasZeroPrice`; `beforeValidate` snapshots product names/prices. Status field `select: ['review','approved','preparing','delivered','cancelled']` with `access.update` enforcing forward transitions (except `cancelled` any→). `afterChange` hook sends mock notification (SMS placeholder) on `approved`/`delivered`/`cancelled`. Notes array `admin`+`employee` read/write, hidden from `customer`.
**Alternatives:** Separate workflow collection — rejected (over-engineered).

## Risks / Trade-offs

- **Payload/Lexical coupling** → Posts rendering depends on `@payloadcms/richtext-lexical` server RichText; breaking upgrade → Mitigation: pin `3.88.0`, `bun run generate:types` in CI, visual regression for blog.
- **Phone as auth identifier** → Email-based seeds break → Mitigation: keep `email` optional, dual login (phone||email) for one minor, migration script `bun run payload migrate:phone`.
- **Cart hydration mismatch** (SSR total vs client localStorage) → flash → Mitigation: `useHydrated` guard, header badge renders only after mount, `suppressHydrationWarning` on count.
- **ISR staleness** (new publish not immediate) → Mitigation: `afterChange` revalidation + `revalidateTag('posts')` on demand.
- **beui registry gap** (e.g., niche e-commerce block) → custom fallback → Mitigation: document gap in PR, implement minimal shadcn composition with same DESIGN tokens.
- **SQLite scale** (orders/products growth) → Mitigation: indexes on `slug`, `published`, `visible`, `status`; SQLite fine for starter, Postgres swap is `dbAdapter` change only.

## Migration Plan

1. **DBPrep:** `bun run payload migrate:create -- add-ecommerce-collections` → new collections/globals, indexes; `email` made optional, `phone` added unique; `role` default `customer`.
2. **Seed & types:** `bun run generate:types` commits updated `payload-types.ts`; `bunx --bun payload seed` with sample brands/categories/products/posts/media.
3. **Deploy:** `bun run build` (Next 16) with `PAYLOAD_SECRET`, `DATABASE_URL`; `bun run start`. ISR warms `/blog`, `/products`, `/brands`.
4. **Verification:** `bun run test:int` (Vitest access/total tests), `bun run test:e2e` (Playwright auth/cart/blog/order), `curl /sitemap.xml` & `/blog/rss.xml` contain published only, `bunx --bun tsc --noEmit`.
5. **Rollback:** DB migration reversible (`down` drops new tables); feature flag `ENABLE_ECOM_COLLECTIONS` gates `(app)` nav links; previous Docker image retained.

## Open Questions

- Zero-price order notification channel (real SMS provider vs mock) — defer; hook interface abstracts it.
- Persian vs English default for SEO titles — defer to `site-settings` locale field; initial is English with Persian fallback.
- Image optimization (Payload upload `sharp` vs Next `next/image` remote) — `next/image` with `remotePatterns` for `media` URLs; tuning deferred to Perf phase.
