## Context

The storefront has Payload collections (`Products`, `Categories`, `Brands`) and the `site-settings` global already wired and seeded. The Next.js App Router under `src/app/(app)` is in place with a sticky topnav + footer in `(app)/layout.tsx`. The default Payload welcome screen at `src/app/(app)/page.tsx` is the only blocker. The design artifact (`landing-page.html` + `landing-page-plan.md`) at `/home/mahdi.najafzadeh/.local/src/open-design/.od/projects/f98bda8b-bd14-40ba-ab2e-c2d69e0c0fd8/` is the canonical structural reference. `DESIGN.md` is the single source of truth for tokens.

## Goals / Non-Goals

**Goals:**

- Replace `src/app/(app)/page.tsx` with a server component that renders the seven locked sections in order.
- Fetch all five data sources (`products` ×2, `categories`, `brands`, `site-settings`) in one `Promise.all`.
- Keep the existing `(app)/layout.tsx` topnav + footer untouched; the home page is a child of that layout.
- Bind every visible style to `DESIGN.md` tokens; no ad-hoc hex/px outside the `:root` block.
- Provide keyboard/screen-reader accessibility and a no-FOUC theme toggle.

**Non-Goals:**

- No new routes. No collection/global schema changes. No `popular: boolean` field on `Products` (proxy with `inventory` per the plan; future change can add the field).
- No new dependencies. No new shadcn/beui installs (search returns no animated component needed for a static landing page).
- No image sourcing pipeline. Product images already come from Payload Media; placeholders rendered when missing.
- No bilingual infrastructure. Single-language Farsi site per the locked design decision.
- No redesign of the topnav or footer. They are already styled and live in `(app)/layout.tsx`.

## Decisions

### 1. Server component, single data fetch, no client islands

`src/app/(app)/page.tsx` stays a React Server Component. All five Payload reads run in `Promise.all` at the top, then sections render synchronously from the results. No `"use client"` islands inside the page itself.

- **Rationale**: matches the existing pattern in `src/app/(app)/layout.tsx:32` and `src/app/(app)/products/page.tsx`. Avoids shipping unnecessary JS to the client; Payload Local API is server-only.
- **Alternative considered**: ISR with `revalidate = 300`. Skipped — content edits via Payload admin already invalidate the cache through Payload's revalidation hooks wired in the broader implementation; landing-page data does not change faster than a deployment, and SSR on every request is cheap (five indexed reads).

### 2. One small client component for the theme toggle

`src/components/layout/ThemeToggle.tsx` is a single client component that owns the dark-mode click handler and `aria-pressed` sync. The pre-paint script that reads `localStorage` and sets `data-theme` on `<html>` is injected through `next/script` with `strategy="beforeInteractive"` in `(app)/layout.tsx` so it runs before the body renders.

- **Rationale**: keeps the page itself server-rendered, isolates the one piece that needs interactivity, and prevents FOUC by running before the first paint. The `next-themes` library (already in `package.json`) was considered but rejected: it does not run a synchronous pre-paint script, so it cannot prevent the flash on a hard reload.
- **Alternative considered**: hand-rolled inline `<script>` directly in the JSX. Rejected — Next.js App Router discourages raw `<script>` tags in server components (they trigger a hydration warning). `next/script` is the idiomatic escape hatch.

### 3. Card components co-located under `src/components/home/`

The four small components — `CategoryCard.tsx`, `ProductCard.tsx`, `CatRow.tsx`, `SectionHead.tsx` — live in `src/components/home/`. Each is a pure presentational server component receiving a typed Payload doc and an optional href. The product card matches the markup already shipped in `src/app/(app)/products/page.tsx:287` so the two pages feel identical.

- **Rationale**: shared shape between listing and home makes future style tweaks a one-file change. Co-locating keeps the home-page folder easy to delete or refactor.
- **Alternative considered**: pull from `lucide-react` icons for the category monograms. Rejected — the plan locks the monogram to the first character of the name rendered in a circular stage, which is already an established pattern in `(app)/layout.tsx:90` for the brand mark. Reusing that visual language beats introducing icons.

### 4. CSS ported to `src/app/globals.css` with token substitution, not class-for-class copy

The bespoke CSS in `landing-page.html` lines 41–275 is ported into `src/app/globals.css` inside a single `@layer components { ... }` block. Tokens (`--bg`, `--fg`, `--surface`, etc.) keep their original names because the existing topnav/footer in `(app)/layout.tsx` already reference the same hex values via Tailwind utilities (`bg-[#ffffff]`, `text-[#111111]`, etc.) — so naming consistency avoids drift.

- **Rationale**: the page-specific class names (`.hero`, `.category-card`, `.cat-row`, etc.) are bespoke and would otherwise pollute Tailwind's utility namespace. The `@layer components` block scopes them and lets Tailwind utilities win when both apply.
- **Alternative considered**: convert every bespoke class to Tailwind utilities inline. Rejected — the responsive grid + hover behaviors are dense and a 250-line class block is more maintainable than 250 utility tokens per section.

### 5. Skip `popular` schema change; sort by `inventory` desc

