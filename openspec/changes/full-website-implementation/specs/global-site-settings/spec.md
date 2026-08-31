## ADDED Requirements

### Requirement: Site settings global under (app) header/footer with DESIGN tokens

The `site-settings` Payload global (branding, contact, social, partner discount) per payload skill SHALL back `src/app/(app)/layout.tsx` header/footer and `src/app/(app)/contact/page.tsx`. UI SHALL use `shadcn` components and verified `beui` elements, styled with `{colors.ink}`, `{colors.canvas}`, `{colors.soft-cloud}`, `{colors.hairline}`, `{typography.heading-md}`, `{typography.caption-md}`, `{rounded.full}`. Access remains admin-only; frontend reads are public.

#### Scenario: Header/footer consume site-settings
- **WHEN** `src/app/(app)/layout.tsx` renders
- **THEN** site name/logo from `site-settings` appears in header with `{typography.heading-md}` and footer shows primary phone/email with `{colors.mute}` labels

#### Scenario: Partner discount edit restricted
- **WHEN** an employee tries to edit `site-settings` partner discount via Payload admin
- **THEN** the request is denied (403) while admin succeeds, validated via `bunx --bun vitest` access test
