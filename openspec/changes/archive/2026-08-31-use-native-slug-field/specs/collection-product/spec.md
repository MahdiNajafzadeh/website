## ADDED Requirements

### Requirement: Product Slug

The system MUST generate a URL-friendly `slug` for every product, derived from the product's `name` field. The `slug` SHALL be unique across the `products` collection, indexed, required, and SHALL be used as the public URL identifier (`/products/[slug]`). The slug MUST be validated to contain only lowercase URL-safe characters.

The slug field MUST be rendered in the admin panel as Payload's native `SlugField`: locked by default with a lock/unlock button, and exposing a "generate" button when unlocked that re-runs the slugify function against the product's current `name` value. Once a slug is set on a product, the system MUST NOT regenerate it automatically when `name` is later edited; the editor MUST click the generate button (or unlock and edit) to change the slug.

When a product is created without a `name`, the system MUST auto-assign a fallback slug of the form `products-<N>` where `<N>` is the lowest positive integer that yields a unique slug across the collection. The fallback slug SHALL be presented to the editor in the admin panel just like any other slug and is editable like any other slug.

#### Scenario: Slug auto-generated from name on create

- **WHEN** An admin creates a product with name "Copper Pipe 1m" and saves without manually entering a slug
- **THEN** The system stores slug `copper-pipe-1m`
- **AND** The product detail page is accessible at `/products/copper-pipe-1m`

#### Scenario: Slug remains stable when name changes

- **GIVEN** A product exists with name "Copper Pipe 1m" and slug `copper-pipe-1m`
- **WHEN** The admin edits the name to "Premium Copper Pipe 1m" and saves without clicking the generate button or unlocking the slug field
- **THEN** The slug remains `copper-pipe-1m`
- **AND** The existing URL `/products/copper-pipe-1m` continues to resolve to the product

#### Scenario: Editor regenerates slug from updated name

- **GIVEN** A product exists with name "Copper Pipe 1m" and slug `copper-pipe-1m`
- **WHEN** The admin edits the name to "Premium Copper Pipe 1m", unlocks the slug field, clicks the generate button, and saves
- **THEN** The slug becomes `premium-copper-pipe-1m`

#### Scenario: Duplicate slug is rejected

- **GIVEN** A product exists with slug `copper-pipe-1m`
- **WHEN** An admin attempts to create or update another product to have slug `copper-pipe-1m`
- **THEN** The system rejects the operation with a uniqueness error
- **AND** No product is saved with a duplicate slug

#### Scenario: Fallback slug assigned when name is empty on create

- **GIVEN** No product exists with slug `products-1`
- **WHEN** An admin creates a product with an empty name and saves
- **THEN** The system stores slug `products-1`
- **AND** The save succeeds without a validation error