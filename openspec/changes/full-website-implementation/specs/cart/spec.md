## ADDED Requirements

### Requirement: Cart UI under (app) with shadcn/beui and DESIGN tokens

Cart sheet, dedicated page `src/app/(app)/cart/page.tsx` (`/cart`), header badge, and checkout trigger SHALL live under `src/app/(app)` using `shadcn` Sheet/Card/Button and `@beui` animated components where registry search shows coverage. Styling SHALL use `{colors.ink}`, `{colors.soft-cloud}`, `{colors.mute}`, `{typography.button-md}`, `{typography.body-strong}`, `{rounded.full}`, `{spacing.md}`. Persistence (localStorage) and total/badge logic from base spec are unchanged.

#### Scenario: Cart sheet opens from (app) header
- **WHEN** a user clicks the cart icon in `src/app/(app)/layout.tsx` header
- **THEN** a `shadcn` Sheet slides from the side using `{colors.canvas}` and `{rounded.lg}`, lists items with quantity controls, and footer total uses `{typography.body-strong}`

#### Scenario: Cart page at (app)/cart reflects same store
- **WHEN** a user navigates to `/cart` via `src/app/(app)/cart/page.tsx`
- **THEN** the same cart store renders items with `{spacing.md}` gaps and `Proceed to Checkout` uses `{component.button-primary}`
