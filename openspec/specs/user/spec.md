# User

## Purpose
This spec defines the user entity and its behavior within the e‑commerce platform. Users represent all registered individuals, including customers, employees, and administrators. The primary identifier and authentication credential is the phone number.

## Requirements

### Requirement: User Registration Fields

The system MUST capture the following fields during user registration: first name, last name, and phone number. Address SHALL NOT be required at registration time.

#### Scenario: User registers with required fields

- **GIVEN** A new user is on the registration page
- **WHEN** The user provides a first name, last name, and a valid phone number
- **THEN** The account is created successfully
- **AND** The user is logged in automatically
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

### Requirement: Unique Phone Number

Each user's phone number MUST be unique across the entire system. The system SHALL prevent registration or creation of a user with a phone number that is already associated with an existing account.

#### Scenario: Registration with a new phone number

- **GIVEN** A phone number that has not been used before
- **WHEN** A user registers with that phone number
- **THEN** The registration succeeds

#### Scenario: Registration with an existing phone number

- **GIVEN** A phone number that is already registered to another user
- **WHEN** A new user attempts to register with that same phone number
- **THEN** The system rejects the registration
- **AND** An error message indicates that the phone number is already taken

### Requirement: Phone Number for Authentication

The phone number SHALL serve as the primary credential for authentication. Users MUST log in using their phone number and password.

#### Scenario: User logs in with phone number and password

- **GIVEN** A registered user has a valid phone number and password
- **WHEN** The user enters the phone number and password on the login page
- **THEN** The system authenticates the user and logs them in

#### Scenario: User cannot log in with an unregistered phone number

- **GIVEN** A phone number that does not exist in the system
- **WHEN** The user attempts to log in with that phone number and a password
- **THEN** The system rejects the login attempt
- **AND** An error message indicates that the credentials are invalid

### Requirement: Phone Number Format Validation

The phone number MUST be a valid Iranian mobile phone number. The system SHALL validate the format during registration and update operations.

#### Scenario: Valid Iranian phone number

- **GIVEN** A phone number with 11 digits starting with `09` (e.g., `09123456789`)
- **WHEN** The user submits the registration form
- **THEN** The phone number is accepted

#### Scenario: Invalid phone number format

- **GIVEN** A phone number that is not 11 digits or does not start with `09` (e.g., `02112345678` or `9123456789`)
- **WHEN** The user submits the registration form
- **THEN** The system rejects the submission
- **AND** An error message indicates that the phone number format is invalid

### Requirement: Address for Order Placement

Users MUST have a valid address saved before they can place an order. The system SHALL require an address during checkout if none exists.

#### Scenario: User places an order with an existing address

- **GIVEN** A user has a saved address in their profile
- **WHEN** The user proceeds to checkout
- **THEN** The address is pre‑filled in the checkout form
- **AND** The order can be placed successfully

#### Scenario: User attempts to place an order without an address

- **GIVEN** A user does not have any saved address in their profile
- **WHEN** The user attempts to proceed to checkout
- **THEN** The system displays a message indicating that an address is required
- **AND** The user is prompted to enter an address before continuing

#### Scenario: User enters an address during checkout

- **GIVEN** A user does not have a saved address
- **WHEN** The user reaches the checkout page
- **THEN** The user can enter a new address directly in the checkout form
- **AND** The address is saved to the user's profile after the order is placed

#### Scenario: User updates their address before placing an order

- **GIVEN** A user has a saved address in their profile
- **WHEN** The user edits the address on the checkout page or account page and saves
- **THEN** The address is updated with the new information

### Requirement: User Profile Display

The system SHALL display user information (first name, last name, phone number, and address) on the account page. The phone number SHALL be shown in a read‑only format.

#### Scenario: User views their profile

- **GIVEN** A user is logged in and navigates to the account page
- **WHEN** The page loads
- **THEN** The user's first name, last name, phone number, and saved address are displayed
- **AND** The phone number is read‑only

#### Scenario: User profile shows address

- **GIVEN** A user has a saved address
- **WHEN** The user views the account page
- **THEN** The address is displayed in the profile sectionlephone number format.
