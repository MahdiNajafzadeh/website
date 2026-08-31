## Why

`src/app/(app)/page.tsx` currently renders the default Payload welcome screen. The design for an industrial-supply storefront (`فروشگاه`) is complete and locked in `landing-page.html` + `landing-page-plan.md` at `/home/mahdi.najafzadeh/.local/src/open-design/.od/projects/f98bda8b-bd14-40ba-ab2e-c2d69e0c0fd8/`, but the canonical Next.js + Payload port does not exist. Visitors land on Payload boilerplate, so catalog depth, brand authority, and account access are not conveyed in the first viewport. Implementing now closes the gap between the design artifact and the live site.

## What Changes

- **New home route `/` under `src/app/(app)`**: replace the Payload welcome page with a server component that renders the seven sections defined in the design artifact (hero, categories grid, newly added products, most popular products, full category list, brands list) between the existing `topnav` and `footer` in `src/app/(app)/layout.tsx`.
- **Data fetching via Payload Local API**: one `Promise.all` of five reads — newest visible products (limit 4, sort `-createdAt`), popular visible products (limit 4, sort `-inventory`), all categories (sort `name`), all brands (sort `name`, depth 1), and `site-settings` global — using existing `getPayload({ config })` pattern from `layout.tsx:32` and `products/page.tsx`.
- **Reusable section/card primitives**: `src/components/home/CategoryCard.tsx`, `ProductCard.tsx`, `CatRow.tsx`, `SectionHead.tsx` — each consumes a typed Payload doc (`Category`, `Product`, `Brand`) and produces markup that matches the existing product-card pattern in `src/app/(app)/products/page.tsx:287`.
- **CSS additions to `src/app/globals.css`**: tokens, base reset, layout primitives, type scale, buttons, topnav, hero, category-card, product, cat-list, theme-toggle. Existing layout component classes are reused where they already match; bespoke additions scoped via `@layer components` to coexist with Tailwind v4 utilities used in `layout.tsx`.
- **Theme toggle inline script** kept as a small client component (`src/components/layout/ThemeToggle.tsx`) mounted in `layout.tsx` right-cluster, before the cart icon. Reads `localStorage.theme-pref` and `prefers-color-scheme`, applies `data-theme` on `<html>` before paint via synchronous inline `<script>` injected through `next/script` `strategy="beforeInteractive"` to prevent FOUC.
- **Catalog navigation routes** link to existing endpoints — `/products?category=<slug>` (consumed in `products/page.tsx`), `/products/<slug>`, `/brands/<slug>`. No new routes are introduced.
- **No collections, globals, or access rules are modified.** All required data shapes already exist (`Products`, `Categories`, `Brands`, `site-settings`).
- **No breaking changes.** The existing `(app)/layout.tsx` topnav and footer continue to render; only the body of `/` changes.

## Capabilities

### New Capabilities

- `page-home`: Public homepage at `/` that renders seven sections from Payload data (hero, 3-up category grid, 4-up newly-added products, 4-up popular products, full category list, brands list) using the industrial-supply design tokens bound from `DESIGN.md`. Defines the section contract, the data-fetching shape, the placeholder fallback, and the per-section accessibility/SEO behavior.

### Modified Capabilities

- None. `collection-product`, `collection-category`, `collection-brand`, and `global-site-settings` are read-only here; no requirement text changes. If implementation reveals a need (e.g., adding a `popular: boolean` field on `Products`), follow-up changes will declare deltas.

## Impact

- **Code**: `src/app/(app)/page.tsx` (rewrite), `src/app/globals.css` (additions only — do not remove existing rules), `src/app/(app)/layout.tsx` (insert `<ThemeToggle />` and a no-FOUC `<script>` block via `next/script`), new files under `src/components/home/`, new file `src/components/layout/ThemeToggle.tsx`.
- **APIs**: Payload Local API only — `payload.find({ collection, ... })` and `payload.findGlobal({ slug: 'site-settings' })`. No REST endpoint additions.
- **Dependencies**: None added. `next` (App Router server + client components), `payload` (Local API), `next/script`, `next/image` (already in `package.json`), and Tailwind v4 utilities are sufficient. No new `bun add`.
- **Design governance**: All colors, typography, spacing, and radii follow `DESIGN.md` tokens referenced via token paths (`{colors.ink}`, `{colors.soft-cloud}`, `{colors.hairline-soft}`, `{typography.heading-lg}`, `{rounded.full}`, `{component.button-primary}`, etc.). The bespoke CSS in `landing-page.html` lines 41–275 is ported 1:1 with token paths substituted; no ad-hoc hex/px outside the `:root` token block. Lint with `bunx @google/design.md lint DESIGN.md` after any `globals.css` edit.
- **UI system**: shadcn + beui (`@beui`) searched first; the landing page uses no animated component, so no `bunx --bun shadcn@latest add` is required. Existing `Card`, `Badge`, `Button` from `src/components/ui/` are reused where they fit the product/category card pattern.
- **Skills loaded before work**: `.agents/skills/payload/SKILL.md` (Local API patterns), `.agents/skills/shadcn/SKILL.md`, `.agents/skills/beui/SKILL.md`, `.agents/skills/design-md/SKILL.md` (if present).
- **Tooling**: `bun` is the only runner/manager. Verification: `bun run lint`, `bun run build`, manual browser check at `bun run dev`.
- **Breaking**: None. `/` URL is preserved; existing layout wraps the new body unchanged.