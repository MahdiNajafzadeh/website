## 1. Foundation — Skills, Design Tokens, Tooling

- [x] 1.1 Load Payload skill (`.agents/skills/payload/SKILL.md`), BeUI skill (`.agents/skills/beui/SKILL.md`), Shadcn skill, and read `DESIGN.md` — verify by listing tokens (`{colors.ink}`, `{typography.button-md}`, `{rounded.full}`, `{component.button-primary}`) and lint `bunx @google/design.md lint DESIGN.md`
- [x] 1.2 Audit UI needs via `bunx --bun shadcn@latest search` and `curl -fsS https://beui.dev/r/registry.json` — record chosen `@beui/*` slugs and `shadcn` primitives; verify `bunx --bun shadcn@latest --help` succeeds

## 2. Payload Data Layer — Collections & Globals

- [x] 2.1 Extend `src/collections/Users.ts` — load payload skill, add `firstName`, `lastName`, `phone` (unique, validate `/^09\d{9}$/`), `address`, `role` (`admin`/`employee`/`customer` default `customer`), `customerType` (`regular`/`partner`), make `email` optional, `admin.useAsTitle='phone'` — verify `bun run generate:types` includes `User` with new fields
- [x] 2.2 Create `src/collections/Brands.ts` — `name` required, `slug` unique auto-derived, `icon` upload→`media`, `description` — verify `bunx --bun tsc --noEmit` passes
- [x] 2.3 Create `src/collections/Categories.ts` — `name` required, `slug` unique, `description` — verify registered in `payload.config.ts`
- [x] 2.4 Create `src/collections/Products.ts` — `name` required, `slug` unique, `visible` default false, `price` number default 0, `inventory` number default 0, `brand`/`category` relationships, `images` array upload, `showcaseImage` upload — verify `bun run generate:types` includes `Product`
- [x] 2.5 Create `src/collections/Posts.ts` — per skill, `name` required `useAsTitle`, `slug` unique auto, `content` `richText` (uses global `lexicalEditor()`), `published` bool default false, `coverImage` upload, `excerpt` textarea 160, `publishedAt` date hook — verify Lexical editor renders without field-level editor config
- [x] 2.6 Create `src/collections/Orders.ts` — `items` array `{product (relationship), name snapshot, price snapshot, quantity}`, `total` number, `status` select `review|approved|preparing|delivered|cancelled`, `shippingAddress`, `notes` array, `hasZeroPrice` bool, `customer` relationship — add `beforeChange` total/snapshot/zero-price hook and status transition guard — verify `bun run generate:types` includes `Order`
- [x] 2.7 Create `src/globals/SiteSettings.ts` — `siteName` en/fa, `logo`/`favicon` upload, `phones`/`emails`/`addresses` arrays `{label, value, isPrimary}`, `socialLinks` `{icon upload, name, url, description}`, `partnerDiscount` 0–100 — verify global appears at `/admin/globals/site-settings`
- [x] 2.8 Create `src/globals/PageAbout.ts` — `content` `richText` — verify global appears and `bun run generate:types` includes `PageAbout`
- [x] 2.9 Wire `src/payload.config.ts` — import all collections/globals, keep `lexicalEditor()` global, add `access` imports, run `bun run generate:importmap && bun run generate:types` — verify `bunx --bun tsc --noEmit` and `payload-types.ts` updated
- [x] 2.10 Create access helpers `src/access/index.ts` — `isAdmin`, `isAdminOrEmployee`, `isOwnerOrAdmin`, `readPublishedOnly` — apply to collections (posts/products/orders visible/published guards) and globals (site-settings admin-only) — verify `bun run test:int` access tests pass

## 3. Auth & RBAC

