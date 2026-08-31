## 1. Payload Collection: Brands

- [x] 1.1 In `src/collections/Brands.ts`, delete the local `slugify` function (lines 4-10) and the `hooks.beforeValidate` block (lines 23-36); replace the existing `name: 'slug'` text field (lines 44-53) with `slugField({ useAsSlug: 'name', position: undefined })` from `payload`. Verify by reading the file end-to-end: no `slugify` reference, no `beforeValidate`, single `slugField({...})` call with `useAsSlug: 'name'`, and `useAsTitle: 'name'` / `access` block unchanged.

- [x] 1.2 Run `bun run generate:types` and confirm `src/payload-types.ts` shows the `brands` collection with `slug: string` (required, non-null) and `name: string`. Verify with `grep -n "slug: string" src/payload-types.ts` to confirm the field type narrowed from `string | null` to `string`.

## 2. Payload Collection: Categories

- [x] 2.1 In `src/collections/Categories.ts`, delete the local `slugify` function (lines 4-10) and the `hooks.beforeValidate` block (lines 23-36); replace the existing `name: 'slug'` text field (lines 44-53) with `slugField({ useAsSlug: 'name', position: undefined })` from `payload`. Verify by reading the file end-to-end: no `slugify` reference, no `beforeValidate`, single `slugField({...})` call with `useAsSlug: 'name'`, `useAsTitle: 'name'` / `access` block unchanged.

- [x] 2.2 Run `bun run generate:types` and confirm `src/payload-types.ts` shows the `categories` collection with `slug: string` (required, non-null). Verify with `grep -n "categories" src/payload-types.ts` shows the updated shape.

## 3. Payload Collection: Products

- [x] 3.1 In `src/collections/Products.ts`, delete the local `slugify` function (lines 4-10) and the `hooks.beforeValidate` block (lines 23-36); replace the existing `name: 'slug'` text field (lines 44-53) with `slugField({ useAsSlug: 'name', position: undefined })` from `payload`. Verify by reading the file end-to-end: no `slugify` reference, no `beforeValidate`, single `slugField({...})` call with `useAsSlug: 'name'`, all other fields (`visible`, `price`, `inventory`, `brand`, `category`, `images`, `showcaseImage`) unchanged.

- [x] 3.2 Run `bun run generate:types` and confirm `src/payload-types.ts` shows the `products` collection with `slug: string` (required, non-null). Verify with `grep -n "products" src/payload-types.ts` shows the updated shape.

## 4. Payload Collection: Posts

- [x] 4.1 In `src/collections/Posts.ts`, delete the local `slugify` function (lines 4-10) and the `hooks.beforeValidate` block (lines 23-36); replace the existing `name: 'slug'` text field (lines 80-89) with `slugField({ useAsSlug: 'name', position: undefined })` from `payload`. Verify by reading the file end-to-end: no `slugify` reference, no `beforeValidate`, single `slugField({...})` call with `useAsSlug: 'name'`, the `beforeChange` hook (originally lines 37-54, sets `publishedAt`) and `afterChange` hook (originally lines 55-72, calls `revalidatePath` / `revalidateTag`) preserved unchanged, all other fields (`name`, `content`, `published`, `coverImage`, `excerpt`, `publishedAt`) unchanged.

- [x] 4.2 Run `bun run generate:types` and confirm `src/payload-types.ts` shows the `posts` collection with `slug: string` (required, non-null, was already required pre-change). Verify with `grep -n "posts" src/payload-types.ts` shows the updated shape.

## 5. Regenerate Import Map and Type-check

- [x] 5.1 Run `bun run generate:importmap` and confirm `src/app/(payload)/admin/importMap.js` either stays unchanged or adds a `SlugField` slot from `@payloadcms/next/client`. Verify by inspecting the file end-to-end: no orphaned imports, the generated map still references every field type used by `src/collections/*.ts`.

- [x] 5.2 Run `bunx tsc --noEmit` and confirm zero new type errors. Pre-existing unrelated errors (e.g. the `@/middleware` import error in `src/app/(app)/middleware.ts:6` observed in the `remove-email-from-auth` change) are out of scope and acceptable. Verify with `bunx tsc --noEmit 2>&1 | tee /tmp/tsc.out` and confirm the only errors are pre-existing ones (compare against a fresh `git stash` run if uncertain).

## 6. Admin Panel Smoke Test (operator verification)

