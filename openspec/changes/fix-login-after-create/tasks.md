## 1. Payload collection fix

- [x] 1.1 Load `.agents/skills/payload/SKILL.md` (and check `.claude/skills/payload/` if present), then patch `src/collections/Users.ts` to fix `loginAfterCreate` — normalize login identifier with `formatPhoneToE164` (reuse existing helper, derive from `data.username ?? doc.username`), call `payload.login({ collection: "users", data: { username: normalized, password }, req, depth: 0 })` with proper `req`/`res` handling, return only `doc` (do not spread `...auth`), wrap in try/catch that logs but does not throw, and remove debug `console.log` — verify with `bun run build` and `grep -n loginAfterCreate src/collections/Users.ts` shows normalized login and no console.log
- [x] 1.2 Make `address` optional at registration in `src/collections/Users.ts:100-103` (`required: false`, keep `required: true` semantics only at checkout) to match `openspec/specs/user` "SHALL NOT be required" — verify `bun run build` succeeds and `POST /api/users` with empty address returns 201 (manual curl or Playwright)
- [x] 1.3 Run Payload codegen `bun run generate:types` and `bun run generate:importmap` (if defined) and verify no TS errors in `src/collections/Users.ts` with `bun run build` or `bunx --bun tsc --noEmit`

## 2. Register client fallback

- [x] 2.1 Patch `src/app/(app)/register/page.tsx:36-52` to add client-side fallback login — after `POST /api/users` succeeds, normalize `phone` to E.164 (or use raw `phone.trim()` and let server normalize, but ensure the login payload matches stored value), call `POST /api/users/login` via `apiFetch` with `{ username: normalizedPhone, password }` and `credentials: "include"`, handle login failure with `parsePayloadError`, only then `router.push(nextParam)` and `router.refresh()` — verify file path is `src/app/(app)/register/page.tsx` with `ls "src/app/(app)/register"` and code review shows two sequential apiFetch calls
- [x] 2.2 Verify `src/lib/api.ts` still uses `credentials: "include"` by default and that both fetch calls pass it explicitly — manual read of `apiFetch` options

## 3. Verification (auth flow)

- [x] 3.1 Manual smoke via `bun run dev`: register new user with `09123456789` → assert home page shows avatar (authenticated header) without visiting `/login`, then `GET /api/users/me` returns 200, then refresh retains session — verify with Playwright or manual browser check
- [x] 3.2 Negative case: register with existing phone → assert error "already taken" from `parsePayloadError`; register with invalid phone → assert format validation error — verify error UI reuses existing `role="alert"` red box (no new DESIGN.md tokens)
- [x] 3.3 Run existing auth-related tests `bun run test` / `bun run test:int` (Vitest) and `bunx --bun playwright test` for register/login specs if present — verify no regressions
- [x] 3.4 Confirm no UI token drift: if any style touched, read `DESIGN.md` and verify tokens (`{colors.ink}`, `{rounded.full}`, `{component.button-primary}`) are used, then `bunx @google/design.md lint DESIGN.md` passes
