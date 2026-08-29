# Auth

This spec defines the authentication workflow for the e-commerce platform.

## Requirements

### Requirement: Login

Users MUST be able to log in to their account. Users SHALL be able to view public information on the site without logging in.

#### Scenario: Login success with valid credentials

- **GIVEN** The user is on the login page
- **AND** The user has a valid mobile number and password
- **WHEN** The user submits the login form
- **THEN** The system authenticates the user
- **AND** The user is redirected to the page they were viewing before login

#### Scenario: Login success redirects to previous page

- **GIVEN** The user is viewing a product page
- **AND** The user is not authenticated
- **WHEN** The user completes the login process successfully
- **THEN** The user is redirected back to the product page

#### Scenario: Login fails with incorrect credentials

- **GIVEN** The user is on the login page
- **AND** The user has filled in the mobile number and password fields
- **WHEN** The user submits the login form with an incorrect mobile number or password
- **THEN** The system rejects the login attempt
- **AND** A clear error message is displayed indicating that either the mobile number or password is incorrect

### Requirement: Logout

Users MUST be able to log out of their account. Users SHALL be able to view public information on the site after logging out.

#### Scenario: User logs out

- **GIVEN** The user is authenticated
- **WHEN** The user clicks the logout button in the user interface
- **THEN** The system clears the authentication cookie
- **AND** The user is redirected to the homepage

### Requirement: Session Expiration

The system MUST expire the authentication token for inactive users after a defined period of inactivity.

#### Scenario: Token expires after inactivity

- **GIVEN** The user is authenticated
- **WHEN** The user has no activity for 24 hours (1 day)
- **THEN** The system invalidates the authentication token
- **AND** The user must log in again to continue

### Requirement: Public Access Without Login

Users SHALL be able to browse products, brands, and other public content without being authenticated. Authentication is only required for actions such as placing orders, viewing order history, and accessing the account dashboard.

#### Scenario: Unauthenticated user browses products

- **GIVEN** The user is not logged in
- **WHEN** The user navigates to the products page
- **THEN** The products are displayed correctly
- **AND** The user can view product details without being prompted to log in

#### Scenario: Unauthenticated user attempts to place an order

- **GIVEN** The user is not logged in
- **WHEN** The user attempts to proceed to checkout
- **THEN** The system redirects the user to the login page
- **AND** After successful login, the user is redirected back to the checkout page
