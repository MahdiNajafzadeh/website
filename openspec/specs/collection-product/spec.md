# Collection Product

This spec defines the behavior and management of products in the e‑commerce platform.

## Requirements

### Requirement: Product Name

The system MUST require a name for every product. Products without a name cannot be created.

#### Scenario: Create product with name

- **GIVEN** An authenticated admin user is creating a product
- **WHEN** The user fills in the product name and submits the form
- **THEN** The product is saved successfully

#### Scenario: Cannot create product without name

- **GIVEN** An authenticated admin user is creating a product
- **WHEN** The user submits the form without providing a name
- **THEN** The system rejects the submission
- **AND** An error message indicates that the name is required

### Requirement: Product Visibility

The system MUST allow products to be hidden from the storefront. Hidden products SHALL NOT appear in product listings, search results, or brand/category filters. Only administrators and employees can see hidden products in the admin panel.

#### Scenario: Product is visible by default

- **GIVEN** A product is created with the default visibility setting (visible = false)
- **WHEN** The user views the product list on the frontend
- **THEN** The product does NOT appear (since default is false)
- **NOTE:** This scenario assumes default behavior. Administrators must explicitly set visible = true to show products.

#### Scenario: Visible product appears on frontend

- **GIVEN** A product exists with visibility set to true
- **WHEN** The user navigates to the products page
- **THEN** The product is displayed in the list

#### Scenario: Hidden product does not appear on frontend

- **GIVEN** A product exists with visibility set to false
- **WHEN** The user navigates to the products page
- **THEN** The product is NOT displayed
- **AND** The product is not accessible via direct URL

### Requirement: Product Price

The system MUST store a price for each product. The default price SHALL be zero.

#### Scenario: Product price displayed on frontend

- **GIVEN** A product exists with a set price (e.g., 150,000 Toman)
- **WHEN** The user views the product detail page
- **THEN** The price is displayed in Toman

#### Scenario: Product with zero price

- **GIVEN** A product exists with price set to zero (default)
- **WHEN** The user views the product detail page
- **THEN** The price is displayed as “۰ تومان” in Persian or “0 Toman” in English
- **AND** The user is not prevented from viewing the product

### Requirement: Product Inventory

The system MUST track inventory count for each product. The default inventory SHALL be zero (out of stock).

#### Scenario: Product with positive inventory

- **GIVEN** A product exists with inventory = 10
- **WHEN** The user views the product detail page
- **THEN** The inventory is displayed as “موجود: ۱۰ عدد” (Persian) or “Stock: 10 units” (English)
- **AND** The “Add to Cart” button is enabled

#### Scenario: Product with zero inventory

- **GIVEN** A product exists with inventory = 0 (default)
- **WHEN** The user views the product detail page
- **THEN** A label “ناموجود” (out of stock) is displayed
- **AND** The “Add to Cart” button is disabled

#### Scenario: Low inventory warning

- **GIVEN** A product exists with inventory between 1 and 5
- **WHEN** The user views the product list or detail page
- **THEN** A “low stock” badge or indicator is displayed

### Requirement: Product Brand Association

Products SHALL have an optional relationship to a brand. When a brand is associated, the brand name SHALL be displayed on the product detail page and in product listings.

#### Scenario: Product with brand association

- **GIVEN** A product is associated with a specific brand
- **WHEN** The user views the product detail page
- **THEN** The brand name is displayed below the product name
- **AND** The brand name is clickable and links to the brand detail page

#### Scenario: Product without brand association

- **GIVEN** A product has no brand associated (default)
- **WHEN** The user views the product detail page
- **THEN** No brand information is displayed
- **AND** No error occurs

### Requirement: Product Category Association

Products SHALL have an optional relationship to a category. When a category is associated, the category name SHALL be displayed as a filterable attribute.

#### Scenario: Product with category association

- **GIVEN** A product is associated with a specific category
- **WHEN** The user views the product detail page
- **THEN** The category name is displayed
- **AND** Clicking the category filters the product list to show only products in that category

#### Scenario: Product without category association

- **GIVEN** A product has no category associated (default)
- **WHEN** The user views the product detail page
- **THEN** No category information is displayed
- **AND** No error occurs

### Requirement: Product Images

Products SHALL support multiple optional images (gallery) and one optional showcase image (featured/hero image).

#### Scenario: Product with multiple images

- **GIVEN** A product has a gallery of 3 images
- **WHEN** The user views the product detail page
- **THEN** A thumbnail gallery is displayed
- **AND** Clicking a thumbnail shows the full-size image

#### Scenario: Product with showcase image

- **GIVEN** A product has a showcase image
- **WHEN** The user views the product detail page
- **THEN** The showcase image is displayed as the primary image at the top of the page

#### Scenario: Product without any images

- **GIVEN** A product has no images associated (default)
- **WHEN** The user views the product detail page
- **THEN** A placeholder is displayed indicating “No image available”
- **AND** No error occurs

### Requirement: Product Search

The system SHALL allow users to search for products by name.

#### Scenario: Search product by name

- **GIVEN** At least one product exists with “copper pipe” in its name
- **WHEN** The user enters “copper” in the search box and submits
- **THEN** Only products containing “copper” in their name are displayed

#### Scenario: Search with no results

- **GIVEN** No products match the search term
- **WHEN** The user searches for a non‑existent term (e.g., “xyzxyz”)
- **THEN** An empty state message is displayed
- **AND** No errors occur

### Requirement: Product Filter by Brand and Category

The system SHALL allow users to filter product listings by brand or category, independently or combined.

#### Scenario: Filter products by brand

- **GIVEN** The user is on the products page
- **WHEN** The user selects a brand filter
- **THEN** Only products belonging to that brand are displayed

#### Scenario: Filter products by category

- **GIVEN** The user is on the products page
- **WHEN** The user selects a category filter
- **THEN** Only products belonging to that category are displayed

#### Scenario: Filter by brand and category combined

- **GIVEN** The user is on the products page
- **WHEN** The user selects both a brand and a category
- **THEN** Only products matching both filters are displayed

### Requirement: Product Management (Admin)

Administrators and employees MUST be able to create, update, and delete products via the admin panel.

#### Scenario: Create a new product

- **GIVEN** An authenticated admin user is in the product creation form
- **WHEN** The user provides a name, price, inventory, optional brand, optional category, optional images, and submits
- **THEN** The product is saved in the database
- **AND** The product appears on the frontend (if visible = true)

#### Scenario: Update an existing product

- **GIVEN** An authenticated admin user is editing a product
- **WHEN** The user modifies any field (name, price, inventory, brand, category, images, visibility) and saves
- **THEN** The product information is updated
- **AND** Changes are reflected on the frontend

#### Scenario: Delete a product

- **GIVEN** An authenticated admin user views a product
- **WHEN** The user deletes the product
- **THEN** The product is removed from the database
- **AND** The product no longer appears on the frontend
- **AND** Any related orders or cart items that reference the product are handled gracefully (e.g., show a fallback message)