- [x] 3.1 Configure `Users` auth for `phone` — set `auth: { tokenExpiration: 86400 }`, login by `phone`+`password` (keep email fallback one release), ensure 24h expiry — verify `bunx --bun vitest run src/collections/Users.test.ts` login success/failure + redirect tests
- [x] 3.2 Add middleware `src/app/(app)/middleware.ts` — protect `/checkout`, `/orders`, `/account` → `/login?next=`, block `customer` from `/admin` → `/` with alert — verify `ls src/app/\(app\)/middleware.ts` and `bun run test:e2e` unauthenticated checkout redirect
- [x] 3.3 Implement `src/app/(app)/login/page.tsx` and `src/app/(app)/register/page.tsx` under `(app)` — use `shadcn` Form/Input via `bunx --bun shadcn@latest add form input` + verified `@beui` button, style with `{colors.ink}`, `{colors.canvas}`, `{component.button-primary}`, `{rounded.full}` — verify `ls src/app/\(app\)/login/page.tsx` and Playwright login flow

## 4. Design System & Shared UI

- [x] 4.1 Install shadcn/beui components — `bunx --bun shadcn@latest add button card badge breadcrumb pagination sheet table form input textarea sheet card carousel` and `bunx --bun shadcn@latest add @beui/button @beui/card @beui/sheet @beui/badge @beui/breadcrumb @beui/pagination` (adjust per registry result) — verify `ls src/components/ui/` has installed components
- [x] 4.2 Build `src/app/(app)/layout.tsx` header/footer — consume `site-settings` via `getPayload().findGlobal`, header shows logo/siteName with `{typography.heading-md}`, nav includes `Blog`→`/blog`, cart icon with badge, footer shows primary phone/email/address + social icons — verify visual with `bun run dev` and `DESIGN.md` tokens contain no raw hex in header
- [x] 4.3 Add `src/lib/cart-store.ts` (zustand persist) + `src/lib/pricing.ts` + `src/lib/utils.ts` cn — cart logic (add merge, updateQuantity 0→remove, remove+undo, total `sum(price*qty)`, count `sum(qty)`, clearOnCheckout) and `getPrice(product, customerType, discount)` — verify `bunx --bun vitest run src/lib/cart-store.test.ts` total/badge/undo tests

## 5. Product, Brand, Category Surfaces

- [x] 5.1 Build `src/app/(app)/products/page.tsx` — server fetch `payload.find({collection:'products', where:{visible:{equals:true}}, depth:1})` with search `?q=` + brand `?brand=` + category `?category=` filters, pagination, `shadcn` Card + `beui` gallery — styled `{colors.soft-cloud}`, `{rounded.lg}`, `{typography.body-strong}` — verify `/products` shows visible only and filter composes
- [x] 5.2 Build `src/app/(app)/products/[slug]/page.tsx` — detail with `{typography.heading-xl}` title, brand link, category pill, `images` gallery, showcase, price with `{colors.sale}` handling, inventory badge `{colors.mute}`/"ناموجود", low-stock badge, wishlist/share — verify 404 for hidden slug
- [x] 5.3 Build `src/app/(app)/brands/page.tsx` + `src/app/(app)/brands/[slug]/page.tsx` — listing with icon+name `{rounded.lg}`, detail shows products by brand via relationship query — verify `bun run test:e2e` brand-filter and 404 unknown slug
- [x] 5.4 Build `src/app/(app)/categories/[slug]/page.tsx` + filter pills on products page — pills use `{colors.soft-cloud}`, `{rounded.full}`, `{typography.caption-md}` — verify combined brand+category filter

## 6. Cart & Checkout

- [x] 6.1 Build `src/components/cart/CartSheet.tsx` and badge in header — `shadcn` Sheet, `sonner` Undo toast 3s, uses `cart-store` — verify header badge `sum(qty)` and sheet slide-over interaction via Playwright
- [x] 6.2 Build `src/app/(app)/cart/page.tsx` — full page list with qty `+/-`, trash, subtotal per item, summary card `{typography.body-strong}` grand total, `Proceed to Checkout` `{component.button-primary}` — verify empty state "Your cart is empty" + Browse Products link
- [x] 6.3 Build `src/app/(app)/checkout/page.tsx` — address form (required, save to `users.address`), order summary with partner pricing, submit → `payload.create({collection:'orders', data:{items: snapshot, total, status:'review'}})` then `cart.clear()` — verify order created with `review` and cart cleared, failure keeps cart
- [x] 6.4 Add partner pricing wiring — server components call `pricing.getPrice` with `site-settings.partnerDiscount` and `user.customerType`; cart and checkout totals use discounted values, strike-through original with `{colors.mute}` — verify `bunx --bun vitest run src/lib/pricing.test.ts` 10%→90k for 100k

