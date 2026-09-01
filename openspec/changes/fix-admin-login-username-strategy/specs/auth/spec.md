# Auth

## MODIFIED Requirements

### Requirement: Login

Users MUST be able to log in to their account using a single identifier and password. The identifier is the user's phone number, which the system stores as the `username` field on the user record (Payload's local strategy is configured with `loginWithUsername: true`). Email SHALL NOT be accepted, requested, or required as a login identifier. Users SHALL be able to view public information on the site without logging in. The same identifier and credential are accepted by the public `/login` page, the Payload admin panel login form, and the `create-first-user` admin bootstrap flow.

#### Scenario: Login success with valid credentials

- **GIVEN** The user is on the login page at `/login` under `src/app/(app)`
- **AND** The user has a valid phone number and password
- **WHEN** The user submits the login form with their phone number as the identifier
- **THEN** The system authenticates the user
- **AND** The user is redirected to the page they were viewing before login

#### Scenario: Login success redirects to previous page

- **GIVEN** The user is viewing a product page
- **AND** The user is not authenticated
- **WHEN** The user completes the login process successfully
- **THEN** The user is redirected back to the product page

#### Scenario: Login fails with incorrect credentials

- **GIVEN** The user is on the login page
- **AND** The user has filled in the identifier and password fields
- **WHEN** The user submits an incorrect phone number or password
- **THEN** The system rejects the login attempt
- **AND** A clear error message is displayed indicating that the phone number or password is incorrect

#### Scenario: Login form has no email field

- **GIVEN** The user is on the public login page at `/login` under `src/app/(app)`
- **WHEN** The page renders
- **THEN** The login form MUST NOT display an email input
- **AND** The identifier input MUST be named `username` on the wire and labeled "Phone" (or equivalent) in the UI

#### Scenario: Login payload uses username equal to phone

- **GIVEN** The user is on the login page
- **WHEN** The user submits the login form with phone `09123456789` and a password
- **THEN** The request body sent to `POST /api/users/login` contains `username: "09123456789"` and `password`
- **AND** The request body does NOT include an `email` field

#### Scenario: Admin panel login uses the same identifier

- **GIVEN** An admin user was created by Payload's `create-first-user` action with a phone number as the identifier
- **WHEN** The admin navigates to the Payload admin panel login form
- **THEN** The admin login form shows a single identifier input (Payload's username field)
- **AND** Submitting that form with the admin's phone number and password authenticates the admin
- **AND** The error "Phone Number or Password is wrong." MUST NOT be returned for a valid phone + password combination

#### Scenario: Logout

- **GIVEN** The user is authenticated
- **WHEN** The user clicks the logout control in the user interface
- **THEN** The system clears the authentication cookie
- **AND** The user is redirected to the homepage

#### Scenario: Token expires after inactivity

- **GIVEN** The user is authenticated
- **WHEN** The user has no activity for 24 hours (1 day)
- **THEN** The system invalidates the authentication token
- **AND** The user must log in again to continue

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