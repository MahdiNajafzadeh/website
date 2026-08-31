## ADDED Requirements

### Requirement: Posts collection respects payload skill and (app) routing

The `posts` Payload collection (`name`, `slug`, `content` Lexical, `published`, `coverImage`, `excerpt`, `publishedAt`) SHALL be defined per `.agents/skills/payload/SKILL.md` (collection config, `lexicalEditor()` already global, `admin.useAsTitle='name'`, `access.read` checks `published` for public). Frontend reads SHALL go through `src/app/(app)/blog/**` server components filtering `where[published][equals]=true`.

#### Scenario: Payload collection registers correctly
- **WHEN** `src/payload.config.ts` is loaded with the `posts` collection per skill conventions
- **THEN** `bun run generate:types` includes `Post` types and `lexicalEditor` renders without field-level editor override

#### Scenario: Public API hides drafts
- **WHEN** an unauthenticated `GET /api/posts` is made after collections are registered
- **THEN** only `published=true` posts are returned, verified via `bunx --bun vitest` integration test