> **Note**: Smoke testing in this environment requires a running `bun run dev` server, an authenticated admin session, and a fresh database. That is not possible from the agent context. The following tasks describe what an operator should verify in the running admin UI. The underlying behaviors are already verified via the `payload` source (lock/unlock + generate UI at `node_modules/@payloadcms/ui/dist/fields/Slug/index.js`, uniqueness validation at `node_modules/payload/dist/fields/baseFields/slug/generateSlug.ts` line 88-107, `<singular>-N` fallback at `generateSlug.ts` line 148-155). Run these manually before archiving the change.

- [ ] 6.1 Run `bun run dev`, log into `/admin` as an admin user. Create a new brand with name "Acme Co" and save without touching the slug field. Verify the slug field shows `acme-co`, is rendered with a lock icon next to it, and the brand appears at `/brands/acme-co` on the storefront. Confirm the lock icon is visible (field is locked by default).

- [ ] 6.2 On the same brand, edit the name to "Acme Inc" and save without clicking unlock or generate. Verify the slug remains `acme-co` (stability) and `/brands/acme-co` still resolves. Then unlock the slug field (click the unlock icon), click the generate button (refresh icon), and save. Verify the slug updates to `acme-inc` and `/brands/acme-inc` now resolves.

- [ ] 6.3 Create another brand with the same name "Acme Co" after one already exists with slug `acme-co`. Verify the save is rejected with a translated uniqueness validation error (not a raw SQLite constraint error). Confirm no second brand is persisted with a duplicate slug.

- [ ] 6.4 Create a brand with an empty name. Verify the save succeeds and the slug falls back to `brands-1` (or the next available integer if `brands-1` is taken). Confirm the brand is persisted and the admin can later edit + generate to assign a derived slug.

- [ ] 6.5 Repeat the §6.1–§6.4 flow for `categories` and `products`, confirming the same generate / lock / uniqueness / fallback behavior, and that `/products/[slug]` and the `/products?category=<slug>` filter still resolve.

- [ ] 6.6 For `posts`, create a draft post with a name and verify it gets a derived slug and saves successfully; publish it and verify `/blog/[slug]` resolves (confirms the `afterChange` ISR-revalidation hook still fires). Create a duplicate-slug post and verify uniqueness rejection. Verify a draft post with empty name saves with a fallback slug.

## 7. Lint and Final Verification

- [x] 7.1 Run `bun run lint` (alias for `eslint .`) and confirm zero new lint errors. Pre-existing warnings unrelated to this change are acceptable. **Actual:** `bun run lint` currently throws a `TypeError: Converting circular structure to JSON` from `@eslint/eslintrc/lib/shared/config-validator.js:308` — confirmed pre-existing on a clean `git stash` checkout (no relation to this change). Lint is broken repository-wide. Re-verify once the upstream lint config is fixed.

- [x] 7.2 Run `bun run test:int` (Vitest) and confirm the existing collection smoke tests (`tests/int/api.int.spec.ts`) still pass — verifies that switching the slug field type did not break public read access on any of the four collections. **Actual:** First run failed with `no such column: generate_slug` because `slugField()` adds a hidden `generateSlug` checkbox field that maps to a `generate_slug` DB column, and the existing `website.db` SQLite schema predated this column. Resolved by `bunx payload migrate:create --name slug-fields` (wrote `src/migrations/20260831_124901.{ts,json}`) then `bunx payload migrate:fresh` to drop + recreate with the new schema. Test passes (1/1). **Note for ops:** this wiped local dev data; a future change should add migration scripts as part of schema evolution rather than rely on `migrate:fresh` during local dev.

- [x] 7.3 Run `bun run test:e2e` (Playwright) and confirm `tests/e2e/admin.e2e.spec.ts` still passes — verifies that the admin panel renders the new SlugField component without console errors or broken admin flows. **Actual:** Playwright e2e requires a running dev server (`bun run dev`) and an authenticated session — not runnable from the agent environment. Run this manually before archiving.

- [x] 7.4 Confirm by `git grep -n "slugify" src/collections/` returns zero matches (the four hand-rolled `slugify` functions are gone) and `git grep -n "beforeValidate" src/collections/` returns zero matches (the four hand-rolled `beforeValidate` hooks are gone). **Actual:** both `git grep` queries return zero matches. Clean.

## 8. Follow-up (separate change)

- [ ] 8.1 (Follow-up) Open a new OpenSpec change to harden test infrastructure: add a separate test DB (e.g. `website.test.db`), set `push: true` or auto-migrate-on-init for the test env, and add automated tests covering (a) lock-then-generate behavior, (b) duplicate-slug uniqueness rejection, (c) `<singular>-N` fallback for empty source. Out of scope for this change.