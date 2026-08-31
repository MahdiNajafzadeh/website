## ADDED Requirements

### Requirement: Product pages under (app) with Payload collection and DESIGN tokens

`src/app/(app)/products/page.tsx` (`/products`) and `src/app/(app)/products/[slug]/page.tsx` (`/products/[slug]`) SHALL live under `src/app/(app)` reading the `products` Payload collection. UI SHALL use `shadcn` Card/Badge/Input and `@beui` gallery/slider where registry confirms coverage, styled with `{colors.ink}`, `{colors.soft-cloud}`, `{colors.mute}`, `{colors.sale}`, `{typography.heading-xl}`, `{typography.body-md}`, `{rounded.lg}`. Visibility, price, inventory, brand/category relations, images, search, and filter from base spec are preserved.

#### Scenario: Product grid uses token styling
- **WHEN** a user navigates to `/products` via `src/app/(app)/products/page.tsx`
- **THEN** product cards show name with `{typography.body-strong}`, price with `{typography.caption-md}`, and sale price uses `{colors.sale}` where applicable

#### Scenario: Product detail respects inventory and visibility
- **WHEN** a visible product with inventory>0 is viewed at `/products/[slug]`
- **THEN** `Add to Cart` uses `{component.button-primary}` and is enabled; zero-inventory shows `{colors.mute}` "ناموجود" label per spec
