## Context

Four Payload collections — `Brands`, `Categories`, `Products`, `Posts` — currently implement slug generation with an identical 6-line `slugify` function and an identical `beforeValidate` hook, copy-pasted across all four files. The pattern has three gaps Payload's native `type: 'slug'` field closes: (1) no admin UI affordance (the editor types `name` and the slug fills silently on save); (2) no application-layer uniqueness check — collisions only fail at the SQLite `UNIQUE` constraint with an opaque DB message; (3) no `<singular>-N` fallback when the source field is empty on create — empty-name creates save with `slug = null` and rely on the DB nullable column. Payload 3.88 ships `slugField()` (`payload/dist/fields/baseFields/slug/index.js`) which produces a Row containing a hidden `generateSlug` checkbox (whose `beforeChange` hook runs `generateSlug.ts`) and a `type: 'text'` field whose `admin.components.Field` overrides the render with the `SlugField` client component from `@payloadcms/ui/dist/fields/Slug/index.js` (the generate + lock/unlock UI). On click, the client invokes `useServerFunctions().slugify` → `slugifyHandler` in `@payloadcms/next/dist/utilities/slugify.js`, which resolves the field by path, reads the user's `field.custom.slugify` (or falls back to `payload/shared` `slugify`), and returns the formatted slug. The official ecommerce template (`~/.src/payload/templates/ecommerce/src/collections/`) uses `{ name: 'slug', type: 'slug', useAsSlug: 'title' }` for `Products`, `Categories`, and `Pages` with no hooks or custom code — confirming this is the supported path.

Constraints in force:

- Stack: Next.js 16 (App Router), Payload CMS 3.88.0, Tailwind v4, bun. Verified `payload`, `@payloadcms/next`, `@payloadcms/ui` all expose the native slug surface in this version.
- Package manager is `bun` only — commands run as `bun run`, `bunx --bun ...`.
- Public front-end stays under `src/app/(app)`; `(payload)` is reserved; no front-end code is touched in this change.
- No `DESIGN.md` impact — admin chrome is Payload-owned; tokens govern only public storefront surfaces.
- Skills: `.agents/skills/payload/SKILL.md` is referenced in `AGENTS.md` but currently missing on disk (the `.agents/skills/payload/` directory does not exist). Payload work in this change proceeds against the verified installed packages and the official ecommerce template. No `shadcn` or `beui` work is in scope.

## Goals / Non-Goals

**Goals:**

- Replace four copy-pasted `slugify` + `beforeValidate` blocks with a single declarative field type.
- Surface the native SlugField UI to admins: lock by default, unlock to edit, generate button to re-slugify from the configured source.
- Gain application-layer uniqueness validation (`generateSlug` calls `fieldValueExists` and throws `ValidationError` with a translated message instead of relying on the DB constraint).
- Gain the `<singular>-N` fallback for empty source values on create (e.g. a product with no name saves as `products-1` rather than failing).
- Preserve all other collection behavior — `Posts.beforeChange` (publishedAt), `Posts.afterChange` (ISR revalidation), access rules, `useAsTitle: 'name'`, `admin.useAsTitle`, all field configs other than `slug`.

**Non-Goals:**

- A custom `slugify` function override. Payload's default `slugify` (`payload/shared`) lowercases and replaces whitespace with hyphens; the existing 6-line `slugify` also strips non-`[a-z0-9-]` characters and collapses runs of dashes. Existing slugs in the DB are already ASCII lowercase + hyphens (they were produced by this exact fn), so switching to Payload's default does not change any existing slug value. If a future product line requires non-ASCII slug support, a custom `slugify` can be passed to `slugField({ slugify: ... })` without changing this design.
- Localized slugs. None of the four collections set `localized: true` on the slug field today; this change does not introduce localization.
- Slug field position. Native default is `position: 'sidebar'` for the row; existing code has the slug field inline (no position override). Keeping it inline means passing `admin: { position: undefined }` per the ecommerce template's pattern (see `~/.src/payload/templates/ecommerce/src/collections/Categories.ts:27`).
- A `/admin`-side customization (e.g. dark-mode tweak, custom lock icon). The shipped SlugField component is used as-is.
- Migration of existing data. Slug values already in the DB remain unchanged.

