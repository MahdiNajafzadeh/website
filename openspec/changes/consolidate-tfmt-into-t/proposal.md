## Why

The i18n helper `src/lib/t.ts` currently exposes two functions (`t` and `tFmt`) with overlapping responsibilities, and the recent attempt to make `t` type-safe introduced broken `Placeholders`/`Vars` types that force callers to pass a second argument even for keys without placeholders (producing ~150 `TS2554: Expected 2 arguments` errors). Consolidating to a single, correctly-typed `t` removes the duplication, restores `bun tsc --noEmit` to green, and prevents silent runtime mismatches between locale keys and placeholder vars.

## What Changes

- **BREAKING** — Remove `tFmt` export from `src/lib/t.ts` and replace all 11 call sites with the unified `t` function (front-end changes target `src/app/(app)` only — e.g., `src/app/(app)/page.tsx`, `products/page.tsx`, `categories/page.tsx`, `about/page.tsx`, `blog/page.tsx`, and shared components `components/cart/*`).
- Fix `Placeholders<T>` and `Vars<T>` so placeholder extraction from locale strings (`{page}`, `{discount}`, `{siteName}`, etc. in `src/locale.json`) correctly yields a union of placeholder names and a `Record<name, string|number>` only when placeholders exist.
- Update `t` signature to be truly optional for keys without placeholders and required for keys with placeholders (via conditional rest tuple `...args: Placeholders<Locale[K]> extends never ? [] : [vars: Vars<Locale[K]>]`), eliminating the false-positive `Expected 2 arguments` errors.
- Runtime `t` implementation coalesces `args[0]` to `{}` when no vars are needed and iterates `Object.entries` with `replaceAll` for interpolation.
- Remove all `tFmt` imports/usages across the codebase and re-export only `t` (plus `Locale`/`LocaleKey` helper types); keep the auxiliary `s` helper only if still referenced, otherwise remove.
- Verification via `bun tsc --noEmit` and `bun run build` with no type errors.

## Capabilities

### New Capabilities

_None_ — no new product behavior; this is a developer-experience / type-safety refactor.

### Modified Capabilities

_None_ — locale keys, rendered copy, and interpolation semantics are unchanged; only the helper's type contract and call sites change. No `openspec/specs/` requirement text changes, so `skip_specs: true` is set in `.openspec.yaml` (pure refactor, behavior preserved).

## Impact

- **Code**:
  - `src/lib/t.ts` — remove `tFmt`, fix `Placeholders`/`Vars`, change `t` to conditional rest args, adjust runtime impl.
  - `src/locale.json` — read-only reference for type inference (`typeof locale`), no edits.
  - Front-end consumers under `src/app/(app)` — `src/app/(app)/page.tsx`, `src/app/(app)/products/page.tsx`, `src/app/(app)/categories/page.tsx`, `src/app/(app)/about/page.tsx`, `src/app/(app)/blog/page.tsx`, `src/components/cart/CartView.tsx`, `CartSheet.tsx`, `CheckoutForm.tsx` (all `tFmt` → `t`).
  - Any remaining `src/app/(app)/**/*` files importing `tFmt` (verified via `grep -rn tFmt`).
- **APIs / Dependencies**: None — no Payload, no DB, no new packages. UI remains on existing `shadcn`/`beui` components already installed; no new `bunx --bun shadcn@latest add @beui/<slug>` or registry lookup required (existing `shadcn` + `beui (@beui)` stack unchanged). `bun` remains the sole runner (`bun tsc --noEmit`, `bun run build`, `bun run generate:types` if needed).
- **Tests / Tooling**: `bun tsc --noEmit` must pass; `bun run build` must succeed; existing Vitest/Playwright suites that assert rendered copy continue to pass because output strings are identical.
- **Design system**: No visual changes — `DESIGN.md` tokens (`{colors.*}`, `{typography.*}`, `{rounded.*}`, `{component.*}`) are not touched; this change does not add or restyle UI.
- **Payload CMS**: Out of scope — no collections/globals/hooks changes; payload skill at `.agents/skills/payload/SKILL.md` does not need to be loaded.
