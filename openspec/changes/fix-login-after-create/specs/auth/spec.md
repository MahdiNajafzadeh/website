## ADDED Requirements

### Requirement: Auto-login After Registration

The system MUST automatically authenticate a user immediately after successful registration so that the resulting session is indistinguishable from a normal `POST /api/users/login` flow. Registration at `src/app/(app)/register/page.tsx` SHALL result in a valid `payload-token` cookie (httpOnly, `tokenExpiration: 86400`) and an authenticated `req.user` without requiring the user to visit `src/app/(app)/login/page.tsx`.

#### Scenario: Register then browse as authenticated user

- **GIVEN** A user has just registered via `POST /api/users` at `src/app/(app)/register`
- **WHEN** The client follows the success path (server hook sets cookie or client fallback `POST /api/users/login` with `credentials: "include"` completes) and navigates to `/` via `router.push(nextParam)` and `router.refresh()`
- **THEN** The home page shows the avatar/authenticated header
- **AND** `GET /api/users/me` returns 200 with the new user's id

#### Scenario: Auto-login survives refresh

- **GIVEN** A user has just registered and been auto-logged in
- **WHEN** The user refreshes the home page at `src/app/(app)/page.tsx`
- **THEN** The session remains valid (cookie persists)
- **AND** The user is still shown as logged in

#### Scenario: Registration auto-login uses E.164 normalization

- **GIVEN** A user registers with a national-format phone `09123456789`
- **WHEN** The server stores the username as E.164 `+989123456789`
- **THEN** The auto-login step normalizes the login identifier identically before calling `payload.login`
- **AND** Login does not fail due to format mismatch

#### Scenario: Login hook failure does not block registration

- **GIVEN** Registration via `POST /api/users` succeeds
- **WHEN** The server-side `loginAfterCreate` hook encounters an error (e.g., transient payload login failure)
- **THEN** The user document is still created (HTTP 201)
- **AND** The client fallback `POST /api/users/login` establishes the session so the user is still logged in automatically

## MODIFIED Requirements

### Requirement: Login

Users MUST be able to log in to their account. Users SHALL be able to view public information on the site without logging in. The login mechanism uses phone number (`username` field, E.164 normalized) and password via `POST /api/users/login`.

#### Scenario: Login success with valid credentials

- **GIVEN** The user is on the login page at `src/app/(app)/login/page.tsx`
- **AND** The user has a valid mobile number and password
- **WHEN** The user submits the login form
- **THEN** The system authenticates the user via `POST /api/users/login`
- **AND** The user is redirected to the page they were viewing before login

#### Scenario: Login success redirects to previous page

- **GIVEN** The user is viewing a product page
- **AND** The user is not authenticated
- **WHEN** The user completes the login process successfully
- **THEN** The user is redirected back to the product page

#### Scenario: Login fails with incorrect credentials

- **GIVEN** The user is on the login page
- **AND** The user has filled in the mobile number and password fields
- **WHEN** The user submits the login form with an incorrect mobile number or password
- **THEN** The system rejects the login attempt
- **AND** A clear error message is displayed indicating that either the mobile number or password is incorrect
