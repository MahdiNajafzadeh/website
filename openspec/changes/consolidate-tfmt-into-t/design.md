## Context

See `proposal.md` — Why for motivation. Current state: `src/lib/t.ts` exports `t(ref: LocaleKey): string` and `tFmt(ref, vars)` (runtime-only typing). An uncommitted refactor in `src/lib/t.ts:5-14` attempted type-safe `t` with `Placeholders`/`Vars` but its signature `t<K>(ref: K, vars: Placeholders<Locale[K]> extends never ? {} : Vars<...>)` forces a second argument even for keys without placeholders, causing `TS2554` across ~15 `(app)` routes and components. `tFmt` remains in use at 11 call sites under `src/app/(app)` (e.g., `page.tsx:211`, `products/page.tsx:413`, `categories/page.tsx:214`, `about/page.tsx:15`, `components/cart/CartView.tsx:67`). Locale source is `src/locale.json` (imported as `typeof locale`); placeholder style is single-brace `{name}`. No Payload collections, no new UI components, and no DESIGN.md token changes are involved. Front-end changes are strictly call-site replacements inside `src/app/(app)`; `(payload)` remains isolated.

## Goals / Non-Goals

**Goals:**
- Single export `t` that is type-safe for placeholder keys and ergonomic for plain keys, with zero duplication.
- Correct `Placeholders` extraction for zero, one, and multiple `{vars}` per string (e.g., `products.pagination: "صفحه {page} از {totalPages} · {count} محصول"` → `"page" | "totalPages" | "count"`).
- Delete `tFmt` and migrate all 11 usages to `t` without changing rendered copy or runtime output.
- Restore `bun tsc --noEmit` and `bun run build` to green.

**Non-Goals:**
- Changing locale keys, copy, or interpolation syntax (still `{var}` + `replaceAll`); no ICU/plural/select support.
- Adding new UI components — existing `shadcn` + `beui (@beui)` registry components remain as-is; no `bunx --bun shadcn@latest add @beui/<slug>` or registry lookup required.
- Payload work — no `src/collections/*` or globals changes; `.agents/skills/payload/SKILL.md` does not need to be consulted.
- Visual restyling — `DESIGN.md` tokens (`{colors.ink}`, `{colors.soft-cloud}`, `{typography.button-md}`, `{rounded.full}`, `{component.button-primary}`, etc.) are read-only reference; no component specs change.

## Decisions

**Decision 1 — Fix `Placeholders<T>` to `T extends \`${string}{${infer P}}${infer R}\`` recursion.**
- Rationale: The current `T extends \`${infer _}{${infer Key}}${infer Rest}\`` works but is fragile when inferring empty prefix and obscures intent. Using `${string}` for the prefix makes the empty-prefix case explicit and matches idiomatic template-literal extraction.
- Alternative considered: Regex-based runtime extraction or a helper like `ExtractPlaceholders` with `infer` + `extends never` guard — rejected because compile-time inference is required for type safety and the template-literal recursion is the standard pattern.

**Decision 2 — Define `Vars<S>` as `Placeholders<S> extends never ? never : Record<Placeholders<S>, string | number>`.**
- Rationale: `never` for plain keys lets the rest-tuple collapse to `[]`, making the second argument disappear. `Record<..., string|number>` matches current runtime (`String(value)`).
- Alternative: `Record<string, string|number>` (current `tFmt` style) — rejected because it abandons key-specific checking.

**Decision 3 — Use conditional rest tuple for `t` instead of optional second param.**
- Signature: `export function t<K extends LocaleKey>(key: K, ...args: Placeholders<Locale[K]> extends never ? [] : [vars: Vars<Locale[K]>]): string`
- Rationale: Optional param `vars?: Vars<...>` would allow omitting required vars for placeholder keys (silent bug). Rest tuple makes plain-key calls `t("common.products")` legal with one arg and placeholder-key calls `t("products.pagination", {page, totalPages, count})` required with two args, enforced at compile time.
- Alternative: Two overloads (`t(key: NoPlaceholderKey): string` / `t(key: PlaceholderKey, vars: ...): string`) — functionally equivalent but duplicates JSDoc and is harder to maintain; rest tuple is terser and scales automatically.

