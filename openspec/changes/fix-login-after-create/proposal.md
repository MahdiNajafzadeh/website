## Why

Registration currently creates the user but does not establish an authenticated session: the `loginAfterCreate` `afterChange` hook in `src/collections/Users.ts:17` calls `payload.login` with raw `data.username` and merges the result into the returned doc, yet the home page shows no avatar until the user manually logs in. Fixing auto-login is required so the spec requirement "The user is logged in automatically" (`openspec/specs/user/spec.md`) actually holds and the register→home flow matches the intended UX.

## What Changes

- Fix `loginAfterCreate` hook in `src/collections/Users.ts` so `POST /api/users` results in a valid `payload-token` cookie + authenticated `req.user`:
  - Normalize the username to E.164 before login (reuse `formatPhoneToE164`) so it matches the stored value written by `formatPhoneBeforeValidate`.
  - Call `payload.login` with the normalized credentials and `req`/`res` so the auth token/cookie is actually set on the HTTP response, not just merged into JSON. Return the original `doc` (do not spread `auth` into the doc shape) or handle response headers correctly per Payload 3.x Next adapter behavior.
  - Remove debug `console.log` and add error handling that does not block user creation if login fails (surface via logs).
- Fix client registration at `src/app/(app)/register/page.tsx:36` to guarantee login even if the hook path is bypassed (e.g., REST vs Local API differences):
  - After successful `POST /api/users`, perform `POST /api/users/login` with the same normalized `username`/`password` and `credentials: "include"` before `router.push(nextParam)` / `router.refresh()`. Keep the hook as the server-side source of truth; client fallback makes the flow resilient.
- Optional cleanup: ensure `address` handling matches `user` spec (address optional at registration) and that `phone`→`username` duplication in the create payload is normalized.
- Verify with Payload skill at `.agents/skills/payload/SKILL.md` and confirm auth cookie is `httpOnly`/`Secure` per `payload.config.ts:secret` / `tokenExpiration: 86400`.

## Capabilities

### New Capabilities
<!-- none - this is a bugfix against existing specs -->

### Modified Capabilities
- `user`: Amend *User Registration Fields* scenario "The user is logged in automatically" to define the mechanism (hook sets cookie / client fallback login) and add failure/recovery scenarios. Clarify that `address` is optional at registration (currently `required: true` in Users.ts:101 contradicts the spec).
- `auth`: Extend *Login* / session requirements to cover "Login after registration" — registration MUST establish an authenticated session equivalent to a normal login, with `payload-token` cookie set and `GET /api/users/me` returning the new user, without requiring a second manual login.

## Impact

- **Code**: `src/collections/Users.ts` (hooks), `src/app/(app)/register/page.tsx` (client flow), `src/lib/api.ts` (no change but verified `credentials: "include"`), `src/payload.config.ts` (token settings).
- **APIs**: `POST /api/users` response/cookie behavior, `POST /api/users/login` (client fallback), `GET /api/users/me` (verification).
- **Frontend routes**: All public UI stays under `src/app/(app)`; no route moves.
- **UI system**: No visual change; if any error UI is added, use `shadcn` + `beui (@beui)` components and `DESIGN.md` tokens (`{colors.ink}`, `{colors.canvas}`, `{rounded.full}`, `{typography.button-md}`, `{component.button-primary}`) — no ad-hoc colors.
- **Tooling**: `bun` only (`bun run dev`, `bunx --bun ...`), `bunx @google/design.md lint DESIGN.md` if DESIGN.md touched (not expected).
- **Dependencies**: `libphonenumber-js`, `payload-phone-number-plugin` E.164 handling.
