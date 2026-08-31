# User

## MODIFIED Requirements

### Requirement: User Registration Fields

The system MUST capture the following fields during user registration: first name, last name, and phone number. The system MUST NOT require, request, or store an email address during registration. Address SHALL NOT be required at registration time.

#### Scenario: User registers with required fields

- **GIVEN** A new user is on the registration page at `/register` under `src/app/(app)`
- **WHEN** The user provides a first name, last name, and a valid phone number
- **THEN** The account is created successfully
- **AND** The user is logged in automatically
- **AND** The address field is left empty
- **AND** No email field is shown or submitted

#### Scenario: Registration fails without first name or last name

- **GIVEN** A new user is on the registration page
- **WHEN** The user submits the form without a first name or last name
- **THEN** The system rejects the registration
- **AND** An error message indicates that first name and last name are required

#### Scenario: Registration fails without phone number

- **GIVEN** A new user is on the registration page
- **WHEN** The user submits the form without a phone number
- **THEN** The system rejects the registration
- **AND** An error message indicates that the phone number is required

#### Scenario: Registration payload contains no email

- **GIVEN** A new user is on the registration page
- **WHEN** The user submits the registration form
- **THEN** The request body sent to `POST /api/users` does NOT include an `email` field
- **AND** The created user record has no email value (or a null/empty email value) in the database

### Requirement: User Profile Display

The system SHALL display user information (first name, last name, phone number, and address) on the account page. The phone number SHALL be shown in a read‑only format. The account page SHALL NOT display an email field for the user.

#### Scenario: User views their profile

- **GIVEN** A user is logged in and navigates to the account page
- **WHEN** The page loads
- **THEN** The user's first name, last name, phone number, and saved address are displayed
- **AND** The phone number is read‑only
- **AND** No email field or email value is shown for the user

#### Scenario: User profile shows address

- **GIVEN** A user has a saved address
- **WHEN** The user views the account page
- **THEN** The address is displayed in the profile sectionlephone number format.