**Decision 4 — Runtime coalesces `args[0] as Record<string,string|number> | undefined` to `{}` and iterates with `replaceAll`.**
- Rationale: Preserves current interpolation semantics (one pass per entry, string coercion). No need for regex or `Intl`.
- Alternative: Single `replace` with global regex — rejected because `replaceAll` is already used and clearer.

**Decision 5 — Remove `tFmt` entirely and bulk-replace imports.**
- Rationale: Single source of truth eliminates drift between `t` and `tFmt`. Grep confirms 11 call sites, all inside `src/app/(app)`; migration is mechanical (`import { tFmt }` → `import { t }`, `tFmt(` → `t(`).
- Alternative: Keep `tFmt` as deprecated alias — rejected per change brief ("remove `tFmt` function").

**Decision 6 — Keep `s` helper only if referenced; otherwise delete.**
- Rationale: `export function s<K,V>(k:K): V {}` is unused in current grep results; if no consumers exist it is dead code. Decision deferred to implementation: delete if `grep -rn "\bs\b.*from.*t"` finds no callers.

## Risks / Trade-offs

- [Type-distribution pitfall] `Placeholders<Locale[K]>` distribution over union `LocaleKey` could widen incorrectly → Mitigation: `Locale[K]` is a single string literal per `K` (indexed access on `typeof locale`), so conditional operates on one string at a time; validated with `bun tsc --noEmit` on keys with 0/1/3 placeholders.
- [Missing placeholder at runtime] Caller passes extra/missing var keys → compile-time error prevents most cases; runtime fallback leaves unmatched `{var}` literal visible, which surfaces immediately in UI — acceptable for dev-time feedback.
- [Empty-prefix edge] Strings starting with `{count}` (e.g., `home.hero.stats.products: "{count} کالا"`) must still extract `count` → Mitigation: `${string}` prefix matches empty string, verified in unit test.
- [Bulk rename misses] `tFmt` string literal search misses dynamic imports → Mitigation: `grep -rn tFmt --include="*.ts" --include="*.tsx" src/` exhaustive; no dynamic usage expected.
- [No visual regression] Interpolation change could subtly alter copy → Mitigation: runtime still `replaceAll(`{${k}}`, String(v))`; output identical to previous `tFmt`; manual spot-check of `products.pagination` and `about.subtitle` in `src/app/(app)` routes.

## Migration Plan

1. Patch `src/lib/t.ts`: fix types, switch to rest-tuple `t`, remove `tFmt`, adjust impl to `args[0] ?? {}`.
2. Bulk edit `src/app/(app)/**/*` and `src/components/**/*` — replace `tFmt` imports/usages with `t` (files: `src/app/(app)/page.tsx`, `src/app/(app)/products/page.tsx`, `src/app/(app)/categories/page.tsx`, `src/app/(app)/about/page.tsx`, `src/app/(app)/blog/page.tsx`, `src/components/cart/CartView.tsx`, `CartSheet.tsx`, `CheckoutForm.tsx`).
3. Verify `ls src/app/\(app\)` still contains all edited pages (front-end isolation check).
4. Run `bun tsc --noEmit` — expect zero errors (previously ~150). Run `bun run build` — expect success.
5. Optional: `bun run generate:types` if locale types are regenerated (no Payload change, so likely no-op).
6. Rollback: revert single commit restoring `src/lib/t.ts` + `tFmt` call sites; no DB migration.

## Open Questions

- None — placeholder syntax is fixed to `{name}` and locale file is the single source; no deferred unknowns that would change specs, approach, or tasks.
