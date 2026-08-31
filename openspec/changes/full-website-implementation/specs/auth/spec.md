## ADDED Requirements

### Requirement: Auth frontend routes live under src/app/(app) with design tokens

The system SHALL implement all auth UI exclusively under `src/app/(app)` (route group) using `shadcn`/`beui` components styled via `DESIGN.md` tokens. Login, logout, and session states SHALL follow the existing `auth` spec scenarios but rendered through `(app)` routes with `{colors.ink}`, `{colors.canvas}`, `{typography.button-md}`, `{rounded.full}`, and `{component.button-primary}` tokens.

#### Scenario: Login page renders under (app) group
- **WHEN** an unauthenticated user navigates to `src/app/(app)/login/page.tsx` (`/login`)
- **THEN** the page renders a `shadcn` form (or `@beui` equivalent) using `{colors.canvas}` background and `{component.button-primary}` for submit, and on success redirects to the previous `(app)` route per spec

#### Scenario: Session expiry surfaces via (app) middleware
- **WHEN** a session exceeds 24h inactivity
- **THEN** `src/app/(app)` middleware clears the auth cookie and redirects to `/login` with return URL, styled with `{colors.mute}` notice text
