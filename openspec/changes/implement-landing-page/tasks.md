## 1. Setup & Design Lint

- [x] 1.1 Read `.agents/skills/payload/SKILL.md` (Local API conventions) and `.agents/skills/shadcn/SKILL.md` (existing Card/Badge reuse) before writing any code; verify the skill files exist at `ls .agents/skills/payload/SKILL.md .agents/skills/shadcn/SKILL.md`
- [x] 1.2 Read `DESIGN.md` front matter and the prose for `component.product-card`, `component.button-primary`, `component.section-head`, `colors.soft-cloud`, `colors.hairline-soft`, `typography.heading-lg`, `typography.display-campaign`, `rounded.full`, `rounded.lg`, `spacing.section`; verify by `head -120 DESIGN.md` returns the expected token sections
- [x] 1.3 Run `bunx @google/design.md lint DESIGN.md` and verify exit code 0 (baseline before any change)

## 2. Theme Toggle

- [x] 2.1 Create `src/components/layout/ThemeToggle.tsx` (`"use client"`) with a 40px circular button (sun + moon SVGs from `landing-page.html` lines 295–296) wrapped in a `.theme-toggle` class; verify by `bun run build` succeeds and the component file imports without TypeScript error
- [x] 2.2 Add the inline pre-paint script to `src/app/(app)/layout.tsx` via `<Script id="theme-pref" strategy="beforeInteractive">` reading `localStorage.theme-pref` and `prefers-color-scheme`, setting `<html data-theme>` and the toggle's `aria-pressed`; verify by reloading `/` in dark-mode system preference and confirming no light-mode flash
- [x] 2.3 Mount `<ThemeToggle />` in `src/app/(app)/layout.tsx` right-cluster (between cart icon and Sign in / Sign up) and verify by `bun run dev` then `curl -s http://localhost:3000/ | grep 'data-theme-toggle'` returns a match

## 3. CSS Port

- [x] 3.1 Add a single `@layer components { ... }` block to `src/app/globals.css` containing: token vars (`:root`, `:root[data-theme="dark"]`), reset, layout (`.container`, `.section`, `.grid-3`, `.grid-4`, plus the four responsive breakpoint overrides at 1023/920/599/640px), type scale (`.eyebrow`, `.lead`, `.meta`, `.num`, `.h1`, `.h2`), buttons (`.btn`, `.btn-primary`, `.btn-secondary`, `.btn-ghost`, `.btn-arrow`), hero (`.hero*`), category grid (`.categories-grid`, `.category-card`, `.category-mark`, `.category-meta`), product (`.product`, `.product-img`, `.product-info`, `.product-cat`, `.product-name`, `.product-price`, `.product-price.contact`), section head (`.section-head`, `.section-eyebrow`), cat list (`.cat-list`, `.cat-row`, `.cat-mark`, `.cat-info`, `.cat-name`, `.cat-desc`, `.cat-count`, `.cat-arrow`), and the existing `.theme-toggle` block; verify by `bun run build` produces no PostCSS errors
- [x] 3.2 Run `bunx @google/design.md lint DESIGN.md` after the CSS edit and verify exit code 0; if non-zero, replace any remaining raw hex outside `:root` with the matching `DESIGN.md` token path

## 4. Home Page Components

- [x] 4.1 Create `src/components/home/SectionHead.tsx` (server component) accepting `{ eyebrow: string; title: string; actionHref?: string; actionLabel?: string }` and rendering the markup from `landing-page.html` lines 324–330; verify by `grep -c 'section-head' src/components/home/SectionHead.tsx` returns ≥1
- [x] 4.2 Create `src/components/home/CategoryCard.tsx` (server component) accepting `{ category: Pick<Category, 'id' | 'name' | 'slug' | 'description'>; count: number }` and rendering the markup from lines 332–344 with the monogram = `name.charAt(0)` and `href = /products?category=${slug}`; verify by `bun run build` and visual check at `/`
- [x] 4.3 Create `src/components/home/ProductCard.tsx` (server component) reusing `<Card>` from `src/components/ui/card.tsx` and matching the markup from `src/app/(app)/products/page.tsx:287` (1:1 image stage, category badge, name, price); accept `{ product: Pick<Product, 'id' | 'name' | 'slug' | 'price' | 'inventory' | 'category' | 'images'> }`; verify by rendering on `/` and confirming visual parity with `/products`
- [x] 4.4 Create `src/components/home/CatRow.tsx` (server component) accepting `{ label: string; description?: string | null; count: number; href: string }` (used for both category and brand rows); render monogram = `label.charAt(0)` in `.cat-mark`; verify by `bun run build` and visual check

