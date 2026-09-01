## Context

Payload CMS 3.88's `auth: true` collection ships with an `email` field by default and a built-in `POST /api/users/login` that authenticates on `email` + `password`. The existing change `remove-email-from-auth` (9/10 tasks done) works around that by:

- Overriding the `email` field on `Users` (`required: false`, hidden, non-unique).
- Adding a custom `phoneLogin` endpoint at `POST /api/users/login` that authenticates on `phone` + `password`.
- Adding a custom `phoneCreate` endpoint at `POST /api/users` for the public register form.
- Updating the public `/login` and `/register` pages to send `{ phone, password }`.

This works for the public website, but breaks the Payload admin panel: when an operator uses Payload's built-in `create-first-user` action to create the very first admin (or any later admin), the admin panel's default login form still expects an email/username + password and posts to the same `/api/users/login` route — which our custom handler rejects because the body has no `phone`. The user sees the generic auth error "Phone Number or Password is wrong." with no way to recover except to delete the user and re-create them with a different flow.

This change fixes that by removing the custom login endpoint and switching Payload's `Users` collection to its built-in `loginWithUsername` strategy. The user's `phone` becomes Payload's `username` (mirrored automatically by a `beforeValidate` hook), so Payload's default login form, the public `/login` form, and the `create-first-user` action all authenticate against the same field with the same hashing path. See `proposal.md` (Why) and `specs/user`, `specs/auth` for the resulting behavior contract.

Payload CMS skill at `.agents/skills/payload/SKILL.md` was consulted per the project's agent rules (skill path is declared in `AGENTS.md`; the skill folder resolves to `.claude/skills/payload/` in this checkout). UI surfaces in this change are limited to the existing `/login` and `/register` pages (no new components, no design token additions) so `DESIGN.md` and the `beui`/`shadcn` registries are not in scope.

## Goals / Non-Goals

**Goals:**

- The `Users` collection's local auth strategy is Payload's `loginWithUsername: true`; `POST /api/users/login` accepts `{ username, password }` and Payload's admin login form shows a username field.
- Every user has a `username` column equal to their `phone`; the hook that mirrors `phone` → `username` runs on `create` and `update` (including the `create-first-user` path).
- The custom `phoneLogin` and `phoneCreate` endpoints are gone; Payload's built-in `/api/users/login` and `/api/users` are used by the admin panel and by a single thin `/api/users/register` endpoint (which creates then logs in via Payload's built-in `payload.login`).
- The public `/login` and `/register` pages authenticate using the same identifier Payload's admin uses — the phone value submitted as the username.
- The admin `createFirstUser` view is overridden to collect a phone number and a password (instead of an email and a password) so the first admin can be created end-to-end.
- All auth-touching tests (int + e2e) and seed helpers use `username` + `password` (where `username` is the phone).

**Non-Goals:**

- No changes to `site-settings.emails`, the contact page, the customer collection, or any other public-facing email surface.
- No migration of placeholder `${phone}@placeholder.local` rows in `users.email` (separate cleanup task).
- No password reset / email-verification flow changes (none exist yet).
- No change to `role` / `customerType` / access rules in `Users.ts`.
- No change to `tokenExpiration` (still 24 h) or session strategy.
- No new third-party auth provider, no OAuth, no API-key strategy.

## Decisions

### Decision 1: Use Payload's `auth.loginWithUsername: true` and mirror `phone` → `username` via a `beforeValidate` hook

We declare `auth.loginWithUsername: true` on the `Users` collection and add a `username` field (`type: 'text'`, `required: true`, `unique: true`, `index: true`, `admin.hidden: true`, `access.update: false`). A `beforeValidate` collection hook copies `phone` → `username` on every create/update (skipping when both fields are absent or unchanged). The `email` field stays overridden (`required: false`, hidden, non-unique) from the existing `remove-email-from-auth` change.

- **Why**: This is the only Payload-supported configuration that (a) uses the built-in local strategy for hashing, sessions, JWT, and the admin login form, and (b) authenticates on a value the user identifies as a phone number. The hook keeps `username` strictly equal to `phone` so callers never need to think about two identifiers.
- **Alternatives considered**:
  - Keep the custom `phoneLogin` endpoint and also override the admin `Login` view to render a phone field — duplicated UI logic in two surfaces, two more places to keep in sync, and Payload's admin panel would still POST `{ username, password }` to `/api/users/login` which the custom handler would reject. Rejected.
  - Rename `phone` to `username` directly on the user record — would require renaming the field everywhere (UI labels, register form, profile display, account page) and the `phone` semantic would be lost. Rejected.
  - Use `auth.disableLocalStrategy: true` and roll a fully custom admin login — far more code, breaks Payload's built-in admin auth machinery, harder to keep aligned with Payload upgrades. Rejected.
  - Use `auth.loginWithUsername: { allowEmailLogin: true }` — would keep email as a fallback identifier, which contradicts the `remove-email-from-auth` intent that phone is the sole identifier. Rejected.