## 7. Blog & SEO Surfaces

- [x] 7.1 Build `src/app/(app)/blog/page.tsx` — 12/page paginated (newest first), `where:{published:{equals:true}}`, empty state, `shadcn` Pagination + `beui` card, SEO `title: "Blog | {siteName}"` — verify page 1 has 12, `?page=2` has remainder, drafts excluded
- [x] 7.2 Build `src/app/(app)/blog/[slug]/page.tsx` — `notFound()` for draft/unknown, `RichText` Lexical rendering (headings/lists/links/media with alt), coverImage, date, `generateMetadata` OG/article tags + canonical `https://{domain}/blog/[slug]` — verify SSR HTML contains title/meta without JS
- [x] 7.3 Build `src/app/(app)/blog/rss.xml/route.ts`, `src/app/(app)/sitemap.ts`, `src/app/(app)/robots.ts` — sitemap includes published with `<lastmod>` from `updatedAt`, robots allows `/blog`, RSS `<item>` per post — verify `curl http://localhost:3000/sitemap.xml` and `curl /blog/rss.xml` contain published only
- [x] 7.4 Add ISR + revalidation — `export const revalidate=300` on blog routes, `posts` `afterChange` hook `revalidatePath('/blog')` + `revalidatePath('/blog/'+slug)` + `revalidateTag('posts')` — verify publish toggle appears without redeploy

## 8. Orders & Account

- [x] 8.1 Build `src/app/(app)/orders/page.tsx` + `src/app/(app)/orders/[id]/page.tsx` — customer history sorted newest first, detail shows items snapshot, address, status history, zero-price flagged with `{colors.sale}` — verify own-orders only via `access` + `where:{customer:{equals:user.id}}`
- [x] 8.2 Build `src/app/(app)/account/page.tsx` — show `firstName`/`lastName`/`phone` read-only `{colors.mute}` + editable address, `customerType` display, order count — verify phone unique/format error on duplicate `09` check
- [x] 8.3 Admin notes & status workflow — `orders` admin UI notes field employee-only, status dropdown enforces `review`→`approved`→`preparing`→`delivered`/`cancelled` — mock SMS on transition via `afterChange` log — verify `bun run test:int` status guard tests

## 9. Static Pages (About / Contact)

- [x] 9.1 Build `src/app/(app)/about/page.tsx` — read `page-about` global, Lexical `RichText`, breadcrumb `Home › About Us` with `{typography.caption-md}`, empty state — SEO `About Us | {siteName}` — verify `ls src/app/\(app\)/about/page.tsx`
- [x] 9.2 Build `src/app/(app)/contact/page.tsx` — read `site-settings` phones/emails/addresses/socialLinks, `tel:`/`mailto:` links, primary badges `{colors.success}`/`{colors.mute}`, fallback icon for social, response notice "The {siteName} team will respond..." — handle partial/empty configs — verify `ls src/app/\(app\)/contact/page.tsx` and Playwright contact channels test

## 10. Verification & Release

- [x] 10.1 Run `bun run generate:types && bun run generate:importmap && bunx --bun tsc --noEmit` — verify no type errors
- [x] 10.2 Run `bunx --bun vitest run` (int: access, pricing, cart totals) and `bun run build` — verify both pass; fix any `bun` vs `npm` drift
- [x] 10.3 Run `bunx --bun playwright test --config=playwright.config.ts` covering auth, cart, blog (list/detail/SEO), products filter, checkout→order, contact — verify `bun` runner used and `src/app/(app)` paths exercised
- [x] 10.4 Validate change — `openspec validate --change full-website-implementation --strict` — verify no errors on proposal/specs/design/tasks
