## 1. Pre-flight and type audit

- [x] 1.1 Verify current failure modes by running `bun tsc --noEmit` (expect ~150 `TS2554: Expected 2 arguments` errors from `src/lib/t.ts`) and `grep -rn "tFmt" src --include="*.ts" --include="*.tsx"` to enumerate 11 call sites — save output for before/after comparison.
- [x] 1.2 Read `src/lib/t.ts`, `src/locale.json`, and `DESIGN.md` to confirm placeholder syntax (`{var}`), locale shape (`typeof locale`), and that no `DESIGN.md` token changes are needed — verify files are reachable with `ls src/lib/t.ts src/locale.json DESIGN.md`.

## 2. Fix `t` type safety in `src/lib/t.ts`

- [x] 2.1 Replace `Placeholders<T>` with `T extends \`${string}{${infer P}}${infer R}\` ? P | Placeholders<R> : never` and `Vars<S>` with `Placeholders<S> extends never ? never : Record<Placeholders<S>, string | number>` — verify `src/lib/t.ts:5-8` contains the updated definitions.
- [x] 2.2 Change `t` signature to conditional rest tuple `export function t<K extends LocaleKey>(key: K, ...args: Placeholders<Locale[K]> extends never ? [] : [vars: Vars<Locale[K]>]): string` and implementation to `const vars = (args[0] ?? {}) as Record<string, string|number>` with `replaceAll` loop — verify `grep -n "export function t" src/lib/t.ts` shows rest-tuple signature and no `tFmt`.
- [x] 2.3 Remove `tFmt` export entirely and delete/audit the auxiliary `s` helper (delete if `grep -rn "\\bs\\b" src --include="*.ts" --include="*.tsx" | grep "from.*lib/t"` returns no callers) — verify `grep -rn "tFmt" src` returns no matches in `src/lib/t.ts`.

## 3. Consolidate call sites under `src/app/(app)`

- [x] 3.1 Verify front-end isolation path exists with `ls src/app/\(app\)` and bulk-replace `tFmt` imports/usages in `src/app/(app)` pages: `src/app/(app)/page.tsx` (2 sites: `home.utility.partnerDiscount`, `home.proof.procedure`), `src/app/(app)/products/page.tsx` (`products.pagination`), `src/app/(app)/categories/page.tsx` (`categories.pagination`), `src/app/(app)/about/page.tsx` (`about.subtitle` ×2), `src/app/(app)/blog/page.tsx` — each `import { t, tFmt }` → `import { t }` and `tFmt(` → `t(` — verify `grep -rn "tFmt" src/app/\(app\)` returns zero.
- [x] 3.2 Bulk-replace `tFmt` in shared/cart components: `src/components/cart/CartView.tsx` (`cart.removed`, `cart.partnerDiscountApplied`), `src/components/cart/CartSheet.tsx`, `src/components/cart/CheckoutForm.tsx` — same import/call replacement — verify `grep -rn "tFmt" src/components` returns zero.
- [x] 3.3 Sweep remaining codebase for stray `tFmt` with `grep -rn "tFmt" src --include="*.ts" --include="*.tsx"` and `grep -rn "from \"@/lib/t\".*tFmt" src` — verify both return empty; fix any additional hits (e.g., `src/app/(app)/categories/...`, `src/app/(app)/brands/...` if discovered).

## 4. Verification

- [x] 4.1 Run `bun tsc --noEmit` and verify exit code 0 with no `TS2554`/`TS2305` errors (previously the `Expected 2 arguments` and `has no exported member 'tFmt'` errors must be gone).
- [x] 4.2 Run `bun run build` and verify successful production build (Next.js 16) with no type or interpolation errors — check last 20 lines of build output for `✓ Compiled successfully`.
- [x] 4.3 Spot-check type safety: in a temporary `tsc` snippet verify `t("common.products")` compiles without second arg, `t("products.pagination", {page:1, totalPages:2, count:10})` compiles, `t("products.pagination", {})` fails, and `t("products.pagination", {page:1})` fails for missing keys — remove snippet after check.
- [x] 4.4 Confirm no `tFmt` remains and `bun` usage is clean with `grep -rn "tFmt" src && echo FAIL || echo PASS` and `git diff --stat` showing only `src/lib/t.ts` + `src/app/(app)/**/*` + `src/components/**/*` changes under `src/app/(app)` (no writes to `src/app/(payload)` or `src/app` root).
