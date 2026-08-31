## ADDED Requirements

### Requirement: Contact page under (app) with site-settings and DESIGN tokens

`src/app/(app)/contact/page.tsx` (`/contact`) SHALL be a server component under `src/app/(app)` reading all `site-settings` contact arrays (phones, emails, addresses, social links). UI SHALL use `shadcn` Card/Badge and verified `beui` components, styled with `{colors.ink}`, `{colors.soft-cloud}`, `{colors.mute}`, `{typography.heading-xl}`, `{typography.body-md}`, `{rounded.lg}`, `{spacing.lg}`. Tel/mailto links, badges for primary entries, and response notice from base spec are preserved.

#### Scenario: Contact page renders all site-settings channels
- **WHEN** a user navigates to `/contact` via `src/app/(app)/contact/page.tsx` with full site-settings
- **THEN** phones render with `tel:` links, emails with `mailto:` links, addresses with labels, and social links open in new tab, each card using `{colors.canvas}` and `{rounded.lg}`

#### Scenario: Partial/empty contact handled gracefully
- **WHEN** site-settings has only phones or is empty and `/contact` is visited
- **THEN** only available sections render (or friendly empty state), with no thrown errors, styled via `{colors.mute}`
