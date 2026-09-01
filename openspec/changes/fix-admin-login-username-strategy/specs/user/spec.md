# User

## MODIFIED Requirements

### Requirement: Phone Number for Authentication

The phone number SHALL serve as the primary credential for authentication. Users MUST log in using their phone number and password. Internally, the system stores the phone number as the user's `username` field (a unique, required, indexed text field) so that Payload's local strategy (`loginWithUsername: true`) can authenticate directly on it. The `username` field MUST equal the `phone` field for every user — it is set automatically on create (and update) via a `beforeValidate` hook and SHALL NOT be supplied independently by clients. The `email` field remains an optional, hidden, non-required contact field on the user record and SHALL NOT be used as an authentication identifier.

#### Scenario: User logs in with phone number and password

- **GIVEN** A registered user has a valid phone number and password
- **WHEN** The user enters the phone number as the identifier on the login page and submits
- **THEN** The system authenticates the user and logs them in
- **AND** The request body sent to `POST /api/users/login` contains `username` (the phone) and `password`

#### Scenario: User cannot log in with an unregistered phone number

- **GIVEN** A phone number that does not exist in the system
- **WHEN** The user attempts to log in with that phone number and a password
- **THEN** The system rejects the login attempt
- **AND** An error message indicates that the credentials are invalid

#### Scenario: First admin user is created with a phone identifier

- **GIVEN** The system has no users
- **WHEN** An operator completes Payload's `create-first-user` action
- **THEN** The first user is created with a `phone` field and an automatically-derived `username` equal to that phone
- **AND** The first user is able to log in to the Payload admin panel using the phone number as the username and the chosen password
- **AND** The first user is NOT required to supply an email address

#### Scenario: Username mirrors phone on update

- **GIVEN** A user record exists with `phone: "09123456789"` and `username: "09123456789"`
- **WHEN** An admin updates that user's `phone` to `"09987654321"`
- **THEN** The `username` field on the same record is updated to `"09987654321"` by the validation hook
- **AND** Subsequent logins with `username: "09987654321"` succeed

#### Scenario: Email is not used for authentication

- **GIVEN** A user record may or may not have an `email` value
- **WHEN** A client posts `{ email, password }` to `POST /api/users/login`
- **THEN** The system rejects the request as an invalid login payload
- **AND** The system does NOT look up the user by `email` to authenticate

### Requirement: User Registration Fields

The system MUST capture the following fields during user registration: first name, last name, and phone number. The system MUST NOT require, request, or store an email address during registration. Address SHALL NOT be required at registration time. On user creation, the system MUST auto-populate the `username` field with the value of `phone`; clients SHALL NOT send `username` in the registration payload.

#### Scenario: User registers with required fields

- **GIVEN** A new user is on the registration page at `/register` under `src/app/(app)`
- **WHEN** The user provides a first name, last name, and a valid phone number
- **THEN** The account is created successfully with `username` set to the phone value
- **AND** The user is logged in automatically via the same identifier used at registration
- **AND** The address field is left empty
- **AND** No email field is shown or submitted

#### Scenario: Registration payload contains no email or username

- **GIVEN** A new user is on the registration page
- **WHEN** The user submits the registration form
- **THEN** The request body sent to the registration endpoint does NOT include an `email` field
- **AND** The request body does NOT include a `username` field
- **AND** The created user record has `username` equal to `phone` in the database

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