## Why

Biome `lint/nursery/noReactNativeRawText` (info) flags raw text and whitespace outside `<Text>` — currently ~13 violations under `biome lint .` and ~30+ under `biome lint src/app` across `src/app/(app)` pages (breadcrumbs, separators, pagination and empty states). The violations are false-positives for Next.js web but block `biome lint` cleanliness and signal i18n gaps: hardcoded English strings (`Home`, `Blog`, `No content.`, `No articles yet`, etc.) and decorative separators (`›`, `/`, `·`, `—`) should go through the existing i18n helper `t` from `src/lib/t.ts` / `src/lib/locale.ts` instead of inline raw text.

## What Changes

- Add missing locale keys to `src/lib/locale.ts` for all flagged raw text (breadcrumb separators, inline separators, empty states, pagination fragments, blog/brands/categories UI strings currently hardcoded).
- Update pages under `src/app/(app)` to replace raw text with `t("…")` calls (with placeholders where needed) so `biome lint` no longer flags them:
  - `src/app/(app)/about/page.tsx` — breadcrumb separator `›` (`:42`)
  - `src/app/(app)/account/page.tsx` — `›`, whitespace, `·`, `—` (`:58`, `:77`, `:88`)
  - `src/app/(app)/blog/page.tsx` and `src/app/(app)/blog/[slug]/page.tsx` — `Home`, `Blog`, `/`, `›`, `No content.`, `No articles yet`, `Check back…`, `Back to home`, pagination `Page {n} of {m} · {count} articles`
  - `src/app/(app)/brands/page.tsx`, `src/app/(app)/brands/[slug]/page.tsx`, `src/app/(app)/categories/page.tsx`, `src/app/(app)/categories/[slug]/page.tsx` — `/` separators and whitespace-joined counts/labels (`Brands:`, `All brands in …`, etc.)
- Keep all public UI under `src/app/(app)` (no writes to `src/app/(payload)` or `src/app` root). No visual token changes — existing `DESIGN.md` tokens (`{colors.ink}`, `{colors.mute}`, `{typography.*}`, `{rounded.*}`) remain as-is; only string source changes.
- Verify with `bunx --bun biome lint . --colors=off` and `bunx --bun biome lint src/app --colors=off` that `noReactNativeRawText` count is 0; no biome config override added (fix is via `t`, not rule suppression).
- Runner/manager is `bun` (`bunx --bun …`, `bun run …`); UI primitives remain `shadcn` + `beui` (`@beui/*` via `bunx --bun shadcn@latest` when needed) — registry search confirms no new component needed for this string-only change.

## Capabilities

### New Capabilities

<!-- No new product capabilities — pure lint/i18n hygiene fix -->

### Modified Capabilities

<!-- No spec-level requirement changes — existing specs unchanged -->

## Impact

- **Code**: `src/lib/locale.ts`, `src/lib/t.ts` (no change, re-used), and ~8 route files under `src/app/(app)` listed above. No Payload CMS collections/globals changes.
- **Specs**: None — this change sets `skip_specs: true` (zero deltas expected; `openspec validate` would reject without the marker). Behavior is i18n-consistency only, not new user-facing capability.
- **Dependencies**: None. Lint only — `biome.json` nursery rule `noReactNativeRawText` stays `info`; no new packages.
- **Risks**: Locale key naming collision — mitigate by namespacing under existing prefixes (`common.*`, `blog.*`, `brands.*`, `categories.*`, `account.*`). Missing interpolation placeholder checked by `t` type (`Placeholders<Locale[K]>`).
