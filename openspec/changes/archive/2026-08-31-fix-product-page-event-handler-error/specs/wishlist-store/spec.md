## Purpose

Provides a client-side, browser-persisted wishlist store that holds the set of products a shopper has saved, so Wishlist UI (e.g. the product detail page) can read and mutate membership without a round-trip to the server.

## ADDED Requirements

### Requirement: Persisted wishlist of product ids

The system SHALL expose a client-side wishlist store that holds a set of product ids the shopper has saved, persisted to `localStorage` under a stable key, and that survives page reloads in the same browser.

#### Scenario: Adding an id to an empty wishlist

- **WHEN** a shopper adds a product id that is not already in the wishlist
- **THEN** the store contains exactly that id
- **AND** the change is persisted to `localStorage`

#### Scenario: Adding a duplicate id is a no-op

- **WHEN** a shopper adds a product id that is already in the wishlist
- **THEN** the store still contains exactly one entry for that id (no duplicates)

#### Scenario: Removing an id

- **WHEN** a shopper removes a product id that is in the wishlist
- **THEN** the store no longer contains that id
- **AND** the change is persisted to `localStorage`

#### Scenario: Persistence across reloads

- **WHEN** a shopper has added ids to the wishlist, reloads the page, and inspects the store
- **THEN** the store contains the same ids that were present before the reload

### Requirement: Store exposes query helpers

The store SHALL expose a way to check whether a given product id is in the wishlist and a way to clear the wishlist.

#### Scenario: Membership check

- **WHEN** a UI component queries whether a product id is in the wishlist
- **THEN** the store returns `true` if the id is present and `false` otherwise

#### Scenario: Clear wishlist

- **WHEN** the store's `clear` action is invoked
- **THEN** the wishlist becomes empty
- **AND** the change is persisted to `localStorage`

### Requirement: Store is browser-only

The store SHALL be safe to import in a Client Component context and SHALL NOT attempt to access `localStorage` or `window` during server rendering.

#### Scenario: Import on the server does not throw

- **WHEN** a Server Component imports the wishlist store module
- **THEN** the import resolves without throwing and without reading `localStorage`
- **AND** accessing store state from a Server Component throws a clear error indicating that the store is client-only
