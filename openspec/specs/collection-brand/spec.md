# Collection Brand

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