## Decisions

### 1. Adopt the native slug field with `useAsSlug: 'name'`

Use `slugField({ useAsSlug: 'name', position: undefined })` from `payload`. `slugField()` returns a `Row` containing a hidden `generateSlug` checkbox (whose `beforeChange` hook runs `generateSlug.ts`) and a `type: 'text'` field whose `admin.components.Field` overrides the render with the `SlugField` client component. **`useAsSlug: 'name'`** matches the existing `useAsTitle: 'name'` and the existing source value the hand-rolled hook read from.

> **Note on FieldType literal:** The Payload ecommerce template (`~/.src/payload/templates/ecommerce/src/collections/Categories.ts:25`) uses the literal form `{ name: 'slug', type: 'slug', useAsSlug: 'title' }`. That template is on the `4.0.0-canary.14` workspace version where `FieldType` includes `'slug'` (verified at `~/.src/payload/packages/payload/src/fields/config/types.ts`). **Our installed `payload@3.88.0` does not include `'slug'` in its `FieldType` union** — TS rejects `type: 'slug'` with `Type '"slug"' is not assignable to type '"number" | "array" | "blocks" | ...'`. The `slugField()` factory sidesteps this: it returns a `Row`-typed field, so the literal-string check never fires. Runtime behavior is identical (admin renders the same SlugField component, the same hook runs, the same uniqueness validation fires). The ecommerce template's pattern will start working here on Payload 4.

- **File changes:**
  - `src/collections/Brands.ts` — add `import { slugField } from 'payload'`, remove `slugify` fn (lines 4-10), remove `hooks.beforeValidate` (lines 23-36), replace slug field (lines 44-53) with `slugField({ useAsSlug: 'name', position: undefined })`.
  - `src/collections/Categories.ts` — same shape as Brands.
  - `src/collections/Products.ts` — same shape as Brands.
  - `src/collections/Posts.ts` — same shape; `useAsSlug: 'name'` (matches `useAsTitle`); the existing `beforeChange` (publishedAt) and `afterChange` (ISR revalidation) hooks on the collection stay untouched.
