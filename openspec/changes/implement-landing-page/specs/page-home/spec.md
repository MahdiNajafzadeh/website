## Purpose

Defines the public homepage at `/` for the industrial-supply storefront, which assembles seven sections from Payload CMS data — hero, 3-up category grid, 4-up newly-added products, 4-up popular products, full category list, and brands list — using the design tokens bound from `DESIGN.md`.

## ADDED Requirements

### Requirement: Home Page Loads Seven Sections

The system MUST render a public homepage at `/` that displays seven sections in a fixed order: hero, category navigation grid, newly-added products, popular products, full category list, brands list. The hero is static copy. The remaining six sections render content from Payload collections (`products`, `categories`, `brands`) and the `site-settings` global. The page SHALL be publicly accessible without authentication and SHALL preserve the existing `(app)` route-group layout (topnav, footer) unchanged.

#### Scenario: Home page loads with all sections
- **WHEN** an unauthenticated visitor navigates to `/`
- **THEN** the topnav renders first, followed by the seven sections in order, then the footer
- **AND** no Payload admin chrome or welcome screen appears

#### Scenario: Home page renders when collections are empty
- **WHEN** an unauthenticated visitor navigates to `/` and no products, categories, or brands exist
- **THEN** the hero renders as static copy
- **AND** empty product grids, category list, and brand list render without errors and without mock data

### Requirement: Hero Section Is Static Copy

The system MUST render a hero section with eyebrow text, a heading, a lead paragraph, and up to two call-to-action links (`Browse catalog` linking to `#categories` and `Create account` linking to `/register`). The hero copy SHALL be defined in the page component, not in Payload, and SHALL NOT change without a code change.

#### Scenario: Hero displays the locked copy
- **WHEN** a visitor loads `/`
- **THEN** the hero shows the eyebrow "Industrial supply · Tehran", the heading "Pipes, fittings & valves for contractors and project procurement.", the lead "Browse the catalog by category and check stock and pricing in تومان.", and the two CTA buttons

### Requirement: Category Navigation Grid Renders Three Categories

The system MUST render a 3-up grid of category cards showing the first three categories from the `categories` collection sorted by `name` ascending. Each card MUST show a monogram icon (the first character of the category name), the category name, a description derived from the `description` field when present (otherwise the count), and a count of visible products in that category. Each card SHALL link to `/products?category=<slug>`.

#### Scenario: Category grid renders three cards
- **WHEN** the home page loads and the `categories` collection contains at least three entries
- **THEN** exactly three category cards render in a single row at desktop width
- **AND** each card shows the category monogram, name, description or count, and product count
- **AND** each card links to `/products?category=<category-slug>`

#### Scenario: Category grid collapses on narrow viewports
- **WHEN** the home page loads at a viewport width below the desktop breakpoint
- **THEN** the category grid stacks to one column
- **AND** no horizontal scroll appears

#### Scenario: Category grid shows fewer cards when categories are fewer than three
- **WHEN** the `categories` collection contains fewer than three entries
- **THEN** the grid renders one card per available category
- **AND** the section is omitted entirely if zero categories exist

### Requirement: Newly Added Products Section Renders Four Recent Products

The system MUST render a 4-up grid of product cards showing up to four visible products from the `products` collection sorted by `createdAt` descending. Each card MUST display the first product image (or a labeled placeholder when none), the parent category name when present, the product name, and the price in `تومان` (or "Contact for price" when price is zero). Each card SHALL link to `/products/<slug>`.

#### Scenario: Newly added section renders four products
- **WHEN** the home page loads and at least four visible products exist
- **THEN** the section renders four product cards sorted by `createdAt` descending
- **AND** each card image, category badge, name, and price match the product's Payload data

#### Scenario: Newly added section renders fewer cards when fewer than four visible products exist
- **WHEN** the `products` collection contains fewer than four visible products
- **THEN** the section renders one card per visible product
- **AND** the section is omitted entirely if no visible products exist

#### Scenario: Newly added section hides hidden products
- **WHEN** the `products` collection contains products with `visible: false`
- **THEN** those products do not appear in the newly added section
- **AND** only products with `visible: true` are counted

### Requirement: Popular Products Section Renders Four Top-Inventory Products

The system MUST render a 4-up grid of product cards showing up to four visible products from the `products` collection sorted by `inventory` descending. Each card SHALL follow the same display contract as the newly-added section.

#### Scenario: Popular section renders four products sorted by inventory
- **WHEN** the home page loads and at least four visible products exist
- **THEN** the section renders four product cards sorted by `inventory` descending
- **AND** the highest-inventory product appears first

#### Scenario: Popular section is omitted when no products have inventory
- **WHEN** all visible products have `inventory: 0`
- **THEN** the section is omitted entirely from the page

### Requirement: Full Category List Section Renders All Categories

The system MUST render a vertical list of category rows, one per entry in the `categories` collection sorted by `name` ascending. Each row MUST display a monogram (first character of the category name), the category name, the description when present, and a count of visible products. Each row SHALL link to `/products?category=<slug>` and SHALL be navigable by keyboard with a visible focus ring.

#### Scenario: Category list renders all categories
- **WHEN** the home page loads
- **THEN** one row per category renders in alphabetical order
- **AND** each row shows monogram, name, description (when present), and product count

#### Scenario: Category list is keyboard navigable
- **WHEN** a user tabs through the category list
- **THEN** each row receives a visible focus ring in tab order
- **AND** pressing Enter activates the row link

### Requirement: Brands List Section Renders All Brands

The system MUST render a vertical list of brand rows, one per entry in the `brands` collection sorted by `name` ascending. Each row MUST display a monogram, the brand name, the description when present, and a count of visible products for that brand. Each row SHALL link to `/brands/<slug>` (or `/products?brand=<slug>` if no brand detail route exists yet) and SHALL be keyboard-navigable.

