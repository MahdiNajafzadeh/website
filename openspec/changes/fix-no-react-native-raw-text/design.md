## Context

See `proposal.md` — Why. Current state: `src/lib/t.ts` exports `t<K extends LocaleKey>(key, vars?)` over `src/lib/locale.ts` (default export object, Persian-first store). `biome.json` enables `linter.rules.nursery.noReactNativeRawText = "info"` without overrides, so every raw string in JSX (including `›`, `/`, `·`, `—`, whitespace-joined counts, and hardcoded English like `Home`/`Blog`) is flagged. The rule is React-Native-oriented but runs on Next.js web; existing pages under `src/app/(app)` already use `t()` for most UI but left a subset of breadcrumbs, separators, pagination fragments and empty states hardcoded. `DESIGN.md` (Nike, `version: alpha`) is the token source — colors `{colors.ink}` `#111111`, `{colors.mute}` `#707072`, `{colors.soft-cloud}` `#f5f5f5`, typography `{typography.heading-xl}`/`{typography.caption-md}`, radii `{rounded.lg}` `30px`, components `{component.button-primary}` pill `bg-[#111111]` / `{component.product-card}` — none of which change here; only string source moves to `t`.

Front-end structure (unchanged, `src/app/(app)` route group):

```
src/app/(app)/
  about/page.tsx
  account/page.tsx
  blog/page.tsx
  blog/[slug]/page.tsx
  brands/page.tsx
  brands/[slug]/page.tsx
  categories/page.tsx
  categories/[slug]/page.tsx
  layout.tsx
src/lib/
  locale.ts   # ← new keys added here
  t.ts        # re-used, no edit
```

Payload CMS (`(payload)` route group, collections/globals) is out of scope — `.agents/skills/payload/SKILL.md` was consulted and confirmed not needed for this lint-only change. UI registry check: `bunx --bun shadcn@latest search` / `curl -fsS https://beui.dev/r/registry.json` shows no beui/shadcn component to install — this is a string-only fix; existing `Card`, `Badge`, `Pagination` from `shadcn` remain.

## Goals / Non-Goals

**Goals:**
- Zero `noReactNativeRawText` diagnostics after `bunx --bun biome lint .` and `bunx --bun biome lint src/app` (info level) without touching `biome.json`.
- Every user-visible raw string in flagged `src/app/(app)` files routed through `t()` with typed placeholders (`Placeholders<Locale[K]>` / `Vars<T>`), preserving current Persian/English copy and `DESIGN.md` chrome.
- Locale keys namespaced (`common.*`, `blog.*`, `brands.*`, `categories.*`, `account.*`, `breadcrumbs.*`) so no collision.

**Non-Goals:**
- Suppressing the rule via `biome.json` `overrides`/`skip` or downgrading to `off` — explicitly rejected per requirement to use `t`.
- Changing visual tokens, layout, routing, or Payload schema — `DESIGN.md` lint (`bunx @google/design.md lint DESIGN.md`) must stay clean and no `src/app/(payload)` edits.
- Adding a new i18n framework (e.g. `next-intl`) — `src/lib/t.ts` remains the single helper.

## Decisions

**D1 — Fix via `t` interpolation, not per-span `<Text>` or rule override.**
- *Rationale:* Requirement is "fix with using `t` function". `t()` return is lint-exempt (already used for `common.home` etc. without flag) and gives typed interpolation; wrapping each separator in `<Text>` is React-Native-specific and unnecessary for Next.js web. Overriding `biome.json` would hide real i18n debt.
- *Alternative rejected:* `biome.json` overrides `[{ "include": ["src/app/**"], "linter": { "rules": { "nursery": { "noReactNativeRawText": "off" } } } }]` — hides English hardcoding; separates.
- *Alternative rejected:* Create a `<Text>` wrapper component — adds runtime indirection for a false-positive rule.

**D2 — Locale key shape: separator keys + fragment keys + full-sentence keys.**
- *Rationale:* Biome flags three patterns: (a) lone separators (`›`, `/`), (b) whitespace between sibling expressions (`{count} {t(…)}` → flagged whitespace), (c) raw sentences (`No articles yet`). Fix each with the minimal `t` surface:
  - Separators: `common.breadcrumbSeparator` = `"›"` and `common.breadcrumbSeparatorSlash` = `"/"` (or single `common.separator` parametrized) — one `t()` call per `<span aria-hidden>{t("…")}</span>` eliminates lone-text flag.
  - Whitespace-joined counts: combine into one interpolated key, e.g. `brands.countLabel: "{count} {label}"` or `common.countWithLabel: "{count} {label}"` → `{t("brands.countLabel", { count: brands.length.toLocaleString("fa-IR"), label: t("common.brands") })}` removes inter-expression whitespace. Similarly `account.userMeta: "{firstName} {lastName} · {phone}"` and `account.profileWithPhone: "{profile} — {phone}"`, `blog.pagination: "Page {page} of {totalPages} · {totalDocs} articles"` and `blog.articleCount: "{count} articles"` variants.
  - Raw English sentences: add faithful keys reusing existing translations where possible — `blog.emptyTitle: "No articles yet"`, `blog.emptyHint: "Check back soon for new stories."`, `blog.backToHome: "Back to home"`, `blog.noContent: "No content."`, `categories.brandsLabel: "Brands:"`, etc., keeping English as value until Persian copy is supplied (no behavior change, just lint compliance).