- **Field flags:** `slugField()` defaults are `required: true`, `unique: !disableUnique`, `index: true`, `position: 'sidebar'`. All four collections already had `unique: true` and `index: true` on the text-based slug. `required: true` is unchanged for `Posts` (was already `required: true`) and is a behavior shift for `Brands`/`Categories`/`Products` (was `required: false`).
- **Admin position:** the inline forms put the slug inside the main edit panel, not the sidebar. Pass `position: undefined` to keep the Row inline (matches `Categories.ts` in the ecommerce template's intent, which uses `admin: { position: undefined }` directly on the slug field — same goal, different mechanism per version).
- **Field shape change:** the slug is no longer a single flat field in the collection's `fields` array; it is now a Row containing a hidden checkbox + the visible text-input-with-SlugField-override. Visually identical from the editor's perspective (a single slug input with the lock/generate buttons). The hidden `generateSlug` checkbox carries the actual slug-generation `beforeChange` hook; this is what makes the auto-fill and uniqueness validation happen.
- **Alternative considered:** keep the `slugify` + `beforeValidate` pattern and just write a small client component for the "generate" button. Rejected — duplicates Payload's tested logic, doesn't gain the `<singular>-N` fallback or server-side uniqueness validation, and leaves 60 lines of code on the floor.
- **Alternative considered:** use the literal `{ type: 'slug', useAsSlug: 'name' }` form with a `// @ts-expect-error` comment. Rejected — relies on a payload canary-only FieldType, defeats our own typechecker, and would need to be revisited on every Payload upgrade. `slugField()` is the version-portable path.

### 2. Delete the `beforeValidate` hooks — no replacement

The native field's `generateSlug` hook (`generateSlug.ts`) runs in `beforeChange` on the hidden `generateSlug` checkbox inside the row, which Payload executes on every save. The hand-rolled `beforeValidate` hook on the collection is no longer needed and is removed in all four files.

- `Posts.ts` keeps its `beforeChange` hook (lines 37-54) — that one sets `publishedAt` on the `post` document, unrelated to slug. `Posts.afterChange` (lines 55-72) also stays — that one calls Next's `revalidatePath` / `revalidateTag` for ISR.
- The behavior shift in `beforeValidate` → `beforeChange`: the native hook runs *after* field validation. The hand-rolled hook ran *before* validation. Net effect on a valid save is identical (slug ends up populated); on a save with an empty `name`, the native hook produces `products-1` and the save succeeds, whereas the hand-rolled hook left the slug empty and `required: true` validation (on `Posts`) would have failed. This is the desired shift.

### 3. Keep the slug `required: true` behavior shift for Brands/Categories/Products

The native field defaults `required: true`. The proposal calls this out as **BREAKING** for the three collections where it was `required: false`. Reasoning:

- The native field's `<singular>-N` fallback guarantees a valid unique slug exists at create time, so the save never fails on a missing slug.
- A brand / category / product with no `name` becomes `brands-1` / `categories-1` / `products-1` — clearly identifiable as a placeholder, and the admin can rename + click "generate" to fix it without breaking the URL (the slug stays stable on subsequent saves once set).
- This matches Payload's documented intent for the field ("the slug is guaranteed to exist on create").
- If `required: false` is preferred, pass `slugField({ required: false })` or override the row's text field. Not done in this change — the proposal documents the shift and the spec deltas encode it.

### 4. Regenerate `payload-types.ts` and the import map

After the collection edits:

- `bun run generate:types` — regenerates `src/payload-types.ts`. The `slug` field's type narrows from `string | null` (under `required: false`) to `string` (under `required: true`). The TS compiler will surface any consumer that relied on `slug` being possibly null — expected to be zero, since all four collections have `unique: true` and existing slugs were always populated for saved documents.
- `bun run generate:importmap` — regenerates `src/app/(payload)/admin/importMap.js`. The SlugField client component path (`@payloadcms/next/client#SlugField`) is already shipped by the package; the import map either stays unchanged or adds an explicit slot. No custom component is being added.

### 5. Verify in the admin panel — manual smoke test

The collection integration test (`tests/int/api.int.spec.ts`) exercises read access, not slug generation. A manual smoke pass against the running dev server is the verification:

1. `bun run dev`, log into `/admin` as an admin user.
2. **Brands:** create a brand with name "Acme Co" → confirm slug is `acme-co`, the field shows the lock icon, clicking unlock reveals the generate button, clicking generate re-runs slugify and shows `acme-co` again. Edit the name to "Acme Inc" → save without touching the slug → confirm slug stays `acme-co` (stability). Save with empty name → confirm slug falls back to `brands-1` or similar and the save succeeds.
3. **Categories, Products:** same flow.
4. **Posts:** confirm the existing `publishedAt` and ISR-revalidation behavior still works (publish a draft, observe it appears at `/blog/[slug]`).
5. **Collision:** create two brands with the same name → confirm the second create returns a translated `valueMustBeUnique` validation error rather than a raw SQLite constraint error.

## Risks / Trade-offs

- **[Behavior shift for empty-name creates]** → For Brands/Categories/Products, an empty `name` now saves with a `<singular>-N` fallback slug instead of `slug = null`. Mitigation: documented as **BREAKING** in `proposal.md`; the spec delta for each collection encodes the new requirement. Admin can rename + regenerate to fix the URL.
- **[Slug stability is stricter than before]** → Once set, the slug never regenerates automatically — the admin must click "generate" or unlock + edit. The hand-rolled `beforeValidate` re-slugified whatever the user typed (including lock-state input). For Brands/Categories/Products this is the correct behavior (URLs are stable across name changes). For Posts, an editor renaming a post mid-draft won't see the slug follow unless they click generate. Mitigation: documented in the post spec delta ("The system SHOULD regenerate the slug when the editor clicks the generate button"). No automated UI warning is added — out of scope.
- **[v3.88.0 wires the field via component override, not as a first-class type]** → The `RenderField.js` switch has no `"slug"` case; the field renders because `slugField()` produces a Row whose text field has `admin.components.Field: { path: '@payloadcms/next/client#SlugField' }`. This works today, but it's a structural fragility — if a future Payload release deprecates the client-component path, the field silently stops rendering. Mitigation: tested at `node_modules/@payloadcms/next/dist/utilities/handleServerFunctions.js` (registered) and `node_modules/@payloadcms/ui/dist/fields/Slug/index.js` (component exists); this is the same path the official ecommerce template relies on. Flag in `Open Questions` for a Payload 4 migration in a separate change.
- **[No automated tests added]** → Vitest/Playwright scaffolding exists; we leave coverage for slug stability, collision rejection, and fallback to a follow-up change. The risk is regression on those three behaviors without an automated check. Mitigation: documented in `tasks.md` §5 as the smoke-test step.
- **`generate:types` may surface unexpected type errors in consumers** → Anything reading `slug: string | null` from generated types will need to narrow to `string`. Likely zero consumers exist (storefront pages always treat slug as a required URL param), but a `bunx tsc --noEmit` after `generate:types` is part of the task list.
- **[Schema push needed on existing SQLite DB]** → `slugField()` adds a hidden `generateSlug` checkbox that maps to a `generate_slug` DB column. Existing dev/test DBs do not have this column. Locally, `bunx payload migrate:create --name slug-fields` + `bunx payload migrate:fresh` recreates the schema. **In a production deployment this column needs to be added via a proper migration script** — added to `Migration Plan` above. The follow-up task (§8) flags broader test-infra work (separate test DB, push-on-init) so that future schema changes can be tested without `migrate:fresh`.

## Migration Plan

**Schema migration is required.** `slugField()` produces a Row containing a hidden `generateSlug` checkbox field that maps to a new `generate_slug` DB column on every affected table (`brands`, `categories`, `products`, `posts`). Existing SQLite tables do not have this column. No data is at risk for the new column itself (it defaults to `true`, derived from the row's `defaultValue`), but running a `migrate:create` against an unversioned DB treats every existing table as new — so the migration script must be reviewed and applied.

For dev/test:

1. `bunx payload migrate:create --name slug-fields` generates `src/migrations/<timestamp>.{ts,json}` covering all field changes (slugs as Row + the `generate_slug` column on each collection).
2. `bunx payload migrate:fresh` drops the local `website.db` and applies the new migration from scratch.
3. Confirm `bun run test:int` passes against the fresh DB.

For production deployment, the same migration file is applied via `bunx payload migrate` (after review). No data conversion is needed — existing `slug` values stay intact (the column rename `/ data shape` is non-destructive; the `generate_slug` column gets `true` as default, which preserves current behavior).

Implementation order (this session):

1. Edit `src/collections/{Brands,Categories,Products,Posts}.ts` per §1 of `Decisions`.
2. `bun run generate:types` → regenerate `src/payload-types.ts`.
3. `bun run generate:importmap` → confirm SlugField is registered.
4. `bunx payload migrate:create --name slug-fields` → generates migration files.
5. `bunx payload migrate:fresh` → applies migration against local DB (wipes local dev data, fine for dev).
6. `bunx tsc --noEmit` → verify zero new type errors.
7. `bun run dev`, perform the manual smoke pass in §6 of `Decisions`.
8. `bun run lint` → confirm no new lint errors (currently broken pre-existing — see Risks).
9. `bun run test:int`, `bun run test:e2e` → confirm smoke tests still pass.
10. Rollback: revert the four collection file edits + delete the new `src/migrations/<timestamp>.{ts,json}` if not yet committed; restore `website.db` from a backup if needed.

## Open Questions

- **Payload 4 migration:** the slug field is a true first-class type in Payload 4 canary (verified at `~/.src/payload/packages/payload/src/fields/baseFields/slug/`), removing the v3.88 component-override fragility. A separate change can move to Payload 4 and simultaneously simplify the slug wiring. Not in scope here.
- **Custom `slugify` for non-ASCII support:** if a future product line needs Persian/Arabic/Unicode slug support, pass `slugify: ({ valueToSlugify }) => ...` to `slugField()`. Today's data is ASCII; not needed yet.
- **Lock-icon UX on locked-then-saved field:** when an editor unlocks, edits, saves, and revisits the doc, does the field re-lock? The native component stores lock state in local React state, not on the document, so re-entering the edit form starts it locked again. That's the intended behavior. Documenting here so a future spec doesn't accidentally promise otherwise.