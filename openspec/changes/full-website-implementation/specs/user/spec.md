## ADDED Requirements

### Requirement: User collection uses phone auth under (app) with DESIGN tokens

`users` collection extensions (`firstName`, `lastName`, `phone` unique + `09xxxxxxxxx` validation, `address`, `role`, `customerType`) SHALL follow payload skill conventions and be consumed by `src/app/(app)/account/page.tsx` and `src/app/(app)/checkout/page.tsx` forms. UI SHALL use `shadcn` Form/Input and verified `beui` fields, styled with `{colors.ink}`, `{colors.canvas}`, `{colors.hairline}`, `{typography.body-md}`, `{rounded.lg}`. Auth uses phone+password via Payload `auth`.

#### Scenario: Registration validates Iranian mobile
- **WHEN** a user submits registration at `src/app/(app)/register/page.tsx` with phone `09123456789`
- **THEN** validation passes and user is created with `role=customer`, `customerType=regular`; phone `02112345678` fails with `{colors.sale}` error message

#### Scenario: Account page shows phone read-only
- **WHEN** an authenticated user navigates to `/account` via `src/app/(app)/account/page.tsx`
- **THEN** firstName/lastName/address are editable via `shadcn` Form while phone is displayed read-only with `{colors.mute}` label
