## ADDED Requirements

### Requirement: Customer type pricing surfaces under (app) with DESIGN tokens

Pricing display for `regular` vs `partner` (global discount from `site-settings`) SHALL be implemented in `src/app/(app)/products/**` and `src/app/(app)/cart/**` server/client components. UI SHALL use `{colors.ink}`, `{colors.sale}`, `{typography.body-strong}`, `{typography.caption-sm}` for strikethrough original price and `{colors.success}` badge for discount. Logic reads `site-settings` global and `users.customerType`.

#### Scenario: Partner price rendered with tokens
- **WHEN** a partner customer views a product at `src/app/(app)/products/[slug]/page.tsx` with global discount 10% and standard price 100,000
- **THEN** the component shows 90,000 with `{typography.body-strong}`, original 100,000 strikethrough with `{colors.mute}`, and "10% تخفیف" badge using `{colors.sale}`

#### Scenario: Pricing applied at checkout
- **WHEN** a partner customer checks out via `src/app/(app)/checkout/page.tsx`
- **THEN** cart totals and order snapshot use discounted prices, verified by `bunx --bun vitest` unit test
