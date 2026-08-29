# Page: About Us

## Purpose
This spec defines the behavior and content of the About Us page (`/about`) on the e‑commerce platform. The page content SHALL be managed through a global collection named `page-about` using Payload's rich text editor. Administrators SHALL be able to update the content without requiring code changes.

## Requirements

### Requirement: About Us Page Display

The system MUST display an About Us page that shows rich text content managed via the Payload CMS global collection `page-about`. The page SHALL be publicly accessible without authentication.

#### Scenario: About Us page loads with published content

- **GIVEN** The `page-about` global has been configured with rich text content
- **WHEN** A user navigates to `/about`
- **THEN** The page title displays "About Us" (or localized equivalent)
- **AND** The rich text content is rendered as HTML on the page
- **AND** The content preserves formatting (headings, paragraphs, lists, links, images)

#### Scenario: About Us page when no content is configured

- **GIVEN** The `page-about` global has no content saved
- **WHEN** A user navigates to `/about`
- **THEN** A friendly empty state message is displayed (e.g., "About Us content is being prepared")
- **AND** No errors are shown

### Requirement: About Us Content Management (Admin)

Administrators MUST be able to create, update, and publish content for the About Us page using Payload's rich text editor. The content SHALL be saved to the `page-about` global collection.

#### Scenario: Admin creates About Us content

- **GIVEN** An authenticated admin user is in the admin panel
- **WHEN** The admin navigates to the `page-about` global and saves rich text content
- **THEN** The content is stored in the database
- **AND** The content is immediately displayed on the frontend `/about` page

#### Scenario: Admin updates About Us content

- **GIVEN** An authenticated admin user is editing the `page-about` global
- **WHEN** The admin modifies the rich text content and saves
- **THEN** The content is updated in the database
- **AND** The updated content is immediately displayed on the frontend

#### Scenario: Admin formats content using rich text editor

- **GIVEN** An authenticated admin user is editing the `page-about` global
- **WHEN** The admin uses the rich text editor features (headings, bold, italic, lists, links, images)
- **THEN** All formatting is preserved when displayed on the frontend

### Requirement: About Us Page Breadcrumb

The About Us page SHALL include a breadcrumb trail to help users navigate back to the homepage.

#### Scenario: Breadcrumb is displayed

- **GIVEN** A user is on the About Us page
- **WHEN** The page loads
- **THEN** A breadcrumb trail shows: "Home › About Us"

### Requirement: About Us Page Metadata

The About Us page MUST have appropriate SEO metadata including title and description. The title SHALL include the site name (e.g., "About Us | Abafarin").

#### Scenario: Meta title is generated

- **GIVEN** Site Settings has site name configured
- **WHEN** The About Us page loads
- **THEN** The page title is "About Us | {siteName}"
- **AND** The meta description is a localized description

### Requirement: About Us Page Accessibility

The About Us page content SHALL be accessible to all users, including those using screen readers.

#### Scenario: Rich text content is accessible

- **GIVEN** The About Us page has rich text content
- **WHEN** A user using a screen reader navigates to the page
- **THEN** All text content is read aloud
- **AND** Images within the content have appropriate alt text
- **AND** Links are properly labeled
