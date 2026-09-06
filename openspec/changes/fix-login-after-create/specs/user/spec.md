## MODIFIED Requirements

### Requirement: User Registration Fields

The system MUST capture the following fields during user registration: first name, last name, and phone number. Address SHALL NOT be required at registration time. Upon successful creation via `POST /api/users`, the system MUST establish an authenticated session identical to a normal login — setting the `payload-token` httpOnly cookie and `req.user` — so that an immediate `GET /api/users/me` returns the new user and the UI at `src/app/(app)` shows the authenticated avatar without a separate manual login. The `address` field SHALL be optional at registration (stored as empty when not provided).

#### Scenario: User registers with required fields

- **GIVEN** A new user is on the registration page at `src/app/(app)/register/page.tsx`
- **WHEN** The user provides a first name, last name, and a valid phone number
- **THEN** The account is created successfully via `POST /api/users`
- **AND** The user is logged in automatically (response sets `payload-token` cookie or client fallback `POST /api/users/login` with `credentials: "include"` succeeds, so `GET /api/users/me` returns 200 and home at `src/app/(app)/page.tsx` shows avatar)
- **AND** The address field is left empty

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

#### Scenario: Registration with E.164 normalized phone still auto-logs in

- **GIVEN** A new user registers with phone `09123456789`
- **WHEN** The system normalizes the username to E.164 (`+989123456789`) before storage via `formatPhoneBeforeValidate`
- **THEN** The auto-login uses the same E.164 normalization so `POST /api/users/login` succeeds
- **AND** The user is authenticated without needing to re-enter the differently formatted number

#### Scenario: Registration without address succeeds

- **GIVEN** A new user provides only first name, last name, phone and password at `src/app/(app)/register`
- **WHEN** The form is submitted with an empty address field
- **THEN** The account is created successfully
- **AND** The user is logged in automatically
- **AND** No validation error is shown for the missing address
