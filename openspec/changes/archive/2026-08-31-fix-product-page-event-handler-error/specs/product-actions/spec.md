## Purpose

Provides the Wishlist and Share interactive actions rendered on the product detail page under `src/app/(app)/products/[slug]`, so the storefront can offer personal saving and product sharing without breaking the React Server Component boundary.

## ADDED Requirements

### Requirement: Product detail page exposes interactive Wishlist and Share actions

The product detail page rendered at `(app)/products/[slug]` SHALL render a Wishlist button and a Share button alongside the existing Add-to-Cart control. The buttons MUST be implemented as a Client Component so that event handlers are not passed across the Server→Client boundary, and the page MUST render without a runtime error in Next.js 16 (App Router).

#### Scenario: Product detail page renders without runtime error

- **WHEN** an authenticated or anonymous user navigates to `(app)/products/<slug>` for any visible product
- **THEN** the server response is a 200 and no "Event handlers cannot be passed to Client Component props" error appears in the browser console or server logs

#### Scenario: Wishlist and Share buttons are visible

- **WHEN** a user opens a product detail page
- **THEN** the page renders two outline pill buttons labeled "Wishlist" and "Share" with heart and share icons, styled using `{colors.ink}` border `#cacacb` text, hover background `{colors.soft-cloud}` `#f5f5f5`, and `{rounded.full}` (matching the existing design tokens in `DESIGN.md`)

### Requirement: Wishlist action toggles membership in the persisted wishlist

The Wishlist button SHALL add the current product to the client-side wishlist store when not present, remove it when already present, and display feedback. State MUST persist across page reloads in the same browser.

#### Scenario: First click adds product to wishlist

- **WHEN** a user clicks "Wishlist" on a product that is not in their wishlist
- **THEN** the product id is added to the persisted wishlist
- **AND** a confirmation toast is displayed

#### Scenario: Subsequent click removes product from wishlist

- **WHEN** a user clicks "Wishlist" on a product that is already in their wishlist
- **THEN** the product id is removed from the persisted wishlist
- **AND** a removal toast is displayed

#### Scenario: Wishlist state survives page reload

- **WHEN** a user adds a product to the wishlist and reloads the page or revisits the product later
- **THEN** the Wishlist button reflects the persisted state (added vs. not added) on first paint

### Requirement: Share action shares or copies the product URL

The Share button SHALL share the current product's canonical URL. When the Web Share API is available, it MUST use `navigator.share`; otherwise it MUST copy the URL to the clipboard and display a confirmation toast.

#### Scenario: Share uses Web Share API when available

- **WHEN** a user clicks "Share" in a browser that supports `navigator.share`
- **THEN** the native share sheet is opened with the product name as the title and the product URL as the share target

#### Scenario: Share falls back to clipboard copy

- **WHEN** a user clicks "Share" in a browser that does not support `navigator.share` (or when the share sheet is unavailable)
- **THEN** the product URL is written to the clipboard
- **AND** a confirmation toast is displayed

### Requirement: Product actions are accessible

The Wishlist and Share buttons SHALL be reachable by keyboard, announce their purpose to assistive technology, and announce their state changes.

#### Scenario: Keyboard activation

- **WHEN** a user tabs to the Wishlist or Share button and presses `Enter` or `Space`
- **THEN** the corresponding action is triggered identically to a mouse click

#### Scenario: State is announced

- **WHEN** the wishlist state of a product changes
- **THEN** the button's accessible name reflects the current state (e.g. "Remove from wishlist" vs. "Add to wishlist") so screen reader users perceive the change
