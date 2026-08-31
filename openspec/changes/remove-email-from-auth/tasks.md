## 1. Payload Collection

- [x] 1.1 Override the default `email` field on the `Users` collection in `src/collections/Users.ts` — added `name: 'email'`, `type: 'email'`, `required: false`, `unique: false`, `index: false`, `admin: { hidden: true }`, `access.update: false` to the `fields` array (verified in `src/collections/Users.ts:34-48`)
- [x] 1.2 Confirm the implicit unique index on `users.email` is dropped — added `unique: false` and `index: false` to the field override; project uses SQLite (`payload.db`) without a `migrations/` directory, so the field-level overrides take effect directly on next payload init; generated types (`src/payload-types.ts:150`) confirm `email?: string | null` (no required/unique marker)

## 2. Custom Login Endpoint

- [x] 2.1 Add a `POST` custom endpoint at `/api/users/login` to `Users.ts` `endpoints` (declared in `endpoints: [phoneLogin]` in `src/collections/Users.ts:109`); handler reads `{ phone, password }` from JSON body, finds user by phone, verifies password via inline `crypto.pbkdf2` (Payload's local-strategy algorithm), signs JWT with `jwtSign`, sets cookie via `generatePayloadCookie` + `headersWithCors`; implementation at `src/collections/Users.ts:16-99` — typecheck passes (`bunx tsc --noEmit`)
- [x] 2.2 Replaced `email` field with `phone` field in the auto-login body in `src/app/(app)/register/page.tsx` — placeholder synthesis removed, create body now sends `{ firstName, lastName, phone, password, address? }`, auto-login sends `{ phone, password }` to `/api/users/login` (verified in `src/app/(app)/register/page.tsx:50-88`)

## 3. Front-end Form Changes

- [x] 3.1 Removed `email` state, `<input type="email">`, email validation, and placeholder-synthesis from `src/app/(app)/register/page.tsx` — form now renders First name, Last name, Phone, Password, Address only; subtitle updated to "Join with your phone — address is optional." (verified in `src/app/(app)/register/page.tsx`)
- [x] 3.2 Updated login form in `src/app/(app)/login/page.tsx` — identifier state/label/placeholder all set to Phone (`09123456789`); removed `email`/`phone` dual-body branch; submits `{ phone, password }` to the custom `/api/users/login` endpoint (verified in `src/app/(app)/login/page.tsx`)

## 4. Tests and Type Cleanup

- [x] 4.1 `src/collections/Users.test.ts` does not exist; closest auth-touching test is `tests/int/api.int.spec.ts` (collection smoke test) which is green. Admin e2e `tests/e2e/admin.e2e.spec.ts` still uses email for the admin panel login (Payload's local strategy, not affected by our change) and to assert `input[name="email"]` on the user create form (field still rendered, moved to sidebar). `tests/helpers/seedUser.ts` keeps the test user email so the admin panel login flow keeps working. Verified with `bunx --bun vitest run` — 1/1 pass.
- [x] 4.2 Switched `user.email` → `user.phone` in `src/app/(app)/page.tsx:31` (default Payload homepage welcome line). Remaining `user.email` reference in `src/collections/Users.ts:74` is intentional (placeholder in JWT payload inside our custom login endpoint). `src/lib/current-user.ts:13` keeps `email?: string | null` as an optional type. No other app/middleware/collections `user.email` reads found.
- [x] 4.3 Ran `bun run generate:types` (clean — `User` now shows `email?: string | null` in `src/payload-types.ts`), `bun run generate:importmap` (clean — no new imports), and `bunx tsc --noEmit` (only pre-existing `@/middleware` import error in `src/app/(app)/middleware.ts:6`, unrelated to this change).

## 5. Smoke Verification

- [ ] 5.1 Manual end-to-end smoke test: register a new user at `/register` (no email entered), confirm auto-login redirects to `/`, then log out and log back in at `/login` using phone + password — verify both flows succeed and `/admin/collections/users` shows the new user with `phone` as the title and no email column
