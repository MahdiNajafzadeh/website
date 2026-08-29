# Page: Contact

## Purpose
This spec defines the behavior and content of the contact page (`/contact`) on the e‑commerce platform. The page SHALL display all contact information and social media links configured in the Site Settings. All content is read‑only and sourced from the global settings.

## Requirements

### Requirement: Contact Page Display

The system MUST display a contact page that shows all configured phone numbers, email addresses, physical addresses, and social media links from Site Settings. The page SHALL be publicly accessible without authentication.

#### Scenario: Contact page loads with complete information

- **GIVEN** Site Settings are configured with:
  - At least one phone number
  - At least one email address
  - At least one physical address
  - At least one social media link
- **WHEN** A user navigates to `/contact`
- **THEN** The page title displays "Contact Us" (or localized equivalent)
- **AND** A subheading or description is shown (e.g., "Reach us through any of the channels below")
- **AND** All phone numbers are displayed with their labels
- **AND** All email addresses are displayed with their labels
- **AND** All physical addresses are displayed with their labels
- **AND** All social media links are displayed with their icons, names, and descriptions (if available)

#### Scenario: Contact page with partial information

- **GIVEN** Site Settings have only phone numbers configured (no email, no addresses, no social links)
- **WHEN** A user navigates to `/contact`
- **THEN** The phone numbers are displayed
- **AND** Sections for email, addresses, and social links are omitted or hidden
- **AND** No errors are shown

#### Scenario: Contact page with no information configured

- **GIVEN** Site Settings have no contact information configured (empty phone, email, address, and social link arrays)
- **WHEN** A user navigates to `/contact`
- **THEN** A friendly empty state message is displayed (e.g., "Contact information has not been configured in the admin panel yet.")
- **AND** No errors are shown

### Requirement: Phone Number Display on Contact Page

Phone numbers SHALL be displayed with their labels and SHALL be clickable for direct calling on mobile devices.

#### Scenario: Phone number is displayed with label

- **GIVEN** Site Settings have a phone number with label "Main Office" and number "+98 21 1234 5678"
- **WHEN** The contact page loads
- **THEN** The label "Main Office" is displayed
- **AND** The phone number is displayed

#### Scenario: Primary phone number is highlighted

- **GIVEN** Site Settings have multiple phone numbers, one marked as `isPrimary: true`
- **WHEN** The contact page loads
- **THEN** The primary phone number is displayed with a "Primary" badge or indicator

#### Scenario: Phone number is clickable (tel link)

- **GIVEN** A phone number is displayed on the contact page
- **WHEN** A user clicks on the phone number on a mobile device
- **THEN** The device opens the dialer with the phone number pre‑filled

### Requirement: Email Display on Contact Page

Email addresses SHALL be displayed with their labels and SHALL be clickable to open the user's email client.

#### Scenario: Email is displayed with label

- **GIVEN** Site Settings have an email with label "Support" and address "support@abafarin.com"
- **WHEN** The contact page loads
- **THEN** The label "Support" is displayed
- **AND** The email address "support@abafarin.com" is displayed

#### Scenario: Primary email is highlighted

- **GIVEN** Site Settings have multiple emails, one marked as `isPrimary: true`
- **WHEN** The contact page loads
- **THEN** The primary email is displayed with a "Primary" badge or indicator

#### Scenario: Email is clickable (mailto link)

- **GIVEN** An email address is displayed on the contact page
- **WHEN** A user clicks on the email address
- **THEN** The default email client opens with the address pre‑filled in the "To" field

### Requirement: Address Display on Contact Page

Physical addresses SHALL be displayed with their labels and full address details.

#### Scenario: Address is displayed with label

- **GIVEN** Site Settings have an address with label "Main Office" and address "Tehran, Iran"
- **WHEN** The contact page loads
- **THEN** The label "Main Office" is displayed
- **AND** The full address is displayed below the label

#### Scenario: Primary address is highlighted

- **GIVEN** Site Settings have multiple addresses, one marked as `isPrimary: true`
- **WHEN** The contact page loads
- **THEN** The primary address is displayed with a "Primary" badge or indicator

### Requirement: Social Media Links Display on Contact Page

Social media links SHALL be displayed with their icons (or initials as fallback), display names, descriptions (if available), and clickable URLs.

#### Scenario: Social link is displayed with icon and name

- **GIVEN** Site Settings have a social link with name "WhatsApp", label "Support WhatsApp", URL "https://wa.me/09123456789"
- **WHEN** The contact page loads
- **THEN** The icon (uploaded image or first‑letter fallback) is displayed
- **AND** The display name "Support WhatsApp" is shown
- **AND** The URL is clickable and opens in a new tab

#### Scenario: Social link without icon

- **GIVEN** Site Settings have a social link with name "Telegram" but no icon uploaded
- **WHEN** The contact page loads
- **THEN** A fallback icon (first letter of the name, e.g., "T") is displayed
- **AND** The link is still clickable

#### Scenario: Social link with description

- **GIVEN** Site Settings have a social link with description "For urgent inquiries"
- **WHEN** The contact page loads
- **THEN** The description is displayed below the link

### Requirement: Breadcrumb Navigation

The contact page SHALL include a breadcrumb trail to help users navigate back to the homepage.

#### Scenario: Breadcrumb is displayed

- **GIVEN** A user is on the contact page
- **WHEN** The page loads
- **THEN** A breadcrumb trail shows: "Home › Contact Us"

### Requirement: Page Metadata

The contact page MUST have appropriate SEO metadata including title and description. The title SHALL include the site name (e.g., "Contact Us | Abafarin").

#### Scenario: Meta title is generated

- **GIVEN** Site Settings has site name configured
- **WHEN** The contact page loads
- **THEN** The page title is "Contact Us | {siteName}"
- **AND** The meta description is a localized contact description

### Requirement: Response Time Notice

The contact page SHALL display a notice indicating the typical team response time.

#### Scenario: Response notice is displayed

- **GIVEN** The contact page is loaded
- **WHEN** The user views the bottom of the page
- **THEN** A notice is displayed indicating that the team will respond as soon as possible
- **AND** If the site name is configured, it is included in the notice (e.g., "The Abafarin team will respond as soon as possible.")