### Decision 2: Replace `phoneCreate` with a thin `register` endpoint that uses `payload.create` + `payload.login`

The `Users` collection drops its `phoneCreate` and `phoneLogin` endpoints. A new `register` endpoint on `Users` (path: `/register`, method: `post`) does:

1. Validate input (`firstName`, `lastName`, `phone`, `password`, optional `address`).
2. Reject duplicate `phone` with 409.
3. `req.payload.create({ collection: 'users', data: { firstName, lastName, phone, password, address, role: 'customer', customerType: 'regular' } })` — Payload hashes the password via the built-in local strategy and runs our `beforeValidate` hook that fills `username` from `phone`.
4. `req.payload.login({ collection: 'users', data: { username: phone, password } })` — Payload's built-in login returns `{ token, user, exp }` and writes the JWT cookie via `Response.headers`.
5. Return the cookie response to the client.

- **Why**: We keep one canonical register entry-point (the front-end POSTs once, gets a session) while letting Payload own hashing, JWT, cookies, and the `username = phone` invariant. No duplicated crypto code.
- **Alternatives considered**:
  - Keep `phoneCreate` as a thin create-only endpoint and have the front-end make a second `payload.login` call — duplicates the network round trip the user already sees today, and Payload's `payload.login` from the client is awkward because of cookie handling. Rejected.
  - Have the front-end hit `payload.create` directly and then a separate `payload.login` call — same duplication, plus the front-end must manage the `Set-Cookie` header from Payload's response. Rejected.
  - Override `POST /api/users` itself with a custom hook that auto-logs in — overrides Payload's REST contract for a non-public surface. Rejected.

### Decision 3: Override the admin `createFirstUser` view with a phone-first variant

Payload's default `createFirstUser` view collects only `email` + `password` and creates a user with `role: 'admin'`. With `loginWithUsername: true`, that user still has no `username` and cannot log in via the admin form. We override the view via `Users.admin.components.views.createFirstUser = { Component: '/components/CreateFirstUser'#CreateFirstUser }` (or via `payload.config.admin.components.views.createFirstUser`), pointing at a small server/client component at `src/components/CreateFirstUser.tsx` that renders phone + password fields and POSTs to a new `first-user` endpoint.

The `first-user` endpoint on `Users` (path: `/first-user`, method: `post`, access: no users exist) does the same `payload.create` + `payload.login` flow as `register`, but forces `role: 'admin'` and rejects when any user already exists.

- **Why**: This is the only way to give the first admin a phone identifier without abandoning Payload's local strategy. Reusing `payload.create` + `payload.login` keeps the hashing and session code paths identical to the public register flow.
- **Alternatives considered**:
  - Use Payload's default `createFirstUser` view and post-process: have a `beforeChange` hook that, when no users exist and the record has `email` but no `phone`, copies `email` → `phone` and `phone` → `username` — brittle, depends on Payload's hidden view quirks, and forces the operator to type a phone-looking email. Rejected.
  - Auto-create the first admin from a config file or a script — leaves Payload's built-in bootstrap UX on the floor and adds a manual step every time the DB is reset. Rejected.
  - Add a `beforeOperation` hook that fills `username` from `email` on the `create-first-user` only — would still require the operator to type a phone number as the email, which is misleading and fragile. Rejected.

### Decision 4: Public `/login` posts `{ username, password }` where `username` is the phone value

