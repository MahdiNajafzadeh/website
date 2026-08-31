## ADDED Requirements

### Requirement: Order flow under (app) with Payload hooks and DESIGN tokens

Checkout at `src/app/(app)/checkout/page.tsx`, order confirmation, and `src/app/(app)/orders/page.tsx` SHALL live under `src/app/(app)` using `shadcn` Form/Card/Table and verified `beui` components, styled with `{colors.ink}`, `{colors.canvas}`, `{colors.hairline}`, `{typography.button-md}`, `{rounded.lg}`. Payload `orders` collection SHALL enforce status lifecycle, zero-price review flag, total calculation, and snapshot via hooks/access per payload skill. Tooling uses `bun`.

#### Scenario: Checkout creates order via Payload
- **WHEN** an authenticated customer submits checkout at `src/app/(app)/checkout/page.tsx`
- **THEN** a Payload `orders` document is created with status `review`, total computed as sum of `price*quantity`, and cart cleared, all run via `bun` scripts

#### Scenario: Order history renders under (app)
- **WHEN** a customer navigates to `/orders` via `src/app/(app)/orders/page.tsx`
- **THEN** orders list uses `shadcn` Table with `{typography.body-md}` and status badges using `{colors.sale}`/`{colors.success}` as appropriate
