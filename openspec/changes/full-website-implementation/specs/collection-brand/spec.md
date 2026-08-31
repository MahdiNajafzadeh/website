## ADDED Requirements

### Requirement: Brand pages under (app) with Payload collection and DESIGN tokens

Brand listing and `src/app/(app)/brands/[slug]/page.tsx` (`/brands/[slug]`) SHALL be implemented under `src/app/(app)` reading the `brands` Payload collection (per payload skill at `.agents/skills/payload/SKILL.md`). UI SHALL use `shadcn` Card/Badge and verified `beui` components, styled with `{colors.ink}`, `{colors.soft-cloud}`, `{colors.hairline}`, `{typography.heading-lg}`, `{rounded.lg}`. Filtering behavior from base spec is preserved.

#### Scenario: Brand listing under (app)
- **WHEN** a user navigates to `/brands` via `src/app/(app)/brands/page.tsx`
- **THEN** brands render as cards with `{rounded.lg}` and `{colors.canvas}` using data from Payload `brands` collection

#### Scenario: Brand detail filters products
- **WHEN** a user navigates to `/brands/[slug]` via `src/app/(app)/brands/[slug]/page.tsx`
- **THEN** the page shows brand header with `{typography.heading-lg}` and product grid filtered by brand