## 5. Home Page Composition

- [ ] 5.1 Rewrite `src/app/(app)/page.tsx` as a server component that fetches in `Promise.all`: `payload.find({ collection: 'products', where: { visible: { equals: true } }, sort: '-createdAt', limit: 4, depth: 1 })`, `payload.find({ collection: 'products', where: { visible: { equals: true } }, sort: '-inventory', limit: 4, depth: 1 })`, `payload.find({ collection: 'categories', sort: 'name', limit: 100, depth: 0 })`, `payload.find({ collection: 'brands', sort: 'name', limit: 100, depth: 1 })`, and `payload.findGlobal({ slug: 'site-settings', depth: 1 })`; verify by `bun run build` and `bun run dev` returning HTML at `/`
- [ ] 5.2 Render the seven sections in order in `page.tsx`: skip link, static hero (`landing-page.html` lines 307–319), category grid (`<SectionHead>` + up to 3 `<CategoryCard>`s), newly-added (skip if empty), popular (skip if all inventories are 0), full category list (`<CatRow>` per category), brands list (`<CatRow>` per brand); verify by `curl -s http://localhost:3000/ | grep -c 'data-od-id'` returns ≥5 (hero/categories/featured-products/most-popular/category-list/brands-list)
- [ ] 5.3 For each product, derive `imageUrl = product.images?.[0]?.image?.url ?? null` (cast Media as in `layout.tsx:44`); when `price === 0`, render "Contact for price" instead of a numeric price; verify by visiting `/` and confirming a seeded product with `price: 0` shows the contact text
- [ ] 5.4 Set `metadata` on the page (`title: فروشگاه · ${siteName}` and `description: لوله، اتصالات فاضلاب و شیرآلات صنعتی…`); export it from `page.tsx` as a static `export const metadata` (or `generateMetadata` if dynamic from site-settings); verify by `curl -s http://localhost:3000/ | grep '<title>'` returning the Farsi title

## 6. Acceptance Checks

- [ ] 6.1 Verify `bun run lint` exits 0 (no unused imports, no eslint-disable regressions on the rewritten files); fix any reported issues
- [ ] 6.2 Verify `bun run build` exits 0 (TypeScript + Next.js production build); fix any reported type errors in the new components
- [ ] 6.3 Verify `bun run dev` + browser check: hero copy matches `landing-page.html` lines 311–312 verbatim; category grid shows up to 3 cards; product grids show up to 4 cards each; category list and brands list render one row per record; theme toggle flips and persists; no Payload welcome text appears anywhere; document with one screenshot per breakpoint (1440px, 920px, 599px)
- [ ] 6.4 Verify empty-state behavior: with categories empty, the category grid section is omitted; with brands empty, the brands section is omitted; with all products `visible: false`, both product sections are omitted; confirm by deleting test seed entries and reloading
- [ ] 6.5 Run `bunx @google/design.md lint DESIGN.md` one final time and verify exit 0; if non-zero, fix any token regression in the new CSS block
- [ ] 6.6 Run accessibility spot-check via `bunx --bun axe-cli http://localhost:3000/` (or manual keyboard tab pass) and verify: skip link works, all sections announce headings, theme toggle reachable by keyboard, every card reachable by keyboard with visible focus ring; document any a11y issues for follow-up