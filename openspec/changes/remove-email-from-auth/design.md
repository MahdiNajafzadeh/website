## Context

Payload CMS 3.88's auth collection always injects an `email` field by default when `auth: true` is set on a collection, and its built-in `POST /api/users/login` endpoint authenticates by `email` + `password`. The current `Users` collection (`src/collections/Users.ts`) already uses `phone` as `useAsTitle` and has phone-based validation, but the underlying auth still keys on `email`. The register page (`src/app/(app)/register/page.tsx`) and login page (`src/app/(app)/login/page.tsx`) work around this by:

- On register: synthesizing a `${phone}@placeholder.local` "email" and posting it to `/api/users` so Payload's create endpoint accepts the row.
- On login: trying to log in with `email` (and `phone` as a parallel field, which Payload currently ignores).

This change removes those workarounds and makes phone the only identifier the user ever sees, sends, or has stored. See `proposal.md` (Why) and `specs/user/`, `specs/auth/` for what the system must do.

## Goals / Non-Goals

**Goals:**

- The `Users` collection stores users with `phone` as the only required identifier; `email` is absent or non-required.
- `POST /api/users/login` accepts `{ phone, password }` and returns a session; the user never types or sees an email.
- The register form does not display, validate, or submit an `email` field.
- The login form labels the identifier field "Phone" and submits `{ phone, password }`.
- All existing tests that hit the auth endpoints are updated to use phone.
- No other surface (site-settings, contact page, customer collection, admin panel layout) is touched by this change.

**Non-Goals:**

- No migration of existing placeholder `${phone}@placeholder.local` rows (separate cleanup task).
- No changes to site-settings contact emails, contact page, or any non-auth email surface.
- No password reset / email-verification flow changes (none exist yet).
- No change to role/customerType/access rules in `Users.ts`.
- No change to `tokenExpiration` (still 24h) or session strategy.
- No new third-party auth provider.

## Decisions

### Decision 1: Override the default `email` field on the `Users` collection

We add a custom `email` field in `Users.ts` with `required: false`, `index: false`, and `admin: { hidden: true }` so Payload's default email field is overridden. Combined with the unique-index removal (Payload only creates a unique index on the default `email` field), this lets us create a user without supplying an `email`.

- **Why**: Payload's docs explicitly support overriding default auth fields (including `email`) by re-declaring them with the same `name`. This is the smallest-blast-radius change that satisfies "email optional".
- **Alternatives considered**:
  - `auth.disableLocalStrategy: true` + `useAPIKey: true` — would also disable the password-based login we still want. Rejected.
  - Drop `auth: true` entirely and roll a custom user table — far more work, breaks Payload admin and access-control helpers. Rejected.
  - Add a `beforeValidate` hook to silently strip `email` on create — leaves the field in the schema and confuses admin. Rejected.

### Decision 2: Replace the built-in `/api/users/login` endpoint with a custom phone-keyed login

We override the default Payload login endpoint by adding a custom endpoint on the `Users` collection with the same `POST /api/users/login` route. Inside the handler we look up the user by `phone` (`payload.find({ collection: 'users', where: { phone: { equals: input.phone } } })`), verify the password with `payload.auth.strategies.local.verify`, and set the JWT cookie via `Response.headers` + `req.payload.auth()`.

- **Why**: Payload's default login routes on `email` and there is no `auth.loginWithUsername`-style option for `phone`. The custom endpoint is the only way to keep the built-in `auth` machinery (hashing, sessions, `req.user`) while authenticating on a different field.
- **Alternatives considered**:
  - `auth.loginWithUsername: true` with phone as the "username" — would still require a `username` field on the user and Payload's `auth.verify` only accepts `{ user, password }` keyed on the username field. Closer to working, but the payload docs show it expects a `username` field, not `phone`. Rejected as it would require renaming our field.
  - Add a `beforeLogin` hook that swaps `email` for the user's `email` based on `phone` in the body — fragile because Payload's built-in `/login` reads `email` before hooks run on some code paths. Rejected.
  - Use `auth.strategies` to add a custom strategy — possible in 3.88 but requires hand-rolling JWT issuance and cookie setting, duplicating Payload internals. The custom endpoint is simpler and keeps Payload as the source of truth for password hashing.

