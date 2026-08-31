## ADDED Requirements

### Requirement: Brand Slug

The system MUST generate a URL-friendly `slug` for every brand, derived from the brand's `name` field. The `slug` SHALL be unique across the `brands` collection, indexed, required, and SHALL be used as the public URL identifier (`/brands/[slug]`). The slug MUST be validated to contain only lowercase URL-safe characters.

The slug field MUST be rendered in the admin panel as Payload's native `SlugField`: locked by default with a lock/unlock button, and exposing a "generate" button when unlocked that re-runs the slugify function against the brand's current `name` value. Once a slug is set on a brand, the system MUST NOT regenerate it automatically when `name` is later edited; the editor MUST click the generate button (or unlock and edit) to change the slug.

When a brand is created without a `name`, the system MUST auto-assign a fallback slug of the form `brands-<N>` where `<N>` is the lowest positive integer that yields a unique slug across the collection. The fallback slug SHALL be presented to the editor in the admin panel just like any other slug and is editable like any other slug.

#### Scenario: Slug auto-generated from name on create

- **WHEN** An admin creates a brand with name "Acme Co" and saves without manually entering a slug
- **THEN** The system stores slug `acme-co`
- **AND** The brand detail page is accessible at `/brands/acme-co`

#### Scenario: Slug remains stable when name changes

- **GIVEN** A brand exists with name "Acme Co" and slug `acme-co`
- **WHEN** The admin edits the name to "Acme Inc" and saves without clicking the generate button or unlocking the slug field
- **THEN** The slug remains `acme-co`
- **AND** The existing URL `/brands/acme-co` continues to resolve to the brand

#### Scenario: Editor regenerates slug from updated name

- **GIVEN** A brand exists with name "Acme Co" and slug `acme-co`
- **WHEN** The admin edits the name to "Acme Inc", unlocks the slug field, clicks the generate button, and saves
- **THEN** The slug becomes `acme-inc`

#### Scenario: Duplicate slug is rejected

- **GIVEN** A brand exists with slug `acme-co`
- **WHEN** An admin attempts to create or update another brand to have slug `acme-co`
- **THEN** The system rejects the operation with a uniqueness error
- **AND** No brand is saved with a duplicate slug

#### Scenario: Fallback slug assigned when name is empty on create

- **GIVEN** No brand exists with slug `brands-1`
- **WHEN** An admin creates a brand with an empty name and saves
- **THEN** The system stores slug `brands-1`
- **AND** The save succeeds without a validation error
- **AND** The admin can later edit the brand, fill in a name, unlock the slug field, click generate, and the slug updates to a derived value