`src/app/(app)/login/page.tsx` keeps the visible label as "Phone" (no design-system change), the input `name` becomes `username`, the request body becomes `{ username: phone.trim(), password }`, and the URL stays `POST /api/users/login` (Payload's built-in). The error-handling path stays the same.

- **Why**: One wire shape, one auth code path, one identifier the user has to remember. Visible UI stays unchanged so `DESIGN.md` is untouched.
- **Alternatives considered**:
  - Send `{ phone, password }` and have the server-side rename to `username` in a `beforeLogin` hook — fragile because Payload's `payload.login` reads the body before hooks run on the default route. Rejected.
  - Reintroduce a thin client-side fetch that calls `/api/users/login?as=phone` — duplicates server logic. Rejected.

### Decision 5: Public `/register` posts to `/api/users/register` and relies on its `Set-Cookie` response

`src/app/(app)/register/page.tsx` no longer makes two requests; it makes a single `POST /api/users/register` and lets the server set the cookie and return the same payload shape it does today. The error/success UI is unchanged.

- **Why**: Cuts one round trip and removes the duplicated client-side cookie/state handling.
- **Alternatives considered**:
  - Keep two requests (create + login) and only swap the create call — leaks Payload's internal login contract to the client. Rejected.

## Risks / Trade-offs

- **[Risk] Existing users with `phone` set but no `username` fail to log in** → Mitigation: add a `beforeValidate` hook that backfills `username = phone` when missing on read/update; on first deploy, run a one-shot backfill (`req.payload.db.updateMany({ collection: 'users', where: { username: { equals: null } }, data: ... })`) before the hook ships. The hook also covers any user created via Payload's built-in `create-first-user` view after the deploy.
- **[Risk] Payload's `payload.create` rejects the registration body because the overridden `email` field still has implicit unique-index constraints** → Mitigation: the existing `remove-email-from-auth` change already sets `unique: false`, `index: false`, and `required: false` on `email`; if a unique-index error appears at runtime, add `db.indexes` to drop it.
- **[Risk] The admin `createFirstUser` view override shadows Payload's built-in route incorrectly** → Mitigation: register the override on `Users.admin.components.views.createFirstUser` (Payload's documented per-collection override) and verify in dev that the route renders our component, then the default one, then nothing.
- **[Risk] The `beforeValidate` hook runs twice on the same write (once on create, once on Payload's internal login user lookup)** → Mitigation: short-circuit when `data.username === data.phone` after the assignment so the hook is idempotent.
- **[Risk] The `register` endpoint sets the cookie via `headersWithCors` but Payload's own `payload.login` already wrote one — duplicate `Set-Cookie` headers** → Mitigation: forward the response from `payload.login` directly instead of re-signing the JWT; the response object Payload returns already contains the cookie headers we need.
- **[Risk] Tests that previously asserted `{ phone, password }` break** → Mitigation: update all hits to `/api/users/login` to `{ username, password }` in `tests/int/api.int.spec.ts`, `tests/e2e/admin.e2e.spec.ts`, and `tests/helpers/seedUser.ts`. `bun run test:int` and `bun run test:e2e` MUST pass.
- **[Trade-off] Reintroduces a small amount of custom code (register + first-user endpoints, createFirstUser view override)** → acceptable: the custom surface is purely plumbing around Payload's built-in auth; the bug being fixed is exactly the gap between the admin form and the public form, and Payload does not expose a config flag that bridges it.
- **[Trade-off] The `first-user` endpoint duplicates the `register` endpoint with `role: 'admin'`** → acceptable: both endpoints stay tiny and one-line-divergent; abstracting them risks obscuring the access-control difference (`first-user` requires an empty users table).

## Migration Plan

1. Land the code changes (collection config, hooks, register endpoint, first-user endpoint, createFirstUser view override, page edits) behind a single PR.
2. Run `bun run generate:types` so `User` gains `username: string` (required, unique) and drops any pre-existing `email`-required flag.
3. Run `bun run generate:importmap` so the `CreateFirstUser` view component is registered.
4. Run a one-shot `bun run payload migrate:backfill-username` script (added in this change) that sets `users.username = users.phone` for every row where `username IS NULL`. Without this, existing users (including the one just created by `create-first-user` in the bug report) cannot log in.
5. Run `bunx --bun vitest run` for `tests/int/api.int.spec.ts` and `bun run test:e2e` for the admin e2e suite; both MUST be green with username-based bodies.
6. Manual smoke test in `bun run dev`:
   - Open `/admin` with an empty DB → land on the overridden `createFirstUser` view → enter phone + password → land on the admin dashboard.
   - Open `/login` in a new private window → enter the same phone + password → land on `/`.
   - Open `/register` → enter first/last/phone/password → auto-redirected to `/`.
   - `GET /admin/collections/users` → list shows `phone` as the title, no `username` column visible, no `email` column.
7. Rollback: revert the PR. Existing rows keep their `username` (set by the backfill) and Payload reverts to the previous login behavior. The backfill script is idempotent (no-op if `username` is already set).
8. Follow-up (out of scope here): `bun run payload migrate:cleanup-placeholder-emails` to null out `${phone}@placeholder.local` rows in `users.email`.

## Open Questions

_None._ All material ambiguities (identifier = phone = username; auth strategy = Payload built-in `loginWithUsername`; first-admin creation = overridden `createFirstUser` view; backfill = in-PR one-shot script) are settled in the proposal and specs.