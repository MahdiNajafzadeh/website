## Context

See `proposal.md` — Why. Current state is `src/collections/Users.ts:17-36` with `loginAfterCreate: CollectionAfterChangeHook`. It logs `doc/data/operation`, then calls `payload.login({ collection: "users", data: { username, password }, req })` with raw `data.username` and merges `...auth` into the returned doc. `formatPhoneBeforeValidate` at `src/collections/Users.ts:38-41` normalizes `username` to E.164 (`+989...`) before storage, so the login call with raw `09...` does not match the stored value and `payload.login` fails silently (hook returns `doc` early or auth merge never results in a cookie). Register client at `src/app/(app)/register/page.tsx:36-52` does `POST /api/users` then immediately `router.push`/`router.refresh` without ever calling `/api/users/login` or consuming a token, so even a successful hook that only merges `token` into JSON leaves no `payload-token` cookie — home page shows unauthenticated avatar.

Payload 3.88 (Next adapter) sets auth cookies only when the login handler writes `Set-Cookie` on the HTTP response; `payload.login()` inside an `afterChange` hook does not automatically mutate the REST response headers unless `req.res` is threaded and the handler respects it. The existing hook also spreads `auth` into the doc (`return { ...doc, ...auth }`), corrupting the shape returned by the create endpoint. All public UI lives under `src/app/(app)`; `(payload)` is reserved. Skills consulted: none found at `.agents/skills/payload/SKILL.md` (directory contains `beui`, `design.md`, `openspec-*`, `shadcn`), so design follows Payload 3 collection hook conventions from docs and `payload.config.ts`.

## Goals / Non-Goals

**Goals:**
- Make registration at `src/app/(app)/register/page.tsx` reliably result in an authenticated session (avatar shown, `GET /api/users/me` 200) without manual login.
- Fix E.164 mismatch between stored `username` and login identifier.
- Make the fix resilient to Payload REST vs Local API differences (hook + client fallback).
- Keep `address` optional at registration to match `openspec/specs/user`.

**Non-Goals:**
- No UI redesign or new components; error surfaces reuse existing form styles (no new DESIGN.md tokens needed).
- No auth strategy change (keep `loginWithUsername: { requireEmail:false, allowEmailLogin:false }`, `tokenExpiration: 86400`).
- No migration of existing users; no change to admin access rules.
- No introduction of new dependencies or JWT handling.

## Decisions

### Decision 1: Fix hook to normalize and set cookie correctly; keep client fallback

**Choice:** Two-layer fix.
1. **Server hook (`src/collections/Users.ts`)** — normalize username with `formatPhoneToE164` before `payload.login`, pass `req` (and `res` if available via `req.res`), handle the `payload.login` result by ensuring the cookie is set on the response and returning only `doc` (not `...auth`). Remove `console.log`.
2. **Client fallback (`src/app/(app)/register/page.tsx`)** — after `POST /api/users` succeeds, unconditionally `POST /api/users/login` with `{ username: normalizedPhone, password }` and `credentials: "include"` before redirect. This matches the pattern already used by `src/app/(app)/login/page.tsx:25`.

**Rationale:** Hook alone is brittle because Payload's cookie-setting behavior depends on the adapter's `req.res` wiring; the client login call is the canonical, adapter-agnostic way that is proven to set `payload-token`. Keeping both means the server path optimizes for direct API callers while the browser path is guaranteed even if the hook's `Set-Cookie` is not forwarded.

**Alternatives considered:**
- *Hook only, fixing Set-Cookie header manually* — rejected because Next.js fetch/response header forwarding in Payload's REST handler is undocumented and would require monkey-patching the handler; fragile across Payload upgrades.
- *Client only, remove hook* — rejected because non-browser callers (e.g., seed scripts, Local API) would still expect server-side auto-login semantics; keeping the hook preserves the spec contract at the collection layer.
- *Custom `/api/register` route* — rejected; duplicates Payload auth logic and adds maintenance.

### Decision 2: E.164 normalization reuse