### Decision 3: Drop the `email` state and input from both auth forms

`src/app/(app)/register/page.tsx` and `src/app/(app)/login/page.tsx` are updated to remove the `email` `useState`, the `<input type="email">`, the email validation, and the placeholder-synthesis logic. The register submit body no longer carries `email`; the login submit body sends `{ phone, password }` only.

- **Why**: Specs require no email in either form. Form-level changes are isolated to these two files.
- **Alternatives considered**:
  - Keep an "email (optional)" field in the register form for future use — explicitly rejected by the proposal and specs. Rejected.

### Decision 4: Add a small re-export shim for `req.user` consumers that read `email`

Any server code (middleware, server components, server actions) that reads `user.email` needs to switch to `user.phone`. We do not add a fallback — `phone` is the canonical identifier.

- **Why**: Avoids lingering references to a field users can no longer set, keeping the type system honest.
- **Alternatives considered**:
  - Add a `getUserIdentifier(user)` helper that returns `user.phone` — overkill for a one-line replacement. Rejected.

### Decision 5: Styling stays on the existing form shell

No new `shadcn` or `@beui` component is added. The two removed `<label>`/`<input>` blocks free up vertical space; the form keeps `{rounded.md}` inputs, `{rounded.full}` CTA, `{colors.ink}` button, `{typography.heading-xl}` title, and `{colors.mute}` helper text already in use. `DESIGN.md` is consulted but no token change is required.

- **Why**: Specs only require removal of the email field; visual regression is the highest risk. Reusing existing styles keeps the diff minimal.
- **Alternatives considered**:
  - Swap to a shadcn `<Field>` for consistency with newer forms — out of scope; both forms are already tested. Rejected.

## Risks / Trade-offs

- **[Risk] Payload rejects `POST /api/users` with a body that has no `email` if the overridden field still enforces a unique-index constraint** → Mitigation: confirm the override removes the implicit `unique` index; if it doesn't, add a `db.indexes` config that drops the unique index on `email`.
- **[Risk] Payload's built-in `/api/users/login` is still registered and might race with the custom one** → Mitigation: declare the custom endpoint in `Users.ts` `endpoints` array *before* Payload's defaults; Payload's endpoint matcher uses the user-provided endpoint first (per the docs).
- **[Risk] The admin panel still shows an `email` field on the User edit screen** → Mitigation: set `admin.hidden` on the overridden field, and update the `list` view's `useAsTitle` (already `phone`).
- **[Risk] Existing `Users` test suite expects `email` in the login body** → Mitigation: update the test inputs to `phone` and the asserted user identifier to `phone`; verify with `bunx --bun vitest run src/collections/Users.test.ts`.
- **[Risk] Placeholder `${phone}@placeholder.local` rows linger in the DB and confuse admin** → Mitigation: documented as a separate follow-up migration; this change does not require removing them.
- **[Trade-off] Removing the built-in `email`-based login removes an out-of-the-box Payload feature and trades it for ~30 lines of custom endpoint code** → acceptable: phone-based auth is the project's declared direction and the custom endpoint is small enough to own.

## Migration Plan

1. Land the code changes (collection override + custom endpoint + form edits) behind a single PR.
2. Run `bun run generate:types` so `User` type drops the required `email` flag.
3. Run `bunx --bun vitest run` for the auth tests; the suite must be green with phone-based inputs.
4. Manual smoke test in `bun run dev`:
   - `POST /register` with no email → user is created, auto-login works, redirect succeeds.
   - `POST /login` with phone + password → user is logged in, redirect succeeds.
   - `GET /admin/collections/users` → no email column shown, `phone` is the title.
5. Rollback: revert the PR. Existing placeholder rows in the DB are unaffected (we never delete or migrate data in this change), so a revert is safe.
6. Follow-up (out of scope here): a `bun run payload migrate:cleanup-placeholder-emails` script to null out `${phone}@placeholder.local` rows in `users.email`.

## Open Questions

_None._ All material ambiguities (scope = auth only; identifier = phone; behavior on missing email = accept) are settled in the proposal and specs.
