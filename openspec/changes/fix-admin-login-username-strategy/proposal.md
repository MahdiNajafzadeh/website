## Why

After Payload's built-in `create-first-user` action creates the very first admin user, the admin panel renders its default login form (Payload still keys on `email`/`username` for its own `/login` endpoint). Because `src/collections/Users.ts` overrides `POST /api/users/login` with a custom `phoneLogin` endpoint that only accepts `{ phone, password }`, an admin who tries to log in with their admin-panel credentials gets the generic auth error "Phone Number or Password is wrong." (the custom handler rejects the body because `phone` is missing). The fix is to stop overriding the login endpoint and switch the `Users` collection to Payload's `loginWithUsername` strategy, with `phone` as the `username` value, so the default admin login form, Payload's `create-first-user` action, and the public `/login` page all share one identifier and one auth code path.

## What Changes

- **Switch `Users.auth` to `loginWithUsername: true`** in `src/collections/Users.ts` so Payload's built-in `POST /api/users/login` accepts `{ username, password }` (and its admin login form shows a "Username" field instead of "Email").
- **Treat `phone` as the `username`** by adding a `username` field to `Users` populated from `phone` via a `beforeValidate` hook (copies `phone` into `username`, also runs on Payload's `create-first-user` path). The `username` field is `unique`, `required`, `index: true`, `admin.hidden`, and `readOnly`.
- **Remove the custom `phoneLogin` and `phoneCreate` endpoints** (`endpoints: [phoneCreate, phoneLogin]`) from `Users.ts`. Payload's default local strategy handles login; the public register flow uses `payload.create({ collection: 'users', data })` via a new `register` endpoint (or, if simpler, a `beforeOperation` rewrite to `payload.create`).
- **Rewrite the public register endpoint** so the front-end can still auto-login after registration: a small `POST /api/users/register` endpoint that calls `payload.create` for the user (which now also writes `username` via the hook) and then `payload.login` with `{ username, password }` using the built-in strategy, returning the cookie Payload sets.
- **Update `src/app/(app)/register/page.tsx`** to POST to the new `/api/users/register` endpoint and rely on the response's cookie (no second `/login` fetch needed).
- **Update `src/app/(app)/login/page.tsx`** to send `{ username, password }` (the phone value) to `POST /api/users/login` instead of `{ phone, password }`.
- **Override the admin `createFirstUser` view** (Payload's built-in `authentication:createFirstUser` route) so the first admin can be created with a phone number — the override renders phone + password + role fields, calls the same register endpoint or a dedicated `firstUser` endpoint, then signs the admin in via Payload's local strategy.
- **No changes** to `site-settings.emails`, the contact page, the customer collection, role/customerType/access rules, or any other public-facing email surface.
- **No data migration** of placeholder `${phone}@placeholder.local` rows in this change; they continue to be unused and a follow-up cleanup task is noted.

## Capabilities

### New Capabilities

_None._ No new spec capability is being introduced — admin login by phone is already declared intent in `specs/user` (Phone Number for Authentication) and `specs/auth` (Login). What changes is the strategy Payload uses to implement it.

### Modified Capabilities

- `user`: The "Phone Number for Authentication" requirement is strengthened — the canonical identifier Payload's local strategy accepts is the user's `username`, which MUST equal the user's `phone` (the `username` field is auto-populated from `phone` on create and never set independently). Registration, login, and `create-first-user` all key on the same phone-derived value.
- `auth`: The "Login" requirement is updated to describe the new identifier surface — `POST /api/users/login` accepts `{ username, password }` where `username` is the phone; the admin panel's login form is Payload's username form, not a custom email form.

## Impact

- **Code**:
  - `src/collections/Users.ts` — add `username` field + `beforeValidate` hook that copies `phone` → `username`; set `auth.loginWithUsername: true`; remove the `phoneCreate` and `phoneLogin` endpoints; add a `register` endpoint (and possibly a `firstUser` endpoint) that uses `payload.create` + `payload.login`.
  - `src/app/(app)/register/page.tsx` — switch the create call to `POST /api/users/register`; drop the second `/api/users/login` fetch.
  - `src/app/(app)/login/page.tsx` — change the submit body from `{ phone, password }` to `{ username: phone.trim(), password }`; rename the state variable but keep the visible label as "Phone" so users still type their phone.
  - `src/app/(payload)/admin/...` — override the `createFirstUser` view via `admin.components.views.createFirstUser` so the first admin enters phone + password (not email + password); the override lives under `src/app/(payload)/admin/` per Payload's view-override conventions.
- **API**:
  - `POST /api/users/login` — accepts `{ username, password }` (Payload built-in); rejects `{ email, password }` (Payload built-in behavior).
  - `POST /api/users/register` (new) — accepts `{ firstName, lastName, phone, password, address? }`, creates the user, then logs them in and returns the cookie.
  - `POST /api/users/first-user` (new, internal/admin-only) — same shape but creates with `role: 'admin'`; used by the overridden `createFirstUser` view.
- **Database**:
  - `users.username` — new required, unique, indexed text column. Existing rows have no `username` and MUST be backfilled before login can succeed for those users. Because this is a demo/dev app and the only existing user is the very first admin just created by `create-first-user`, the backfill is performed in the same migration as the column add (set `username = phone` for every row).
  - `users.email` — still nullable, still hidden in admin, still untouched.
- **Dependencies / tools**: Payload CMS 3.88 `auth.loginWithUsername` is the only strategy change; no new packages. The `payload-types.ts` regeneration will add `username: string` to `User` (required).
- **Tests**: `tests/int/api.int.spec.ts` and any spec that hits `/api/users/login` MUST update the body to `{ username, password }`. `tests/e2e/admin.e2e.spec.ts` MUST update its admin-panel login selector from `input[name="email"]` to `input[name="username"]` and its createFirstUser flow to fill phone + password. `tests/helpers/seedUser.ts` MUST set `username` when creating seeded users.
- **Design tokens**: The login form's identifier label stays "Phone" (only the wire format and the input `name` attribute change), so no `DESIGN.md` changes. The admin `createFirstUser` override reuses Payload's existing form shell — no beui/shadcn additions.
- **Out of scope**: customer accounts, contact page, site settings, newsletter, password reset emails, placeholder-email cleanup.