#### Scenario: Brands list renders all brands
- **WHEN** the home page loads
- **THEN** one row per brand renders in alphabetical order
- **AND** each row shows monogram, name, description (when present), and product count

#### Scenario: Brands list is keyboard navigable
- **WHEN** a user tabs through the brands list
- **THEN** each row receives a visible focus ring
- **AND** pressing Enter activates the row link

### Requirement: Theme Toggle Switches Light and Dark Mode Without Flash

The system MUST render a theme toggle button in the topnav right-cluster that switches between light and dark mode by setting `data-theme="light"` or `data-theme="dark"` on `<html>`. The button MUST persist the user's choice in `localStorage` under the key `theme-pref` and MUST respect the system's `prefers-color-scheme` setting when no preference is stored. The initial theme MUST be applied before the first paint via an inline script in `<head>` to prevent FOUC. The button MUST sync its `aria-pressed` attribute with the current theme.

#### Scenario: Theme toggle applies saved preference before first paint
- **WHEN** a user has previously selected dark mode and `localStorage.theme-pref` equals `"dark"`
- **THEN** on next page load, `<html data-theme="dark">` is set before the body renders
- **AND** no light-mode flash appears

#### Scenario: Theme toggle respects system preference when no choice is stored
- **WHEN** `localStorage.theme-pref` is empty and the operating system prefers dark mode
- **THEN** the page renders in dark mode on first visit

#### Scenario: Theme toggle click switches and persists
- **WHEN** the user clicks the theme toggle
- **THEN** the `<html>` `data-theme` attribute flips
- **AND** the new value is written to `localStorage.theme-pref`
- **AND** `aria-pressed` on the toggle updates accordingly

### Requirement: Home Page Uses Site Settings Branding

The system MUST use the `site-settings` global for the topnav brand text (Farsi site name when present, English fallback, or literal "فروشگاه") and the brand logo. Footer contact details (phones, emails, addresses) and social links SHALL come from the same global. The brand mark monogram SHALL fall back to the first character of the site name when no logo is configured.

#### Scenario: Site settings drive topnav and footer branding
- **WHEN** `site-settings.siteName.fa` is configured
- **THEN** the topnav and footer display that value
- **AND** when `siteName.fa` is empty but `siteName.en` is configured, the English value is used
- **AND** when both are empty, the literal "فروشگاه" is used

#### Scenario: Site settings drive footer contact details
- **WHEN** `site-settings.phones`, `emails`, `addresses`, or `socialLinks` are configured
- **THEN** the footer renders the primary phone, email, address, and social icons from those fields
- **AND** missing fields render a graceful empty state instead of throwing

### Requirement: Home Page Is Accessible and SEO-Ready

The system MUST set the page `<html lang>` to `fa`, provide a `<title>` containing the Farsi site name and a description containing the Farsi site name + category summary, and ensure every top-level section has an `aria-labelledby` referencing its heading. Skip links MUST be present for keyboard users to jump past the topnav. All interactive elements MUST be reachable by keyboard with visible focus rings using `{colors.accent-soft}` token.

#### Scenario: Home page announces sections to screen readers
- **WHEN** a screen reader user navigates the home page
- **THEN** each section's heading is announced as a landmark heading
- **AND** the page title appears in the document title

#### Scenario: Skip link jumps past topnav
- **WHEN** a keyboard user activates the skip link
- **THEN** focus moves to the main content area
- **AND** the topnav is bypassed

### Requirement: Home Page Is Responsive Across Breakpoints

The system MUST render the home page responsively at the breakpoints defined in `DESIGN.md` (640px, 760px, 920px, 1023px). The category grid MUST collapse to one column below 920px. The product grids MUST collapse to two columns below 1023px and to one column below 599px. The category and brand row lists MUST hide their trailing arrow column below 640px.

#### Scenario: Responsive collapse at 920px
- **WHEN** the viewport width is between 640px and 920px
- **THEN** the category grid renders one column
- **AND** the product grids render two columns
- **AND** the row lists drop the trailing arrow column

#### Scenario: Responsive collapse at 599px
- **WHEN** the viewport width is below 599px
- **THEN** all multi-column grids render one column
- **AND** no horizontal scroll appears
- **AND** the topnav brand area remains visible while the primary nav hides

### Requirement: Home Page Tokens Bind to DESIGN.md

The system MUST resolve every color, typography, spacing, radius, and component value on the home page from `DESIGN.md` token paths. No raw hex, px, or invented color names SHALL appear outside the `:root` token block. After any change to the home page CSS, the designer MUST run `bunx @google/design.md lint DESIGN.md` to validate the design system.

#### Scenario: Home page CSS contains no ad-hoc values
- **WHEN** the home page CSS is reviewed
- **THEN** every color matches a token from `DESIGN.md`
- **AND** every font size matches a typography token
- **AND** every padding, gap, and radius matches a spacing or radius token

### Requirement: Home Page Currency and Language Are Farsi

The system MUST render prices in تومان using `${price.toLocaleString()} تومان` (matching `products/page.tsx:338`) and MUST NOT show a language switcher or bilingual alternatives. The page `<html lang>` attribute MUST be `fa`.

#### Scenario: Prices render in تومan
- **WHEN** a product has `price: 150000`
- **THEN** the rendered price text is "150,000 تومان"

#### Scenario: Zero price renders as contact prompt
- **WHEN** a product has `price: 0`
- **THEN** the rendered price text is "Contact for price" (English copy per existing convention) or "تماس بگیرید" (Farsi); the implementation picks one consistently across both product sections.