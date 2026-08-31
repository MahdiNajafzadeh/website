# Collection Category

## Purpose

This spec defines the behavior and management of product categories in the e‑commerce platform.

## Requirements

### Requirement: Category Listing

The system MUST display a list of all available categories. Each category item MUST show the category name.

#### Scenario: View all categories

- **GIVEN** At least one category exists in the system
- **WHEN** The user navigates to the categories section (e.g., sidebar on products page)
- **THEN** All categories are displayed
- **AND** Each category shows its name

#### Scenario: Empty category list

- **GIVEN** No categories have been created yet
- **WHEN** The user views the categories section
- **THEN** The categories section is empty or hidden
- **AND** No error occurs

### Requirement: Product Filter by Category

The system SHALL allow users to filter the product listing by selecting a category.

#### Scenario: Filter products by category

- **GIVEN** The user is on the products page
- **AND** At least one category exists with associated products
- **WHEN** The user clicks on a category filter
- **THEN** The product list updates to show only products of that category
- **AND** The category filter remains visible for further refinement

#### Scenario: Clear category filter

- **GIVEN** The product list is already filtered by a category
- **WHEN** The user removes the category filter
- **THEN** All products are displayed again

### Requirement: Category Detail Page

The system MUST provide a dedicated page for each category showing its name, description, and all related products.

#### Scenario: View category details

- **GIVEN** A specific category exists (e.g., category slug “plumbing”)
- **WHEN** The user navigates to `/categories/plumbing` (if implemented) or views category-filtered products
- **THEN** The category name and description are displayed
- **AND** All products belonging to that category are listed

#### Scenario: Non‑existent category

- **GIVEN** No category exists with the given slug
- **WHEN** The user tries to view that category
- **THEN** The system returns a 404 Not Found page

### Requirement: Category Management (Admin)

Administrators and employees MUST be able to create, update, and delete categories via the admin panel.

#### Scenario: Create a new category

- **GIVEN** An authenticated admin user is in the category creation form
- **WHEN** The user fills in the name and submits
- **THEN** The category is saved in the database
- **AND** The category appears in the category list on the frontend

#### Scenario: Update an existing category

- **GIVEN** An authenticated admin user is editing a category
- **WHEN** The user changes the category name or description and saves
- **THEN** The category information is updated
- **AND** The changes are reflected on the frontend

#### Scenario: Delete a category

- **GIVEN** An authenticated admin user views a category
- **WHEN** The user deletes the category
- **THEN** The category is removed from the database
- **AND** Any associated products remain but their category field is cleared or set to null

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
