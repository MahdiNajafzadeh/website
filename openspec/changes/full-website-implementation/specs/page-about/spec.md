## ADDED Requirements

### Requirement: About page under (app) with Payload global and DESIGN tokens

`src/app/(app)/about/page.tsx` (`/about`) SHALL render the `page-about` Payload global Lexical content (or empty state) server-side, using `shadcn` Breadcrumb and verified `beui` sections, styled with `{colors.ink}`, `{colors.canvas}`, `{typography.heading-xl}`, `{typography.body-md}`, `{rounded.lg}`. SEO title `About Us | {siteName}` and metadata from base spec are preserved.

#### Scenario: About page renders Lexical under (app)
- **WHEN** a user navigates to `/about` via `src/app/(app)/about/page.tsx` with `page-about` content set
- **THEN** rich text is rendered via `@payloadcms/richtext-lexical` RichText with `{typography.body-md}` and breadcrumb `Home › About Us` uses `{typography.caption-md}`

#### Scenario: Empty about shows friendly state
- **WHEN** `page-about` has no content and `/about` is visited
- **THEN** a centered empty state using `{colors.mute}` and `{typography.body-md}` is shown without error