- *Alternative rejected:* Embed separators inside adjacent `t` values (e.g. `"Home › Brands"` as one key) — couples breadcrumb structure to translation and complicates dynamic segment `{brand.name}`.

**D3 — Keep `src/lib/t.ts` unchanged, extend only `src/lib/locale.ts`.**
- *Rationale:* `t` already supports `Vars<T>` placeholder substitution via `replaceAll`; no new runtime needed. Adding keys to the single source object keeps type inference (`LocaleKey`) automatic.
- *Trade-off:* English-only new keys (until translations added) — acceptable for lint fix; follow-up can provide Persian values.

**D4 — Scope covers all flagged `src/app/(app)` files, not just the four named in the initial grep.**
- *Rationale:* `biome lint src/app` reveals additional flags in `brands/*`, `categories/*`, `blog/page.tsx` pagination that would re-appear in CI after partial fix. Proposal lists the superset; tasks enumerate per-file fixes.
- *Verification:* `bunx --bun biome lint . --colors=off 2>&1 | grep noReactNativeRawText | wc -l` must be `0`.

**D5 — registry / DESIGN.md compliance.**
- *Registry lookup:* `bunx --bun shadcn@latest search` confirms no new `@beui/*` component needed; existing `Card`/`Badge`/`Pagination` usage stays.
- *DESIGN.md:* No token changes — breadcrumbs keep `{typography.caption-md}` `14px/500` + `{colors.mute}` `#707072` with `aria-label="Breadcrumb"`, heading keeps `{typography.heading-xl}` `32px/500`, empty states keep `{colors.soft-cloud}` `#f5f5f5` + `{rounded.lg}` `30px`, pill CTA keeps `{component.button-primary}`. Lint after: `bunx @google/design.md lint DESIGN.md` (no edit, so clean).

**D6 — Commands use `bun`.**
- All invocations are `bunx --bun biome lint …`, `bun run build`, `bun run generate:types` (if Payload touched — not needed here). No `npx`/`pnpm`.

## Risks / Trade-offs

- **[Risk] Whitespace flag on `{a} {b}` is structural — naive `{t("count")} {label}` still has flagged whitespace between expressions.** → Mitigation: use single interpolated key per D2 (e.g. `t("common.countWithLabel", { count, label })`) so JSX contains exactly one expression.
- **[Risk] Locale key English placeholder accepted as-is obscures future Persian translation need.** → Mitigation: keys prefixed `blog.*`/`brands.*`/`categories.*` with TODO comment in `locale.ts`; behavior unchanged, translation added later without code change.
- **[Risk] Separator via `t` still a single character — translators might expect no translation.** → Mitigation: document separator keys as decorative; value is same across locales now, can be overridden per locale later.
- **[Risk] Wide file touch (8 files) could introduce unrelated formatting churn (biome formatter tabs vs spaces).** → Mitigation: run `bunx --bun biome check --write` only on touched lines or keep `indentStyle: "tab"` as in `biome.json`; verify `git diff --stat` shows only string changes.
- **[Risk] Missing `t` import in files not yet importing it (e.g. `blog/[slug]/page.tsx`, `categories/[slug]/page.tsx`).** → Mitigation: tasks add `import { t } from "@/lib/t"` where absent.

## Migration Plan

1. Add locale keys to `src/lib/locale.ts` (no breaking change — additive).
2. Update `src/app/(app)` pages per D2 to use `t()` (single commit, front-end only).
3. Verify: `bunx --bun biome lint . --colors=off 2>&1 | grep noReactNativeRawText` → 0 lines; `bunx --bun biome lint src/app --colors=off` → 0; `bun run build` passes; no `biome.json` change.
4. Rollback: revert the one commit — locale keys are unused elsewhere, no migration.

## Open Questions

- None blocking — separator character choice (`›` vs `/` per route) is preserved; if design wants unification to one separator, a follow-up `DESIGN.md` decision can change `common.breadcrumbSeparator` value without code change.
