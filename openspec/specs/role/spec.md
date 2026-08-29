# Role

## Purpose
This spec defines the user roles and their corresponding permissions within the e‑commerce platform. The system enforces role‑based access control (RBAC) across all collections and operations.

## Requirements

### Requirement: Admin Role

The system MUST have a role named `admin`. Users with the `admin` role have full read/write access to all collections and global settings. Only an `admin` can assign or change the role of other users.

#### Scenario: Admin logs into the admin panel

- **GIVEN** The user has an `admin` role
- **AND** The user is on the login page
- **WHEN** The user submits valid credentials
- **THEN** The user is redirected to the admin dashboard (`/admin`)

#### Scenario: Admin updates any collection

- **GIVEN** An authenticated admin user is in the admin panel
- **WHEN** The user creates, updates, or deletes a document in any collection (e.g., Products, Orders, Users)
- **THEN** The operation succeeds

#### Scenario: Admin modifies global settings

- **GIVEN** An authenticated admin user is in the admin panel
- **WHEN** The user updates the `SiteSettings` global (e.g., site name, contact info, social links)
- **THEN** The changes are saved successfully

#### Scenario: Admin assigns a role to another user

- **GIVEN** An authenticated admin user is editing a user record
- **WHEN** The admin changes the user's role to `employee` or `admin`
- **THEN** The role is updated successfully
- **AND** The user's new permissions take effect immediately

### Requirement: Employee Role

The system MUST have a role named `employee`. Users with the `employee` role have access to the admin panel but with restricted permissions.

**Allowed operations for `employee`:**
- Create, read, update, and delete: `orders`, `products`, `brands`, `categories`, `media`
- Read (view only): `users` (cannot modify or delete users)
- Read and update: their own user profile

**Restricted operations for `employee`:**
- No access to `SiteSettings` (global configuration)
- No access to user role management
- No delete access on collections that are restricted by `adminOnly` access policies (e.g., cannot delete users)

#### Scenario: Employee logs into the admin panel

- **GIVEN** The user has an `employee` role
- **AND** The user is on the login page
- **WHEN** The user submits valid credentials
- **THEN** The user is redirected to the admin dashboard (`/admin`)

#### Scenario: Employee manages products and orders

- **GIVEN** An authenticated employee user is in the admin panel
- **WHEN** The employee creates, updates, or deletes a product or an order
- **THEN** The operation succeeds

#### Scenario: Employee attempts to modify global settings

- **GIVEN** An authenticated employee user is in the admin panel
- **WHEN** The employee tries to update the `SiteSettings` (e.g., changing the site name)
- **THEN** The system returns a `403 Forbidden` error from Payload CMS
- **AND** The changes are not applied

#### Scenario: Employee attempts to delete a user

- **GIVEN** An authenticated employee user is in the admin panel
- **WHEN** The employee tries to delete a user
- **THEN** The system denies the operation (forbidden)
- **AND** The user is not deleted

### Requirement: Customer Role

The system MUST have a role named `customer`. The `customer` role is the default role assigned to all new users upon registration.

**Permissions for `customer`:**
- Can browse public pages (products, brands, categories)
- Can add/remove items from the cart and place orders
- Can view and update their own profile and address book
- Can view their own order history
- **Cannot** access the admin panel (`/admin`) under any circumstances

#### Scenario: Customer attempts to access the admin panel

- **GIVEN** The user has a `customer` role
- **AND** The user is logged in
- **WHEN** The user navigates to `/admin`
- **THEN** The system denies access
- **AND** The user is redirected to the homepage (`/`)

#### Scenario: Customer places an order on the frontend

- **GIVEN** An authenticated customer user has items in their cart
- **WHEN** The customer submits the checkout form
- **THEN** The order is created successfully with status `pending`
- **AND** The customer can view the order in their order history

#### Scenario: Customer views their own profile

- **GIVEN** An authenticated customer user is on the frontend
- **WHEN** The user navigates to `/account`
- **THEN** The user's personal information (name, phone, address) and recent orders are displayed
- **AND** The user can update their profile information

### Requirement: Frontend Public Access (Unauthenticated)

Users who are not logged in (unauthenticated) SHALL be able to view public content, including the homepage, product listings, product details, brands, categories, and the contact page.

#### Scenario: Unauthenticated user browses products

- **GIVEN** The user is not logged in
- **WHEN** The user navigates to the products page or a product detail page
- **THEN** The product list or detail is displayed correctly
- **AND** No login prompt is shown

#### Scenario: Unauthenticated user attempts to checkout

- **GIVEN** The user is not logged in
- **WHEN** The user attempts to proceed to checkout
- **THEN** The system redirects the user to the login page
- **AND** After successful login, the user is redirected back to the checkout page
- GIVEN customer user goto `/admin` page
- THEN fill all needed input
- WHEN try to login 
- THEN show access deny error to user
- AND  redirect to `/` page


