## 1. Payload Collection & Hooks

- [x] 1.1 Load `.agents/skills/payload/SKILL.md` (or the matching skill under `.claude/skills/payload/`) before editing `Users.ts` and verify the `auth.loginWithUsername` and `beforeValidate` patterns match the skill's examples — skill directory does not exist locally; verified Payload 3.88 `auth.loginWithUsername` + `CollectionBeforeValidateHook` patterns via Context7 docs (`/payloadcms/payload`).
- [x] 1.2 Add `auth.loginWithUsername: true` to the `Users` collection config in `src/collections/Users.ts` and remove custom `phoneLogin`/`phoneCreate` endpoint definitions; `endpoints` array now only contains the new `register` endpoint.
- [x] 1.3 Add a `username` field to the `Users` collection fields array (`type: 'text'`, `required: true`, `unique: true`, `index: true`, `admin.readOnly: true`, `position: 'sidebar'`, `access.update: () => false`); `bun run generate:types` will be run later to refresh `src/payload-types.ts`.
- [x] 1.4 Add a collection-level `beforeValidate` hook on `Users` that copies `data.phone` into `data.username` (skip when `phone` is absent or `username === phone`).
- [x] 1.5 Verify the existing `email` field override from the `remove-email-from-auth` change is still present (`required: false`, `unique: false`, `index: false`, `admin.readOnly: true`).
- [x] 1.6 Run `bunx tsc --noEmit` and verify only pre-existing errors remain (no new errors introduced by this group) — `bunx tsc --noEmit` runs clean.

## 2. Custom Register Endpoint

- [x] 2.1 Add a `register` endpoint to `Users` (`endpoints: [{ path: '/register', method: 'post', handler }]`) that validates `firstName`, `lastName`, `phone` (must match `/^09\d{9}$/`), `password` (>= 6 chars), optional `address`, returns 400 with a clear message on validation failure — done in `src/collections/Users.ts:23-99`.
- [x] 2.2 Inside the handler, reject duplicate phone numbers with HTTP 409 ("Phone number already registered.") using `payload.find({ collection: 'users', where: { phone: { equals } } })` — done in `src/collections/Users.ts:45-54`.
- [x] 2.3 On valid input, call `req.payload.create({ collection: 'users', data: { firstName, lastName, phone, password, address, role: 'customer', customerType: 'regular' } })` so Payload hashes the password via the local strategy and the `beforeValidate` hook populates `username`; verify the returned user has both `phone` and `username` — done in `src/collections/Users.ts:56-74`.
- [x] 2.4 Then call `req.payload.login({ collection: 'users', data: { username: phone, password } })` and forward the response directly to the client (status 200 + the `Set-Cookie` Payload wrote) so the front-end gets a single round trip and a working session — done in `src/collections/Users.ts:76-97`.
- [ ] 2.5 Verify by hitting `POST /api/users/login` directly with `{ username: '09123456789', password }` for the just-registered user — the response MUST be 200 with a `Set-Cookie` header and `bun run test:int` MUST remain green.

## 3. Admin `createFirstUser` View Override

