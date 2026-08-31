# Collection Brand

## Purpose

This spec defines the behavior and management of product brands in the e‑commerce platform.

## Requirements

### Requirement: Brand Listing

The system MUST display a list of all active brands. Each brand item MUST show the brand name and its icon.

#### Scenario: View all brands

- **GIVEN** At least one brand exists in the system
- **WHEN** The user navigates to the brands page
- **THEN** All brands are displayed in the configured sort order
- **AND** Each brand shows its name and icon

#### Scenario: Empty brand list

- **GIVEN** No brands have been created yet
- **WHEN** The user navigates to the brands page
- **THEN** A friendly empty-state message is displayed
- **AND** No error occurs

### Requirement: Brand Detail Page

The system MUST provide a dedicated page for each brand showing its name, icon, description, and all related products.

#### Scenario: View brand details

- **GIVEN** A specific brand exists (e.g., brand slug “brand‑x”)
- **WHEN** The user navigates to `/brands/brand‑x`
- **THEN** The brand name, icon, and description are displayed
- **AND** All products belonging to that brand are listed below
- **AND** Product count is displayed

#### Scenario: Non‑existent brand

- **GIVEN** No brand exists with the given slug
- **WHEN** The user navigates to `/brands/unknown-brand`
- **THEN** The system returns a 404 Not Found page

### Requirement: Product Filter by Brand

The system SHALL allow users to filter the product listing by selecting a brand.

#### Scenario: Filter products by brand

- **GIVEN** The user is on the products page
- **AND** At least one brand exists with associated products
- **WHEN** The user clicks on a brand filter
- **THEN** The product list updates to show only products of that brand
- **AND** The brand filter remains visible for further refinement

#### Scenario: Clear brand filter

- **GIVEN** The product list is already filtered by a brand
- **WHEN** The user removes the brand filter
- **THEN** All products are displayed again

### Requirement: Brand Management (Admin)

`admin` and `employee` MUST be able to create, update, and delete brands via the admin panel.

#### Scenario: Create a new brand

- **GIVEN** An authenticated admin user is in the brand creation form
- **WHEN** The user fills in the name, uploads an icon, and submits
- **THEN** The brand is saved in the database
- **AND** The brand appears in the brand list on the frontend

#### Scenario: Update an existing brand

- **GIVEN** An authenticated admin user is editing a brand
- **WHEN** The user changes the brand name or icon and saves
- **THEN** The brand information is updated
- **AND** The changes are reflected on the frontend

#### Scenario: Delete a brand

- **GIVEN** An authenticated admin user views a brand
- **WHEN** The user deletes the brand
- **THEN** The brand is removed from the database
- **AND** Any associated products remain but their brand field is cleared or set to null

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
