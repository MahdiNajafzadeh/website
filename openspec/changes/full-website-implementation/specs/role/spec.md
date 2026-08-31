## ADDED Requirements

### Requirement: RBAC enforced via Payload access and (app) middleware with DESIGN tokens

Roles `admin`/`employee`/`customer` SHALL be enforced via Payload `access` functions and `src/app/(app)` middleware/guards. Admin has full access, employee restricted from `site-settings` and user-role writes, customer blocked from `/admin` (redirect to `/`). UI for forbidden states SHALL use `shadcn` Alert with `{colors.sale}` and `{typography.body-md}`.

#### Scenario: Customer blocked from admin
- **WHEN** a `customer` navigates to `/admin`
- **THEN** Payload access denies and `src/app/(app)` guard redirects to `/` with an alert using `{colors.sale}`

#### Scenario: Employee blocked from site-settings
- **WHEN** an employee attempts `PATCH /api/globals/site-settings`
- **THEN** the API returns 403 and the UI shows `{colors.mute}` permission notice