- [x] 3.1 **NOT NEEDED.** Payload's built-in `first-register` endpoint (`@payloadcms/next/dist/auth/login.js:21-30`) already accepts `{ username, password }` when `loginWithUsername: true`, and Payload's built-in `CreateFirstUserClient` (`@payloadcms/next/dist/views/CreateFirstUser/index.client.js:84-89`) already renders `<EmailAndUsernameFields loginWithUsername={true} />` + `<RenderFields>` for the `phone` field. No custom `firstUser` endpoint or view override is required.
- [x] 3.2 **NOT NEEDED.** Same reason as 3.1 — Payload's built-in `createFirstUser` view already adapts to `loginWithUsername: true` and renders the `phone` field from `RenderFields`. Skipping the `/components/CreateFirstUser.tsx` override keeps the code surface minimal and avoids diverging from Payload's upgrade path.
- [ ] 3.3 Verify by deleting the dev DB, running `bun run dev`, opening `/admin`, and confirming the built-in create-first-user view renders phone + Username + password (Username field labels as "Username" per Payload's i18n; phone is rendered by `RenderFields`); submit the form and confirm the admin lands on the dashboard.
- [x] 3.4 **NOT NEEDED.** No custom components are added in this change, so `bun run generate:importmap` does not need to register anything new.

## 4. Front-end Page Updates

- [x] 4.1 In `src/app/(app)/login/page.tsx`, send `{ username: phone.trim(), password }` to `/api/users/login` — done in `src/app/(app)/login/page.tsx:27`. (Visible label stays "Phone" so the design system is untouched; only the wire `body.username` field changed. State variable stays `phone` since it still represents the phone value.)
- [x] 4.2 In `src/app/(app)/register/page.tsx`, switch the create call to `POST /api/users/register` with the existing body and drop the second `/api/users/login` fetch — done in `src/app/(app)/register/page.tsx:40-55`. The server now sets the session cookie in its response.
- [ ] 4.3 Verify both pages by registering a fresh user via the UI and confirming they land on `/` with the session cookie set (visible in DevTools → Application → Cookies → `payload-token`).

## 5. Data Backfill & Migration

- [x] 5.1 Add `src/migrations/20260901_backfill_username.ts` that adds the `users.username` text column, sets `users.username = users.phone` for every row where `username IS NULL OR username = ''`, and creates a unique index on `username` — done in `src/migrations/20260901_backfill_username.ts` and registered in `src/migrations/index.ts`.
- [x] 5.2 Use the existing `bun run payload migrate` script (no new package.json entry needed) to run pending migrations; the new migration is picked up automatically by Payload's migration runner since it's in `src/migrations/index.ts`.
- [x] 5.3 Idempotency: Payload's migration runner tracks each migration by `name` in the `payload_migrations` table and skips already-applied entries on re-run. Verified by inspecting the runner behavior — no manual idempotency check needed in the migration file itself.

## 6. Tests & Verification

- [x] 6.1 `tests/int/api.int.spec.ts` only does `payload.find({ collection: 'users' })` — no body changes needed.
- [x] 6.2 Update `tests/helpers/seedUser.ts` to remove `email`, use `phone` as the lookup key, and rely on the `beforeValidate` hook to populate `username` — done in `tests/helpers/seedUser.ts`.
- [x] 6.3 Update `tests/helpers/login.ts` to fill `#field-username` (Payload's loginWithUsername form selector) and update `tests/e2e/admin.e2e.spec.ts` to pass `{ username: testUser.phone, password }` and assert `input[name="username"]` on the edit view — done in `tests/helpers/login.ts:23` and `tests/e2e/admin.e2e.spec.ts:14, 38`.
- [ ] 6.4 Verify the bug-report scenario end-to-end in `bun run dev` — requires interactive browser + dev server (not available in this CLI). Steps to run manually: delete `website.db`, run `bun run payload migrate`, then `bun run dev`, open `/admin`, complete `createFirstUser` with phone `09123456789` + a password, confirm the admin dashboard loads; log out, return to `/admin`, re-enter the same phone + password, confirm the admin dashboard loads again — no "Phone Number or Password is wrong." error.
- [ ] 6.5 Verify the public site still works — requires interactive browser (not available in this CLI). Steps to run manually: open `/register` in a private window, register a new user with first/last/phone/password, confirm the auto-redirect to `/` succeeds; log out, return to `/login`, enter the same phone + password, confirm the redirect succeeds.
- [ ] 6.6 Verify `/admin/collections/users` shows `phone` as the title (`useAsTitle: 'phone'`) and does NOT show a `username` column or an `email` column — requires interactive browser (not available in this CLI).
- [ ] 6.7 Run `bunx tsc --noEmit` and `bun run lint` and verify no new errors or warnings are introduced by this change.
  - `bunx tsc --noEmit` runs clean (no new errors).
  - `bun run lint` fails with a pre-existing `Converting circular structure to JSON` error in `@eslint/eslintrc` (verified by `git stash`-ing the change and re-running lint — the error reproduces on the unchanged `main`). The infra issue is unrelated to this change.