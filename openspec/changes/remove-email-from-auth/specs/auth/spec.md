# Auth

## MODIFIED Requirements

### Requirement: Login

Users MUST be able to log in to their account using their phone number and password. Email SHALL NOT be accepted, requested, or required as a login identifier. Users SHALL be able to view public information on the site without logging in.

#### Scenario: Login success with valid credentials

- **GIVEN** The user is on the login page at `/login` under `src/app/(app)`
- **AND** The user has a valid mobile number and password
- **WHEN** The user submits the login form with their phone number
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

#### Scenario: Login form has no email field

- **GIVEN** The user is on the login page
- **WHEN** The page renders
- **THEN** The login form MUST NOT display an email input
- **AND** The identifier label MUST be "Phone" (or equivalent) only

#### Scenario: Login payload has no email

- **GIVEN** The user is on the login page
- **WHEN** The user submits the login form
- **THEN** The request body sent to `POST /api/users/login` contains `phone` and `password` fields
- **AND** The request body does NOT include an `email` field
