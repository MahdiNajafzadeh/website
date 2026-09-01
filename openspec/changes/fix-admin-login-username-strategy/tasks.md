## 1. Payload Collection & Hooks

- [ ] 1.1 Load `.agents/skills/payload/SKILL.md` (or the matching skill under `.claude/skills/payload/`) before editing `Users.ts` and verify the `auth.loginWithUsername` and `beforeValidate` patterns match the skill's examples
- [ ] 1.2 Add `auth.loginWithUsername: true` to the `Users` collection config in `src/collections/Users.ts` and verify the file no longer compiles custom `phoneLogin`/`phoneCreate` endpoints (`endpoints: [phoneCreate, phoneLogin]`) — keep the array but empty for now; remove both endpoint definitions
- [ ] 1.3 Add a `username` field to the `Users` collection fields array (`type: 'text'`, `required: true`, `unique: true`, `index: true`, `admin.hidden: true`, `access.update: () => false`) and verify `bun run generate:types` produces `username: string` (required) on `User` in `src/payload-types.ts`
- [ ] 1.4 Add a collection-level `beforeValidate` hook on `Users` that copies `data.phone` into `data.username` (skip when `phone` is absent or `username === phone`) and verify with a manual Payload boot + `payload.create({ collection: 'users', data: { phone: '09123456789', ... } })` that the persisted row has `username === '09123456789'`
- [ ] 1.5 Verify the existing `email` field override from the `remove-email-from-auth` change is still present (`required: false`, `unique: false`, `index: false`, `admin.hidden`) so Payload's local strategy does not insist on a non-null `email` at create time
- [ ] 1.6 Run `bunx tsc --noEmit` and verify only pre-existing errors remain (no new errors introduced by this group)

## 2. Custom Register Endpoint

- [ ] 2.1 Add a `register` endpoint to `Users` (`endpoints: [{ path: '/register', method: 'post', handler }]`) that validates `firstName`, `lastName`, `phone` (must match `/^09\d{9}$/`), `password` (>= 6 chars), optional `address`, returns 400 with a clear message on validation failure
- [ ] 2.2 Inside the handler, reject duplicate phone numbers with HTTP 409 ("Phone number already registered.") using `payload.find({ collection: 'users', where: { phone: { equals } } })`
- [ ] 2.3 On valid input, call `req.payload.create({ collection: 'users', data: { firstName, lastName, phone, password, address, role: 'customer', customerType: 'regular' } })` so Payload hashes the password via the local strategy and the `beforeValidate` hook populates `username`; verify the returned user has both `phone` and `username`
- [ ] 2.4 Then call `req.payload.login({ collection: 'users', data: { username: phone, password } })` and forward the response directly to the client (status 200 + the `Set-Cookie` Payload wrote) so the front-end gets a single round trip and a working session
- [ ] 2.5 Verify by hitting `POST /api/users/login` directly with `{ username: '09123456789', password }` for the just-registered user — the response MUST be 200 with a `Set-Cookie` header and `bun run test:int` MUST remain green

## 3. Admin `createFirstUser` View Override

- [ ] 3.1 Add a `firstUser` endpoint on `Users` (`endpoints: [{ path: '/first-user', method: 'post', handler }]`) that requires the `users` collection to be empty (returns 403 "First user already exists." otherwise), accepts `{ firstName, lastName, phone, password }`, calls `payload.create({ collection: 'users', data: { firstName, lastName, phone, password, role: 'admin' } })`, then `payload.login({ collection: 'users', data: { username: phone, password } })`, and forwards the login response
- [ ] 3.2 Override the `Users.admin.components.views.createFirstUser` view in `src/collections/Users.ts` to point at `'/components/CreateFirstUser'#CreateFirstUser` and create `src/components/CreateFirstUser.tsx` exporting `CreateFirstUser` as a server-friendly component that renders phone + password fields and POSTs to `/api/users/first-user`
- [ ] 3.3 Verify by deleting the dev DB, running `bun run dev`, opening `/admin`, and confirming the overridden view renders phone + password (not email + password); submit the form and confirm the admin lands on the dashboard
- [ ] 3.4 Run `bun run generate:importmap` and verify the new `CreateFirstUser` component appears in the generated importmap with no errors

## 4. Front-end Page Updates

- [ ] 4.1 In `src/app/(app)/login/page.tsx`, rename the `phone` state to `username`, change the input `name`/`id` to `username` (keep the visible label and placeholder as "Phone" / `09123456789` so the design system is untouched), and POST `{ username: phone.trim(), password }` to `/api/users/login`; verify with `curl` that the payload's login works end-to-end
- [ ] 4.2 In `src/app/(app)/register/page.tsx`, remove the second `fetch('/api/users/login', ...)` call and switch the create call to `POST /api/users/register` with the existing body; the server now sets the session cookie in its response, so the client just redirects on success
- [ ] 4.3 Verify both pages by registering a fresh user via the UI and confirming they land on `/` with the session cookie set (visible in DevTools → Application → Cookies → `payload-token`)

## 5. Data Backfill & Migration

- [ ] 5.1 Add `src/migrations/20260901_backfill_username.ts` (or a `bun run payload migrate:create` migration file) that runs once and sets `users.username = users.phone` for every row where `username IS NULL OR username = ''`; export it as the default Payload migration with `up = async ({ payload }) => { ... }` and `down = async ({ payload }) => { /* sets username back to NULL where it equaled phone */ }`
- [ ] 5.2 Add a `package.json` script `"migrate:backfill-username": "cross-env NODE_OPTIONS=--no-deprecation payload migrate"` (or extend the existing migrate command if present) and verify with `bun run migrate:backfill-username -- --file src/migrations/20260901_backfill_username.ts` that running it against a dev DB with one existing row (phone set, username null) results in `username` being set
- [ ] 5.3 Verify idempotency by running the migration twice on the same DB and confirming the second run is a no-op (no error, no row count change)

## 6. Tests & Verification

- [ ] 6.1 Update `tests/int/api.int.spec.ts` (and any other int test that hits `/api/users/login` or creates a user via the collection API) to send `{ username: phone, password }` instead of `{ phone, password }`; verify `bun run test:int` passes 1/1
- [ ] 6.2 Update `tests/helpers/seedUser.ts` to set `username: phone` when seeding; verify `bun run test:int` still passes after the change
- [ ] 6.3 Update `tests/e2e/admin.e2e.spec.ts` to fill the admin login form's `input[name="username"]` (not `input[name="email"]`) and to update the createFirstUser flow to fill phone + password via the overridden view; verify `bun run test:e2e` passes
- [ ] 6.4 Verify the bug-report scenario end-to-end in `bun run dev`: delete the dev DB, restart the server, open `/admin`, complete `createFirstUser` with phone `09123456789` + a password, confirm the admin dashboard loads; log out, return to `/admin`, re-enter the same phone + password, confirm the admin dashboard loads again — no "Phone Number or Password is wrong." error
- [ ] 6.5 Verify the public site still works: open `/register` in a private window, register a new user with first/last/phone/password, confirm the auto-redirect to `/` succeeds; log out, return to `/login`, enter the same phone + password, confirm the redirect succeeds
- [ ] 6.6 Verify `/admin/collections/users` shows `phone` as the title (`useAsTitle: 'phone'`) and does NOT show a `username` column or an `email` column
- [ ] 6.7 Run `bunx tsc --noEmit` and `bun run lint` and verify no new errors or warnings are introduced by this change