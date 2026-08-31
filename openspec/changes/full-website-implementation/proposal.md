## Why

All 14 domain specs in `openspec/specs/` (auth, blog, collection-*, customer, global, pages, roles, users) are fully specified but zero implementation exists beyond the Payload starter (`Users`+`Media`). No storefront, no access control, no checkout, and no SEO surfaces are shippable. Implementing now unblocks vertical integration testing and content authoring against the real schema and design system.

## What Changes

- **Payload data layer**: Extend `src/payload.config.ts` with collections `products`, `brands`, `categories`, `posts`, `orders` and globals `site-settings`, `page-about` (plus contact backing via `site-settings`), applying field definitions, validation, and `access`/`hooks` from specs. Update `src/collections/` structure, regenerate `payload-types.ts` via `bun run generate:types`.
- **Auth & RBAC**: Implement `role` (`admin`/`employee`/`customer`) and user fields (firstName, lastName, phone as login, `customerType`), mobile-format validation (`09xxxxxxxxx`), session expiry 24h, and RBAC rules per `role` and `global-site-settings` specs. Payload skill at `.agents/skills/payload/SKILL.md` will be loaded before any collection/global design.
- **Frontend app under `src/app/(app)`**: Build all public UI exclusively under `src/app/(app)` (route group) — never `src/app/` root or `src/app/(payload)` which is reserved for Payload admin/api. Routes: `/` (home with DESIGN.md Nike tokens), `/products`, `/products/[slug]`, `/brands`, `/brands/[slug]`, `/categories/[slug]`-compatible, `/blog` + `/blog/[slug]`, `/cart`, `/checkout`, `/orders`, `/contact`, `/about`, `/account`, plus `/sitemap.xml`, `/robots.txt`, `/blog/rss.xml`.
- **UI system**: All UI uses `shadcn` (`shadcn@latest` via `bunx --bun shadcn@latest`) and `beui` registry (`@beui/*` via `bunx --bun shadcn@latest add @beui/<slug>`). Components will be resolved via `bunx --bun shadcn@latest search` and `curl -fsS https://beui.dev/r/registry.json` before custom code; no bespoke widgets where registry covers it.
- **Design governance**: Every color, typography, spacing, radius, and component spec comes from `DESIGN.md` (front matter + prose) via token paths (`{colors.ink}`, `{colors.sale}`, `{typography.display-campaign}`, `{typography.button-md}`, `{rounded.full}`, `{component.button-primary}`, etc.). No ad-hoc hex/px. Changes to `DESIGN.md` are linted with `bunx @google/design.md lint DESIGN.md`. Skills loaded before UI work: `.agents/skills/beui/SKILL.md` and `.agents/skills/shadcn/SKILL.md`.
- **Cart & checkout**: Client cart store with persistence (localStorage), badge, sheet + `/cart` page, quantity/undo, total calculation, partner-vs-regular pricing via `site-settings` discount, clear-on-checkout semantics.
- **Blog & SEO**: Lexical rich-text rendering (`@payloadcms/richtext-lexical` `RichText`), pagination (12/page), `published` gating, sitemap/RSS/robots, Open Graph/canonical, SSR/ISR with revalidation hooks.
- **Tooling**: `bun` is the ONLY runner/manager (`bun install`, `bun run dev`, `bun run build`, `bunx --bun shadcn@latest ...`, `bunx --bun vitest`, `bunx --bun playwright`). No `npm/pnpm/npx/yarn`.

## Capabilities

### New Capabilities
- No new capability paths — all required capabilities already have ratified specs in `openspec/specs/`. This change is implementation-only against those specs.

### Modified Capabilities
- `auth`: login/logout/session-expiry/public-access + post-login redirects — behavior implemented as specified, no requirement text change.
- `blog`: listing, detail, Lexical rendering, SEO, sitemap/RSS, breadcrumb, visibility, a11y, ISR — implemented verbatim.
- `cart`: add/view/update/remove/persist/totals/badge/clear/feedback — implemented.
- `collection-brand`: listing, detail, filter, admin CRUD — implemented.
- `collection-category`: listing, filter, detail, admin CRUD — implemented.
- `collection-order`: creation, status lifecycle (`review`→`approved`→`preparing`→`delivered`/`cancelled`), zero-price review, totals, snapshot, history, employee mgmt, notes, notifications — implemented.
- `collection-post`: posts collection (`name`, `slug`, `content` Lexical, `published`, `coverImage`, `excerpt`, timestamps, access) — implemented.
- `collection-product`: name, visibility, price, inventory, brand/category relations, images, search, filter, admin CRUD — implemented.
- `customer`: `regular`/`partner` types, admin management, discount pricing, checkout totals — implemented.
- `global-site-settings`: branding, contact, social, access, footer/header display — implemented.
- `page-about`: `/about` display, admin management, breadcrumb, metadata, a11y — implemented.
- `page-contract`: `/contact` display, phone/email/address/social sub-requirements, breadcrumb, metadata, response notice — implemented.
- `role`: `admin`/`employee`/`customer` RBAC matrix — implemented.
- `user`: registration fields, unique phone, phone auth, format validation, address for checkout, profile display — implemented.

> Each entry above maps 1:1 to `openspec/specs/<capability>/spec.md`. Deltas in `specs/` will be `ADDED` clarifications only where implementation reveals ambiguity; no requirement weakening.

## Impact

- **Code**: `src/payload.config.ts`, `src/collections/*`, `src/globals/*`, `src/app/(app)/**/*`, `src/components/**`, `src/lib/**`, `payload-types.ts`, `DESIGN.md` (consumed, not rewritten), sitemap/robots/RSS handlers, middleware for auth redirects.
- **APIs**: Payload REST `/api/*` access rules tightened (published-only public reads, RBAC writes); frontend `fetch` with `where[published][equals]=true` filtering; revalidation hooks (`revalidatePath`/`revalidateTag`).
- **Dependencies**: No new runtime deps beyond existing `payload@3.88`, `@payloadcms/richtext-lexical@3.88`, `@payloadcms/db-sqlite`, `next@16.3.3`, `sharp`. UI deps added only via `bunx --bun shadcn@latest add @beui/<slug>`. `bun` required.
- **Systems**: SQLite via `DATABASE_URL`, `PAYLOAD_SECRET` session config (24h), ISR cache, sitemap crawler surface.
- **Breaking**: None — greenfield implementation against frozen specs. Existing `users`/`media` extended, not removed (**BREAKING** only if `users.email` auth is replaced by `phone`; migration script and dual-auth fallback will be gated).
