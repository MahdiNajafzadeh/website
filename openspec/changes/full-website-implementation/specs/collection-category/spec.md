## ADDED Requirements

### Requirement: Category pages under (app) with Payload collection and DESIGN tokens

Category listing/filter and `src/app/(app)/categories/[slug]/page.tsx` (`/categories/[slug]`) SHALL live under `src/app/(app)` reading the `categories` Payload collection. UI SHALL use `shadcn` components and `beui` where applicable, styled with `{colors.ink}`, `{colors.soft-cloud}`, `{typography.heading-md}`, `{rounded.full}` for pills, and `{spacing.sm}`. Base filtering/detail behavior is unchanged.

#### Scenario: Category filter pills use token styling
- **WHEN** a user views the products page at `src/app/(app)/products/page.tsx`
- **THEN** category pills use `{colors.soft-cloud}` background, `{rounded.full}` radius, and `{typography.caption-md}`

#### Scenario: Category detail under (app)
- **WHEN** a user navigates to `/categories/[slug]` via `src/app/(app)/categories/[slug]/page.tsx`
- **THEN** the category name uses `{typography.heading-lg}` and products are filtered by category via Payload query
