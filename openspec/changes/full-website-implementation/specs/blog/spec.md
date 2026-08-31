## ADDED Requirements

### Requirement: Blog routes use (app) group with shadcn/beui and DESIGN tokens

Blog listing at `src/app/(app)/blog/page.tsx` (`/blog`) and detail at `src/app/(app)/blog/[slug]/page.tsx` (`/blog/[slug]`) SHALL be server components using `shadcn` Card/Pagination and resolved `beui` components (verified via `bunx --bun shadcn@latest search` / `https://beui.dev/r/registry.json`). Styling SHALL use `DESIGN.md` tokens `{colors.ink}`, `{colors.soft-cloud}`, `{colors.hairline}`, `{typography.heading-xl}`, `{typography.body-md}`, `{rounded.lg}`, `{spacing.lg}`. Lexical rendering and SEO/sitemap/RSS behaviors from the base spec remain unchanged.

#### Scenario: Blog listing renders via (app) with token styling
- **WHEN** a visitor navigates to `/blog` served by `src/app/(app)/blog/page.tsx`
- **THEN** cards use `{colors.canvas}` background, `{rounded.lg}` radius, `{typography.body-md}` for excerpts, and pagination uses `shadcn` Pagination with `{colors.ink}` active state

#### Scenario: Detail page preserves Lexical and SEO under (app)
- **WHEN** a visitor navigates to `/blog/[slug]` via `src/app/(app)/blog/[slug]/page.tsx`
- **THEN** content is rendered with `@payloadcms/richtext-lexical` RichText, headings use `{typography.heading-xl}`, and Open Graph/canonical from base spec are emitted