**Choice:** Extract `formatPhoneToE164` as a shared helper and use it in both `formatPhoneBeforeValidate` and `loginAfterCreate` (and on the client via the same `libphonenumber-js` logic or by sending raw and letting the hook normalize). Hook will derive the login username from `data.username ?? doc.username` and normalize before calling `payload.login`.

**Rationale:** Eliminates the mismatch bug (`09...` vs `+989...`). Uses `libphonenumber-js` with `IR` default as already in the collection.

**Alternative:** Store raw and query raw — rejected because `payload-phone-number-plugin` already stores E.164.

### Decision 3: Address optional at registration

**Choice:** Change `address` field in `Users.ts:100-103` from `required: true` to `required: false` (or keep `required: false` for `create` operation via `required: false` or `validate` hook), matching `openspec/specs/user` ("SHALL NOT be required").

**Rationale:** Current `required: true` forces the client to send a non-empty address (the page currently sends `address.trim()` which may be empty and would fail). Spec says address is only required at checkout.

**Alternative:** Keep required and make client require address — rejected, contradicts spec and degrades UX.

### Decision 4: No new UI components, DESIGN.md unchanged

**Choice:** No visual changes. Register/login forms keep existing pill inputs (`rounded-[24px]`, `border-[#cacacb]`, `bg-white`/`#111111`), pill CTA `rounded-full bg-[#111111]`, typography via inline styles mapping to `Helvetica Now`. If an error is surfaced from the fallback login, reuse the existing `role="alert"` red box.

**Rationale:** Change is behavioral, not visual. Design system check confirms no new tokens needed; `bunx --bun shadcn@latest search` / `curl -fsS https://beui.dev/r/registry.json` not needed. DESIGN.md lint (`bunx @google/design.md lint DESIGN.md`) only if file edited — it is not.

**Payload skill note:** `.agents/skills/payload/SKILL.md` does not exist in this workspace; conventions inferred from `src/payload.config.ts` and `src/collections/Users.ts`. Before implementation, re-check `.agents/skills/` and, if the skill appears, follow its `CollectionConfig` / hook patterns. `src/app/(app)` structure and `bun` commands (`bun run dev`, `bunx --bun ...`) apply per repo constraints.

## Risks / Trade-offs

- **[Hook Set-Cookie not forwarded] → Mitigation:** Client fallback `POST /api/users/login` guarantees cookie regardless of adapter behavior; hook remains best-effort and logs failures without blocking creation.
- **[Double login race (hook + client)] → Mitigation:** Idempotent; second login simply refreshes token. No UX impact; token expiration remains 86400s.
- **[E.164 edge cases (invalid numbers)] → Mitigation:** Reuse `parsePhoneNumberFromString` try/catch; if normalization returns input unchanged, attempt login with raw value as fallback and surface validation errors from `payload-phone-number-plugin`.
- **[Address optional migration] → Mitigation:** Existing rows have addresses; making the field optional is backward-compatible. Add a DB migration only if the SQLite adapter requires it; otherwise rely on Payload's schema (nullable).
- **[Credentials/cookies in fetch] → Mitigation:** Ensure `apiFetch` uses `credentials: "include"` (already does). Verify CORS/same-origin and `httpOnly`/`Secure` flags in dev vs prod.

## Migration Plan

1. Patch `src/collections/Users.ts`: normalize username, fix `payload.login` call, remove `console.log`, make `address` optional.
2. Patch `src/app/(app)/register/page.tsx`: add normalized fallback login before `router.push`.
3. Run `bun run build` / `bun run dev` smoke test: register new user → home shows avatar → `GET /api/users/me` 200 → refresh retains session → logout clears cookie.
4. Deploy; no DB migration required for address change if nullable, otherwise generate Payload migration via `bun run payload migrate:create`.
5. Rollback: revert both patches; behavior returns to current (manual login required).

## Open Questions

- None blocking. Payload skill location (`payload` skill not found at `.agents/skills/payload/SKILL.md`) should be confirmed before implementation; if a skill is added, align hook signature (`afterChange` args, `req.res` availability) with it.