Until a future change adds `popular: boolean` to the Products collection (and the spec delta to back it), the popular section uses `sort: '-inventory'` as a proxy heuristic. The spec notes this is a placeholder.

- **Rationale**: avoids a collection schema change in this change. A follow-up can add the field, regenerate `payload-types.ts`, and switch the sort key in one line.
- **Alternative considered**: track popularity client-side via localStorage. Rejected — server-rendered sections cannot access client state; requires a client island for no benefit over `inventory`.

### 6. Footer and topnav stay in `(app)/layout.tsx`

The plan's section list counts 8 sections (topnav + footer), but topnav and footer are already implemented in `(app)/layout.tsx`. The home page implementation touches only the body between them — the design's `data-od-id` audit list is informational, not a refactor scope.

- **Rationale**: avoids duplicating chrome markup, keeps the auth links / cart icon / mobile nav in one place. Adding `<ThemeToggle />` to that layout's right-cluster is the only layout edit required.
- **Alternative considered**: pull topnav/footer into the home page. Rejected — they belong in the layout because every other route in `(app)` reuses them.

### 7. Empty-state fallback is "render what exists"

If a collection is empty, the corresponding section is omitted entirely (no skeleton, no placeholder card). If the section has fewer than its max (4 products, 3 categories), it renders the available count. This matches the acceptance check "no invented metrics — all numbers from Payload or removed".

- **Rationale**: keeps the page honest. Zero-mock-data rule from the design plan.
- **Alternative considered**: skeleton loaders. Rejected — the page is SSR with no streaming, so a skeleton would flash only on slow DB reads; Payload Local API on SQLite is fast enough to skip that.

### 8. Use existing `Card` / `Badge` from shadcn for product card

The product card visually matches the listing at `src/app/(app)/products/page.tsx:287`, which already uses `<Card>` from `src/components/ui/card.tsx`. Reusing it makes the home page feel native to the listing.

- **Rationale**: visual continuity. A bespoke product card would diverge from the listing within one release.
- **Alternative considered**: bespoke `<article class="product">`. Rejected — would require CSS duplicate and visual drift.

### 9. No image generation pipeline

The `landing-page-plan.md` "Image acquisition" section lists three options for replacing `.ph-img` placeholders. This change does not pick one. If real product photos are missing, the card renders a labeled stage reading "تصویر محصول" (Farsi) at the 1:1 product stage.

- **Rationale**: out of scope for the implementation change. Image acquisition is a content/admin task, not a code task.
- **Alternative considered**: SVG icon placeholders. Skipped — the design's `.ph-img` already says "Product photo / 1:1 square" in English; switching copy to Farsi is the minimum change.

## Risks / Trade-offs

- **Inventory-as-popularity heuristic** → when all products have `inventory: 0`, the popular section is omitted (per spec). Acceptable for the current catalog but documented as a placeholder. Add a `popular: boolean` field in a follow-up change.
- **Tailwind + bespoke CSS coexistence** → class-name collisions if the bespoke `.btn` (used in `landing-page.html` lines 141–151) clashes with anything Tailwind already provides. Mitigation: keep the bespoke classes under `@layer components` and named with a `home-` prefix on risky ones (e.g. `.home-btn-primary`).
- **Pre-paint script and React hydration** → the inline script in `<head>` mutates `<html data-theme>` before React mounts. React 19 in App Router tolerates this without hydration warnings because the attribute is on `<html>`, which React does not own server-side in App Router. Verified pattern in `next-themes` docs. Mitigation: if hydration warning appears, fall back to `suppressHydrationWarning` on `<html>` in `(app)/layout.tsx:70`.
- **No skeleton loading** → during Payload DB hiccups, the page can render fully empty (only hero + static chrome). Mitigation: log to console; future change can add `Suspense` boundaries per section.
- **`@layer components` overrides** → if Tailwind v4 cascades the wrong way, bespoke classes might lose specificity to utilities. Mitigation: place the block after Tailwind imports in `globals.css` and use `@layer components` (which sits below `@layer utilities`).
- **Image domain allowlist** → product images served from Payload's Media collection may live on the same origin (Next.js Image default) or a remote CDN. If remote, `next.config.ts` `images.remotePatterns` must include the Payload Media host. Mitigation: check `next.config.ts` before implementation; if missing, add the Payload host.
- **beui / shadcn not actually needed** → this change imports neither, but the design.md rule says to check. Mitigation: documented decision above (no animated components needed for a static landing page).

## Skills Consulted

- `.agents/skills/payload/SKILL.md` — Local API access patterns (`payload.find`, `payload.findGlobal`), depth/depth considerations for relationships.
- `.agents/skills/shadcn/SKILL.md` — existing `<Card>`, `<Badge>` primitives in `src/components/ui/` reused for the product card.
- `.agents/skills/beui/SKILL.md` — searched for landing-page / hero / product-grid animated components; none required, decision to ship static markup.
- `DESIGN.md` (root) — bound every color, typography, spacing, radius to token paths; checked against the existing `(app)/layout.tsx` for consistency.