# Global Site Settings

## Purpose
This spec defines the global configuration settings for the e‑commerce platform. These settings control the site's branding, contact information, and social media presence. Only users with the `admin` role SHALL have permission to modify these settings.

## Requirements

### Requirement: Site Branding

The system MUST support configurable branding elements including site name, logo, and favicon. The site name SHALL be available in both English and Persian (Farsi).

#### Scenario: Admin updates site name in English

- **GIVEN** An authenticated admin user is editing Site Settings
- **WHEN** The admin changes the English site name and saves
- **THEN** The site name is updated in all English‑language pages

#### Scenario: Admin updates site name in Persian

- **GIVEN** An authenticated admin user is editing Site Settings
- **WHEN** The admin changes the Persian site name and saves
- **THEN** The site name is updated in all Persian‑language pages

#### Scenario: Admin uploads a site logo

- **GIVEN** An authenticated admin user is editing Site Settings
- **WHEN** The admin uploads a new logo image and saves
- **THEN** The logo is displayed in the site header across all pages

#### Scenario: Admin uploads a favicon

- **GIVEN** An authenticated admin user is editing Site Settings
- **WHEN** The admin uploads a favicon image and saves
- **THEN** The favicon appears in the browser tab

### Requirement: Contact Information

The system MUST store contact information including email address, phone numbers, and physical addresses. Multiple phone numbers and addresses SHALL be supported.

#### Scenario: Admin adds a phone number

- **GIVEN** An authenticated admin user is editing Site Settings
- **WHEN** The admin adds a phone number with a label (e.g., "Support", "Sales") and saves
- **THEN** The phone number is stored and displayed in the contact section
- **AND** If marked as primary, it is highlighted in the footer and contact page

#### Scenario: Admin adds multiple phone numbers

- **GIVEN** An authenticated admin user is editing Site Settings
- **WHEN** The admin adds multiple phone numbers with different labels
- **THEN** All phone numbers are stored and displayed in the contact section
- **AND** The primary phone number is indicated

#### Scenario: Admin adds an email address

- **GIVEN** An authenticated admin user is editing Site Settings
- **WHEN** The admin enters an email address and saves
- **THEN** The email address is stored and displayed in the contact section

#### Scenario: Admin adds a physical address

- **GIVEN** An authenticated admin user is editing Site Settings
- **WHEN** The admin adds an address with a label (e.g., "Main Office", "Warehouse") and saves
- **THEN** The address is stored and displayed in the contact section

#### Scenario: Admin adds multiple addresses

- **GIVEN** An authenticated admin user is editing Site Settings
- **WHEN** The admin adds multiple addresses with different labels
- **THEN** All addresses are stored and displayed in the contact section
- **AND** The primary address is indicated

#### Scenario: Admin removes a phone number or address

- **GIVEN** An authenticated admin user is editing Site Settings
- **WHEN** The admin deletes a phone number or address
- **THEN** The entry is removed from the contact section

### Requirement: Social Media Links

The system MUST support configurable social media links. Each link SHALL include an icon, a display name, and a URL. Multiple social links SHALL be supported.

#### Scenario: Admin adds a social media link

- **GIVEN** An authenticated admin user is editing Site Settings
- **WHEN** The admin adds a social link with an icon (uploaded image), display name (e.g., "WhatsApp"), and URL, then saves
- **THEN** The social link is stored and displayed in the footer and contact page

#### Scenario: Admin adds multiple social media links

- **GIVEN** An authenticated admin user is editing Site Settings
- **WHEN** The admin adds multiple social links with different platforms
- **THEN** All social links are stored and displayed

#### Scenario: Admin updates a social media link

- **GIVEN** An authenticated admin user is editing Site Settings
- **WHEN** The admin changes the URL or icon of an existing social link and saves
- **THEN** The social link is updated

#### Scenario: Admin removes a social media link

- **GIVEN** An authenticated admin user is editing Site Settings
- **WHEN** The admin deletes a social link
- **THEN** The link is removed from the site

### Requirement: Site Settings Access Control

Only users with the `admin` role SHALL be able to view or modify Site Settings. The system MUST deny access to `employee` and `customer` users.

#### Scenario: Employee attempts to access Site Settings

- **GIVEN** An authenticated employee user navigates to Site Settings in the admin panel
- **WHEN** The page loads
- **THEN** The system returns a `403 Forbidden` error
- **AND** The employee cannot view or modify any settings

#### Scenario: Customer attempts to access Site Settings

- **GIVEN** An authenticated customer user attempts to access Site Settings
- **WHEN** The user navigates to the admin panel
- **THEN** The system redirects to the homepage
- **AND** No settings are displayed

### Requirement: Site Settings Display on Frontend

The system SHALL display contact information and social links on the footer and contact page. The site name and logo SHALL be displayed in the header.

#### Scenario: Contact information is displayed in the footer

- **GIVEN** Site Settings have been configured with phone numbers, email, and addresses
- **WHEN** A user views any page on the site
- **THEN** The footer displays the primary phone number, email, and primary address
- **AND** Social media icons are displayed with links

#### Scenario: Contact information is displayed on the contact page

- **GIVEN** Site Settings have been configured with contact information
- **WHEN** A user navigates to the contact page (`/contact`)
- **THEN** All phone numbers, email addresses, physical addresses, and social links are displayed

#### Scenario: Site logo is displayed in the header

- **GIVEN** Site Settings have a logo configured
- **WHEN** A user views any page on the site
- **THEN** The logo is displayed in the header
- **AND** Clicking the logo redirects to the homepage
