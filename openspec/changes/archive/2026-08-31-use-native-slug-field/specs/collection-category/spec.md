## ADDED Requirements

### Requirement: Category Slug

The system MUST generate a URL-friendly `slug` for every category, derived from the category's `name` field. The `slug` SHALL be unique across the `categories` collection, indexed, required, and SHALL be used as the public URL identifier (`/categories/[slug]`, currently routed under `/products?category=<slug>`). The slug MUST be validated to contain only lowercase URL-safe characters.

The slug field MUST be rendered in the admin panel as Payload's native `SlugField`: locked by default with a lock/unlock button, and exposing a "generate" button when unlocked that re-runs the slugify function against the category's current `name` value. Once a slug is set on a category, the system MUST NOT regenerate it automatically when `name` is later edited; the editor MUST click the generate button (or unlock and edit) to change the slug.

When a category is created without a `name`, the system MUST auto-assign a fallback slug of the form `categories-<N>` where `<N>` is the lowest positive integer that yields a unique slug across the collection. The fallback slug SHALL be presented to the editor in the admin panel just like any other slug and is editable like any other slug.

#### Scenario: Slug auto-generated from name on create

- **WHEN** An admin creates a category with name "Plumbing" and saves without manually entering a slug
- **THEN** The system stores slug `plumbing`
- **AND** The category is usable as a filter on `/products?category=plumbing`

#### Scenario: Slug remains stable when name changes

- **GIVEN** A category exists with name "Plumbing" and slug `plumbing`
- **WHEN** The admin edits the name to "Plumbing & Heating" and saves without clicking the generate button or unlocking the slug field
- **THEN** The slug remains `plumbing`
- **AND** The existing URL `/products?category=plumbing` continues to resolve to filtered products

#### Scenario: Editor regenerates slug from updated name

- **GIVEN** A category exists with name "Plumbing" and slug `plumbing`
- **WHEN** The admin edits the name to "Plumbing & Heating", unlocks the slug field, clicks the generate button, and saves
- **THEN** The slug becomes `plumbing-heating`

#### Scenario: Duplicate slug is rejected

- **GIVEN** A category exists with slug `plumbing`
- **WHEN** An admin attempts to create or update another category to have slug `plumbing`
- **THEN** The system rejects the operation with a uniqueness error
- **AND** No category is saved with a duplicate slug

#### Scenario: Fallback slug assigned when name is empty on create

- **GIVEN** No category exists with slug `categories-1`
- **WHEN** An admin creates a category with an empty name and saves
- **THEN** The system stores slug `categories-1`
- **AND** The save succeeds without a validation error