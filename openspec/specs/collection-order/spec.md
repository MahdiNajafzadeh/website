# Order Collection

## Purpose
This spec defines the behavior and lifecycle of orders within the e‑commerce platform. Orders are created by authenticated customers and processed by employees through a defined workflow.

## Requirements

### Requirement: Order Creation

Authenticated users MUST be able to create an order from their cart. The order SHALL capture the customer's shipping address, selected items with their quantities and prices, and a calculated total.

#### Scenario: Customer places an order successfully

- **GIVEN** An authenticated customer has a non‑empty cart
- **AND** The customer is on the checkout page
- **WHEN** The customer fills in the shipping address and submits the order
- **THEN** The system creates a new order with status `review`
- **AND** The order total is calculated automatically
- **AND** The cart is cleared
- **AND** The customer is redirected to the order confirmation page

#### Scenario: Customer places an order with zero‑priced items

- **GIVEN** An authenticated customer has a cart containing one or more items with a price of `0`
- **WHEN** The customer submits the order
- **THEN** The system creates a new order with status `review`
- **AND** The order total is calculated as `0` (or based on other items)
- **AND** A flag or note is added to the order indicating that it contains zero‑priced items requiring manual review

### Requirement: Order Status Lifecycle

Each order SHALL transition through a defined set of statuses: `review` → `approved` → `preparing` → `delivered`. The system MUST enforce that status transitions occur in the correct order (except for cancellation, which can happen at any stage).

| Status        | Description |
|---------------|-------------|
| `review`      | Initial state. The order is being verified by an employee. |
| `approved`    | Order has been approved for fulfillment. |
| `preparing`   | Order is being picked, packed, and prepared for shipment. |
| `delivered`   | Order has been delivered to the customer. |
| `cancelled`   | Order has been cancelled (can be initiated by employee or customer under certain conditions). |

#### Scenario: Order moves from review to approved

- **GIVEN** An employee is viewing an order with status `review`
- **WHEN** The employee approves the order (e.g., confirms inventory and pricing)
- **THEN** The order status updates to `approved`
- **AND** The customer is notified via SMS or in‑app notification

#### Scenario: Order moves from approved to preparing

- **GIVEN** An employee is viewing an order with status `approved`
- **WHEN** The employee marks the order as being prepared
- **THEN** The order status updates to `preparing`

#### Scenario: Order moves from preparing to delivered

- **GIVEN** An employee is viewing an order with status `preparing`
- **WHEN** The employee marks the order as delivered
- **THEN** The order status updates to `delivered`
- **AND** The customer is notified via SMS or in‑app notification

#### Scenario: Order is cancelled

- **GIVEN** An employee or customer has permission to cancel
- **WHEN** A cancellation is requested (and reasons are provided, if required)
- **THEN** The order status updates to `cancelled`
- **AND** The order is removed from active processing lists
- **AND** The customer is notified of the cancellation via SMS or in‑app notification (if initiated by employee)

### Requirement: Zero‑Price Item Review

When an order contains any item with a price of `0`, the system MUST set the order status to `review` and SHALL allow employees to investigate and contact the customer before approving.

#### Scenario: Employee reviews a zero‑price order

- **GIVEN** An order exists with status `review` and contains zero‑priced items
- **WHEN** An employee opens the order detail
- **THEN** The zero‑priced items are highlighted or flagged
- **AND** The employee can add notes about the review process

#### Scenario: Employee approves a zero‑price order after manual confirmation

- **GIVEN** An employee has reviewed a zero‑price order and confirmed the pricing with the customer
- **WHEN** The employee updates the order status to `approved`
- **THEN** The order proceeds to the next stage

#### Scenario: Employee rejects a zero‑price order

- **GIVEN** An employee determines that a zero‑price order cannot be fulfilled
- **WHEN** The employee updates the order status to `cancelled`
- **THEN** The order is cancelled
- **AND** The customer is notified via SMS or in‑app notification with the reason

### Requirement: Order Total Calculation

The system MUST automatically calculate the total of an order as the sum of `(item.quantity * item.price)` for all items. The total SHALL be recalculated whenever an item's price or quantity changes.

#### Scenario: Order total is calculated on creation

- **GIVEN** A customer adds items to the cart with prices and quantities
- **WHEN** The order is submitted
- **THEN** The `total` field is set to the sum of all `(price × quantity)`

#### Scenario: Order total is recalculated when an item price is updated by employee

- **GIVEN** An employee updates the price of an item in an existing order
- **WHEN** The change is saved
- **THEN** The order total is recalculated
- **AND** The new total is displayed

### Requirement: Order Item Snapshot

The system MUST store a snapshot of each item's name, price, and quantity at the time of order placement. Changes to the product catalog (e.g., product name, price updates) SHALL NOT affect existing orders.

#### Scenario: Product price changes after order placement

- **GIVEN** A product price is updated in the catalog after an order has been placed
- **WHEN** The customer views their order history
- **THEN** The order still shows the original price at the time of purchase

### Requirement: Order History for Customers

Authenticated customers MUST be able to view a list of their past orders with status and total amounts.

#### Scenario: Customer views all orders

- **GIVEN** A customer has placed multiple orders
- **WHEN** The customer navigates to their orders page (`/orders`)
- **THEN** A list of orders is displayed, sorted by creation date (newest first)
- **AND** Each order shows: order ID, creation date, status, and total

#### Scenario: Customer views order details

- **GIVEN** A customer clicks on a specific order
- **WHEN** The order detail page loads
- **THEN** The full order details are displayed, including items, shipping address, and order status history

### Requirement: Order Management for Employees

Employees SHALL have full read/write access to orders via the admin panel.

#### Scenario: Employee views all orders

- **GIVEN** An authenticated employee is in the admin panel
- **WHEN** The employee navigates to the orders list
- **THEN** All orders are displayed with filters by status, customer, and date range

#### Scenario: Employee changes order status

- **GIVEN** An employee is viewing an order detail
- **WHEN** The employee selects a new status from the dropdown and saves
- **THEN** The order status updates
- **AND** The change is logged in the order history

### Requirement: Order Notes

Employees MUST be able to add internal notes to an order. These notes SHALL NOT be visible to customers.

#### Scenario: Employee adds a note to an order

- **GIVEN** An employee is viewing an order detail
- **WHEN** The employee writes a note (e.g., "Call customer about address change") and saves
- **THEN** The note is attached to the order
- **AND** The note is visible only to other employees

### Requirement: Customer Notification on Order Status Change

The system SHALL notify customers when their order status changes. Notifications SHALL be sent via SMS (using the customer's phone number) or through in‑app notifications.

#### Scenario: Customer receives SMS when order is approved

- **GIVEN** An order status changes from `review` to `approved`
- **WHEN** The change is saved
- **THEN** The system sends an SMS to the customer's phone number
- **AND** The SMS contains the order ID and the new status ("تایید شد")

#### Scenario: Customer receives SMS when order is delivered

- **GIVEN** An order status changes from `preparing` to `delivered`
- **WHEN** The change is saved
- **THEN** The system sends an SMS to the customer's phone number
- **AND** The SMS contains the order ID and a delivery confirmation message

#### Scenario: Customer receives SMS when order is cancelled by employee

- **GIVEN** An employee cancels an order
- **WHEN** The cancellation is saved
- **THEN** The system sends an SMS to the customer's phone number
- **AND** The SMS includes the order ID and the cancellation reason (if provided)
