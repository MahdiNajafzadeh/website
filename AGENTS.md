<!-- BEGIN:payload-cms-agent-rules -->

This project uses the Payload CMS skill at `.agents/skills/payload/` (symlinked to `.claude/skills/payload/` and `.opencode/skills/payload/`).
Start with `.agents/skills/payload/SKILL.md` for a quick reference, then see `.agents/skills/payload/reference/` for detailed docs.
ALWAYS load this skill before working with Payload collections, globals, fields, hooks, access control, or jobs.

<!-- END:payload-cms-agent-rules -->

<!-- BEGIN:design-system-agent-rules -->

This project has a design system spec at `DESIGN.md` (Google `design.md` format) at the repo root — a Nike-based e-commerce visual language: front-matter tokens (colors, typography, spacing, rounded, components) + prose specs.
ALWAYS read `DESIGN.md` before any UI/design work (colors, typography, spacing, radii, component specs). Reference its tokens directly (e.g. `{colors.ink}`, `{typography.button-md}`, `{rounded.full}`, `{component.button-primary}`) instead of inventing ad-hoc values. After editing `DESIGN.md`, lint it with `bunx @google/design.md lint DESIGN.md` (`broken-ref`, `contrast-ratio`, `orphaned-tokens` warnings).

<!-- END:design-system-agent-rules -->

<!-- BEGIN:nextjs-agent-rules -->
 
# This is NOT the Next.js you know
 
This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.
 
This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.
 
<!-- END:nextjs-agent-rules -->
