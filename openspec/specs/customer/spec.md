# Customer

## Purpose
This spec defines the customer types and their pricing behavior within the e‑commerce platform. Customers are classified into two types: regular and partner (corporate). Partner customers receive special discounts configured by administrators.

## Requirements

### Requirement: Customer Types

The system MUST support two customer types: `regular` and `partner`. Every customer SHALL have a type assigned, with `regular` being the default after registration.

#### Scenario: New customer is registered as regular

- **GIVEN** A new user completes the registration process
- **WHEN** The account is created
- **THEN** The customer type is set to `regular` by default

#### Scenario: Customer type is displayed on account page

- **GIVEN** A customer views their account page
- **THEN** The customer type (`regular` or `partner`) is displayed

### Requirement: Customer Type Management (Admin/Employee)

Administrators and employees MUST be able to change a customer's type after registration. Only users with `admin` or `employee` roles SHALL have permission to update a customer's type.

#### Scenario: Admin changes customer type to partner

- **GIVEN** An authenticated admin user is viewing a customer's profile in the admin panel
- **WHEN** The admin selects `partner` from the customer type dropdown and saves
- **THEN** The customer type is updated to `partner`
- **AND** The customer's pricing behavior updates accordingly

#### Scenario: Employee changes customer type to regular

- **GIVEN** An authenticated employee user is viewing a customer's profile in the admin panel
- **WHEN** The employee selects `regular` from the customer type dropdown and saves
- **THEN** The customer type is updated to `regular`
- **AND** The customer's pricing behavior updates accordingly

#### Scenario: Customer cannot change their own type

- **GIVEN** A customer is viewing their own profile
- **WHEN** The customer attempts to change their type
- **THEN** The customer type field is read‑only or not visible
- **AND** No change is applied

### Requirement: Regular Customer Pricing

Regular customers SHALL see the standard product price (the `price` field on the product) with no discounts applied.

#### Scenario: Regular customer views product price

- **GIVEN** A regular customer is browsing the product catalog
- **WHEN** The customer views a product detail page
- **THEN** The product price is displayed as the standard price (no discount)
- **AND** No discount badge or indicator is shown

#### Scenario: Regular customer adds product to cart

- **GIVEN** A regular customer adds a product to the cart
- **WHEN** The cart is displayed
- **THEN** The product price matches the standard price (no discount applied)

### Requirement: Partner Customer Pricing

Partner customers SHALL see a discounted price applied to all products. The discount percentage SHALL be configured globally in the `SiteSettings` by an administrator.

#### Scenario: Partner customer views product price with discount

- **GIVEN** A partner customer is browsing the product catalog
- **AND** The global partner discount is set to 10% in `SiteSettings`
- **AND** The product has a standard price of 100,000 Toman
- **WHEN** The customer views the product detail page
- **THEN** The discounted price (90,000 Toman) is displayed
- **AND** The original price (100,000 Toman) is displayed with a strikethrough
- **AND** A discount badge (e.g., "۱۰٪ تخفیف") is shown

#### Scenario: Partner customer adds product to cart with discount

- **GIVEN** A partner customer views a product with a 10% discount
- **WHEN** The customer adds the product to the cart
- **THEN** The discounted price (90,000 Toman) is used in the cart total

#### Scenario: Partner discount changes in SiteSettings

- **GIVEN** The global partner discount is updated from 10% to 15% by an administrator
- **WHEN** A partner customer views a product
- **THEN** The new discounted price is displayed (e.g., 85,000 Toman for a 100,000 Toman product)
- **AND** The updated discount is applied immediately to all partner customers

#### Scenario: Partner discount set to 0%

- **GIVEN** The global partner discount is set to 0% in `SiteSettings`
- **WHEN** A partner customer views a product
- **THEN** The product price is displayed as the standard price (no discount applied)
- **AND** No discount badge is shown

### Requirement: Partner Discount Configuration

The system MUST expose a configurable partner discount percentage in `SiteSettings`. Only administrators SHALL have permission to update this setting.

#### Scenario: Admin updates partner discount

- **GIVEN** An authenticated admin user is editing `SiteSettings`
- **WHEN** The admin changes the partner discount percentage and saves
- **THEN** The discount is stored and applied to all partner customers

#### Scenario: Employee attempts to update partner discount

- **GIVEN** An authenticated employee user is editing `SiteSettings`
- **WHEN** The employee attempts to change the partner discount
- **THEN** The system denies the operation (forbidden)
- **AND** The employee sees a permission error

### Requirement: Customer Type for Checkout

The customer type SHALL determine the pricing used during checkout. The order total MUST reflect the appropriate pricing (regular or discounted).

#### Scenario: Partner customer places an order with discounted prices

- **GIVEN** A partner customer has products in the cart with discounted prices applied
- **WHEN** The customer proceeds to checkout and places the order
- **THEN** The order total is calculated using the discounted prices
- **AND** The order record stores the final prices (snapshot) as they were at checkout

#### Scenario: Regular customer places an order with standard prices

- **GIVEN** A regular customer has products in the cart with standard prices
- **WHEN** The customer proceeds to checkout and places the order
- **THEN** The order total is calculated using the standard prices
- **AND** The order record stores the standard prices (snapshot)

### Requirement: Customer Type Visibility for Employees

Employees SHALL be able to view a customer's type in the customer list and detail pages in the admin panel.

#### Scenario: Employee views customer list with type column

- **GIVEN** An authenticated employee is in the admin panel
- **WHEN** The employee views the customer list
- **THEN** Each customer row includes a column showing the customer type (`regular` or `partner`)
- **AND** The employee can sort or filter by customer type

#### Scenario: Employee views customer detail

- **GIVEN** An authenticated employee opens a customer's detail page
- **WHEN** The page loads
- **THEN** The customer type is displayed as a read‑only or editable field (depending on permissions)
