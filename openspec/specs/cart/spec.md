# Cart

## Purpose
This spec defines the shopping cart behavior for the e‑commerce platform. The cart allows authenticated and guest users to collect products before proceeding to checkout. Cart data SHALL persist across page reloads.

## Requirements

### Requirement: Add Item to Cart

Users MUST be able to add a product to the cart. If the product is already in the cart, the quantity SHALL be increased by the specified amount. The default quantity for a new item SHALL be 1.

#### Scenario: Add a new product to an empty cart

- **GIVEN** The user is viewing a product detail page
- **AND** The cart is empty
- **WHEN** The user clicks the "Add to Cart" button with quantity 1
- **THEN** The product is added to the cart with quantity 1
- **AND** The cart count badge updates to display "1"

#### Scenario: Add a product that is already in the cart

- **GIVEN** The user has a product in the cart with quantity 2
- **WHEN** The user adds the same product again with quantity 3
- **THEN** The product quantity in the cart updates to 5 (2 + 3)
- **AND** The cart count badge updates to reflect the new total

#### Scenario: Add product with custom quantity

- **GIVEN** The user is viewing a product detail page
- **WHEN** The user sets the quantity to 5 and clicks "Add to Cart"
- **THEN** The product is added to the cart with quantity 5

### Requirement: View Cart Contents

Users MUST be able to view the contents of their cart. The cart SHALL display each item's name, image, quantity, unit price, and subtotal (price × quantity). The grand total SHALL be displayed at the bottom.

#### Scenario: View cart in the sheet (slide‑over)

- **GIVEN** The user has items in the cart
- **WHEN** The user clicks the cart icon in the header
- **THEN** A sheet slides open from the side
- **AND** All cart items are listed with their name, quantity, unit price, and subtotal
- **AND** The grand total is displayed at the bottom
- **AND** "Continue Shopping" and "Checkout" buttons are visible

#### Scenario: View cart on the dedicated cart page

- **GIVEN** The user has items in the cart
- **WHEN** The user navigates to `/cart`
- **THEN** All cart items are displayed in a list
- **AND** Each item shows name, image, quantity controls, unit price, and subtotal
- **AND** The grand total is displayed in a summary card
- **AND** A "Proceed to Checkout" button is visible

#### Scenario: Empty cart view

- **GIVEN** The cart has no items
- **WHEN** The user opens the cart sheet or navigates to `/cart`
- **THEN** A friendly empty state message is displayed (e.g., "Your cart is empty")
- **AND** A "Browse Products" button is shown to encourage shopping

### Requirement: Update Item Quantity

Users MUST be able to increase or decrease the quantity of an item in the cart. When quantity is reduced to zero, the item SHALL be removed from the cart.

#### Scenario: Increase item quantity

- **GIVEN** The user has an item in the cart with quantity 2
- **WHEN** The user clicks the "+" (increase) button
- **THEN** The item quantity updates to 3
- **AND** The subtotal and grand total recalculate automatically

#### Scenario: Decrease item quantity (still positive)

- **GIVEN** The user has an item in the cart with quantity 3
- **WHEN** The user clicks the "−" (decrease) button
- **THEN** The item quantity updates to 2
- **AND** The subtotal and grand total recalculate automatically

#### Scenario: Decrease item quantity to zero removes the item

- **GIVEN** The user has an item in the cart with quantity 1
- **WHEN** The user clicks the "−" (decrease) button
- **THEN** The item is removed from the cart

### Requirement: Remove Item from Cart

Users MUST be able to remove an item from the cart using a "Remove" or trash icon button. After removal, the user SHALL have the option to undo the removal for a short period.

#### Scenario: Remove item using trash button

- **GIVEN** The user has an item in the cart
- **WHEN** The user clicks the trash icon next to the item
- **THEN** The item is removed from the cart
- **AND** The cart count and totals update immediately
- **AND** An "Undo" toast notification appears for a short duration (e.g., 3 seconds)

#### Scenario: Undo removal of an item

- **GIVEN** The user has just removed an item from the cart
- **AND** The "Undo" toast notification is visible
- **WHEN** The user clicks the "Undo" button
- **THEN** The removed item is restored to the cart with its previous quantity
- **AND** The cart count and totals revert to their previous state

#### Scenario: Undo expires automatically

- **GIVEN** The user has just removed an item from the cart
- **WHEN** The "Undo" toast notification times out (expires) without user action
- **THEN** The item remains removed
- **AND** The toast disappears

### Requirement: Cart Persistence

The cart state SHALL persist across page reloads and browser sessions. Users who close and reopen the browser SHALL find their cart items intact.

#### Scenario: Cart persists after page reload

- **GIVEN** The user has items in the cart
- **WHEN** The user refreshes the browser page
- **THEN** The cart items, quantities, and totals remain unchanged

#### Scenario: Cart persists after closing and reopening browser

- **GIVEN** The user has items in the cart
- **WHEN** The user closes the browser tab and later reopens the site
- **THEN** The cart items, quantities, and totals are restored

### Requirement: Cart Total Calculation

The system MUST automatically calculate the total price of the cart as the sum of `(item.price × item.quantity)` for all items. The total SHALL update immediately whenever an item is added, removed, or quantity changes.

#### Scenario: Calculate total for multiple items

- **GIVEN** The cart contains:
  - Product A: price 100,000 Toman, quantity 2
  - Product B: price 50,000 Toman, quantity 1
- **WHEN** The user views the cart
- **THEN** The grand total is displayed as 250,000 Toman (100,000×2 + 50,000×1)

#### Scenario: Total updates when quantity changes

- **GIVEN** The user has Product A (100,000 Toman × 2) in the cart
- **WHEN** The user increases the quantity to 3
- **THEN** The grand total updates from 200,000 Toman to 300,000 Toman

### Requirement: Cart Count Badge

The system SHALL display a count badge on the cart icon in the header. The badge SHALL show the total number of items (sum of all quantities), not the number of unique products.

#### Scenario: Cart count badge displays total quantity

- **GIVEN** The cart contains Product A (quantity 2) and Product B (quantity 3)
- **WHEN** The user views the header
- **THEN** The cart badge displays "5" (2 + 3)

#### Scenario: Cart count badge updates on add/remove

- **GIVEN** The cart badge currently displays "3"
- **WHEN** The user adds a product with quantity 2
- **THEN** The cart badge updates to "5"

#### Scenario: Cart count badge disappears when empty

- **GIVEN** The cart is empty
- **WHEN** The user views the header
- **THEN** No badge is displayed on the cart icon

### Requirement: Clear Cart on Checkout

The cart MUST be cleared automatically after a successful order placement. This prevents the user from being charged again for the same items.

#### Scenario: Cart clears after successful order

- **GIVEN** The user has items in the cart
- **WHEN** The user successfully places an order
- **THEN** The cart is cleared
- **AND** The cart count badge updates to show "0"
- **AND** The user is redirected to the order confirmation page

#### Scenario: Cart remains intact if order fails

- **GIVEN** The user has items in the cart
- **WHEN** The order placement fails (e.g., validation error, server error)
- **THEN** The cart items remain unchanged
- **AND** The user can retry checkout without re‑adding items

### Requirement: Add to Cart Feedback

Users MUST receive visual feedback when an item is added to the cart. The "Add to Cart" button SHALL temporarily change to indicate success.

#### Scenario: Button feedback on add

- **GIVEN** The user is on a product detail page
- **WHEN** The user clicks the "Add to Cart" button
- **THEN** The button text briefly changes to "Added" or shows a checkmark icon
- **AND** After a short delay (e.g., 1.5 seconds), the button reverts to its original state
