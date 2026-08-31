## Why

The current registration flow on the website requires (or appears to require) an email address even though the project's spec and design already declare **phone as the primary authentication identifier**. The register form works around Payload's built-in `email` requirement by silently synthesizing a placeholder `${phone}@placeholder.local` so the user "passes" auth — but that synthetic email is junk data in the database, surfaces in admin listings, and will break any future flow that tries to email a real user. For local development and demo testing it is friction: testers who don't want to invent an email can't proceed cleanly. This change removes the email requirement from the auth/registration surface entirely so phone is the single user-facing identifier, while keeping email-related contact data on the public site (`site-settings.emails`, contact page) untouched.

## What Changes

- **Remove the `email` input and all email-related state from the register form** (`src/app/(app)/register/page.tsx`). The form only asks for first name, last name, phone, password, and (optional) address.
- **Stop synthesizing the `${phone}@placeholder.local` placeholder email** when registering. The `POST /api/users` body no longer carries `email`.
- **Override Payload's built-in `email` field on the `Users` collection** to make it truly optional at the DB/auth layer (`required: false`, hidden from admin list views). If Payload rejects auth collection updates without an `email` row, the field is kept as a non-validated `text` and access-controlled so it can be omitted on create.
- **Switch the register auto-login to authenticate by `phone` + `password`** instead of the synthetic `email` + `password`. This requires either a custom Payload endpoint, a `beforeLogin` hook that resolves `phone` → user, or a custom `auth.strategies` entry — see `design.md` for the chosen approach.
- **Simplify the login form** (`src/app/(app)/login/page.tsx`): identifier label becomes "Phone", placeholder becomes the phone example, and the request body sends `{ phone, password }` (no `email` fallback).
- **No changes** to `site-settings.emails`, the contact page, the customer collection, the admin panel footer, or any other public-facing email surface.
- **No migration** of existing placeholder rows in this change; a follow-up migration task can null them out.

## Capabilities

### New Capabilities

_None._ No new spec capability is being introduced — phone-only auth is already the declared intent in `specs/user`.

### Modified Capabilities

- `user`: The "User Registration Fields" requirement changes — the optional email field and the "email" identifier on the registration form are removed; registration and auto-login are phone + password only. The `address` optional behavior is preserved. The "User Profile Display" requirement loses any reference to email.
- `auth`: The "Phone Number for Authentication" requirement is strengthened to make phone the **sole** identifier accepted by `/api/users/login`; the current dual (phone || email) fallback is dropped.

## Impact

- **Code**:
  - `src/collections/Users.ts` — override `email` field (`required: false`, optional `access`), keep `phone` as `useAsTitle`; consider `auth.loginWithUsername` or a custom login strategy/endpoint.
  - `src/app/(app)/register/page.tsx` — remove `email` state, input, validation, and placeholder-synthesis; update submit body and success copy.
  - `src/app/(app)/login/page.tsx` — remove `email` branch in submit handler, change label/placeholder to "Phone" only.
  - `src/app/(app)/middleware.ts` (if present) — confirm any auth check still works once `req.user.email` may be undefined; tests that read `user.email` need to switch to `user.phone`.
- **API**:
  - `POST /api/users` — accept payloads without `email`.
  - `POST /api/users/login` — accept `{ phone, password }`; reject `{ email, password }` (or pass through if a real email was set).
- **Database**:
  - `users.email` becomes nullable / not required. Existing rows with `null` are valid. Placeholder `${phone}@placeholder.local` rows remain until a separate cleanup pass — they do not break this change.
- **Dependencies / tools**: Payload CMS 3.88 default local strategy will likely need to be replaced or augmented with a phone-based strategy; if Payload cannot be made to accept login without an email, a custom endpoint at `POST /api/users/login` is added via collection `endpoints` and Payload's built-in endpoint is overridden (see `design.md`).
- **Tests**: Vitest suite that hits login (`Users.test.ts`) and any Playwright e2e that fills the register form must drop the email step.
- **Design tokens**: No visual changes to colors, typography, spacing, or radii — form layout stays the same; only one `<label>`/`<input>` block is deleted and the submit error/success states are reused.
- **Out of scope**: customer accounts, contact page, site settings, newsletter, password reset emails (none exist yet).
