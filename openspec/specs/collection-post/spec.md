# Collection Post

## Purpose
This spec defines the `posts` Payload CMS collection used to power the blog system. Posts are created and managed by administrators and employees via the Payload admin panel using the Lexical rich-text editor (`@payloadcms/richtext-lexical`). Published posts are publicly readable and indexed by search engines to improve SEO; unpublished (draft) posts are hidden from the public frontend.

## Requirements

### Requirement: Post Name

The system MUST require a `name` field for every post. The `name` SHALL be a required text field, used as the human-readable title of the post and as the admin `useAsTitle`. Posts without a name cannot be created.

#### Scenario: Create post with name
- **GIVEN** An authenticated admin or employee user is creating a post
- **WHEN** The user fills in the post name and submits the form
- **THEN** The post is saved successfully

#### Scenario: Cannot create post without name
- **GIVEN** An authenticated admin or employee user is creating a post
- **WHEN** The user submits the form without providing a name
- **THEN** The system rejects the submission
- **AND** An error message indicates that the name is required

#### Scenario: Post name is displayed in admin list
- **GIVEN** At least one post exists
- **WHEN** An admin views the posts list in the admin panel
- **THEN** Each row displays the post `name` as its title

### Requirement: Post Slug

The system SHOULD generate a URL-friendly `slug` for each post derived from `name`. The `slug` SHALL be unique, required, and used as the public URL identifier (`/blog/[slug]`). If not provided manually, the system MAY auto-generate it. The slug MUST be validated to contain only lowercase alphanumeric characters and hyphens.

#### Scenario: Slug auto-generated from name
- **GIVEN** An admin creates a post with name "How to Choose Copper Pipes"
- **WHEN** The admin saves without manually entering a slug
- **THEN** The system generates slug `how-to-choose-copper-pipes`

#### Scenario: Duplicate slug is rejected
- **GIVEN** A post already exists with slug `copper-guide`
- **WHEN** An admin tries to create another post with the same slug
- **THEN** The system rejects the submission with a uniqueness error

#### Scenario: Post is accessible via slug on frontend
- **GIVEN** A published post exists with slug `copper-guide`
- **WHEN** A visitor navigates to `/blog/copper-guide`
- **THEN** The post detail page is displayed

### Requirement: Post Content (Rich Text)

The system MUST provide a `content` field using Payload's Lexical rich-text editor (`@payloadcms/richtext-lexical`). The editor is already installed (`@payloadcms/richtext-lexical@3.88.0`) and configured globally via `lexicalEditor()` in `src/payload.config.ts`. No additional package installation is required beyond assigning the field type. The `content` field SHALL support headings, paragraphs, bold/italic/underline, lists (ordered/unordered), links, blockquotes, and embedded images via the `media` collection (upload). Content SHALL be stored as Lexical JSON and rendered to HTML on the frontend.

#### Scenario: Admin writes content with rich-text features
- **GIVEN** An authenticated admin is creating a post
- **WHEN** The admin uses the Lexical editor to add headings, bold text, a bullet list, a link, and an embedded image
- **THEN** The content is saved as Lexical JSON in the database

#### Scenario: Rich-text content is rendered on frontend
- **GIVEN** A published post exists with formatted Lexical content
- **WHEN** A visitor views the post at `/blog/[slug]`
- **THEN** The content is rendered as semantic HTML preserving headings, lists, links, and images

#### Scenario: Empty content is allowed (draft)
- **GIVEN** An admin creates a post with only a name
- **WHEN** The admin saves with empty content
- **THEN** The post is saved as a draft (published = false) without error

#### Scenario: Editor configuration uses global lexicalEditor
- **GIVEN** The Payload config has `editor: lexicalEditor()` globally
- **WHEN** The `posts` collection defines `content` with `type: 'richText'`
- **THEN** The admin panel displays the Lexical editor without additional field-level `editor` config

### Requirement: Post Published Status

The system MUST provide a `published` boolean field that controls public visibility. The field SHALL default to `false` (draft/hidden). Only posts with `published = true` SHALL be returned by public frontend queries and be indexable by crawlers. Draft posts SHALL NOT appear in blog listings, sitemaps, or be accessible via direct URL for unauthenticated visitors (return 404).

#### Scenario: Post is hidden by default
- **GIVEN** An admin creates a post without changing the published toggle (default false)
- **WHEN** A visitor navigates to `/blog`
- **THEN** The post does NOT appear in the listing

#### Scenario: Published post appears on frontend
- **GIVEN** A post exists with `published = true`
- **WHEN** A visitor navigates to `/blog`
- **THEN** The post is displayed in the listing

#### Scenario: Draft post is not accessible via direct URL
- **GIVEN** A post exists with `published = false` and slug `draft-post`
- **WHEN** A visitor navigates to `/blog/draft-post`
- **THEN** The system returns a 404 Not Found page

#### Scenario: Admin toggles published status
- **GIVEN** An admin is editing a draft post
- **WHEN** The admin sets `published` to true and saves
- **THEN** The post becomes publicly visible immediately

### Requirement: Post Cover Image and Excerpt (SEO Support)

The system SHOULD support an optional `coverImage` (relationship/upload to `media`) and an optional `excerpt` (textarea, max 160 characters) for SEO previews and social sharing. When present, the excerpt SHALL be used as the meta description fallback and the cover image as the Open Graph image.

#### Scenario: Post with cover image and excerpt
- **GIVEN** An admin creates a post with a cover image and excerpt "Learn how to choose copper pipes..."
- **WHEN** The post is published and viewed on `/blog/[slug]`
- **THEN** The cover image is displayed at the top of the article
- **AND** The excerpt is used in the page `<meta name="description">`

#### Scenario: Post without cover image or excerpt
- **GIVEN** A post has no cover image or excerpt
- **WHEN** The post is rendered
- **THEN** No cover image is displayed
- **AND** The meta description falls back to a truncated plain-text version of the content
- **AND** No error occurs

### Requirement: Post Timestamps and Ordering

The system MUST automatically track `createdAt` and `updatedAt` for each post (Payload default). Posts SHALL be ordered by `createdAt` descending (newest first) in both admin and frontend listings unless explicitly sorted otherwise. An optional `publishedAt` date field MAY be set automatically when `published` transitions from false to true for SEO `article:published_time`.

#### Scenario: Posts are ordered newest first
- **GIVEN** Three published posts exist with different creation dates
- **WHEN** A visitor views `/blog`
- **THEN** Posts are displayed sorted by creation date descending

#### Scenario: publishedAt is set on first publish
- **GIVEN** A draft post has no publishedAt date
- **WHEN** An admin sets `published` to true and saves
- **THEN** The system sets `publishedAt` to the current timestamp

### Requirement: Post Management (Admin)

Administrators and employees MUST be able to create, read, update, and delete posts via the Payload admin panel (`/admin`). The collection SHALL be registered in `src/payload.config.ts` and use `admin.useAsTitle = 'name'`.

#### Scenario: Create a new post
- **GIVEN** An authenticated admin is in the post creation form
- **WHEN** The user provides a name, rich-text content, sets published as needed, and submits
- **THEN** The post is saved in the database
- **AND** If published, it appears on `/blog` immediately

#### Scenario: Update an existing post
- **GIVEN** An authenticated admin is editing a published post
- **WHEN** The user modifies name, content, published, cover image, or excerpt and saves
- **THEN** The post is updated
- **AND** Changes are reflected on the frontend

#### Scenario: Delete a post
- **GIVEN** An authenticated admin views a post
- **WHEN** The user deletes the post
- **THEN** The post is removed from the database
- **AND** It no longer appears on the frontend
- **AND** Its slug returns 404

#### Scenario: Employee can manage posts
- **GIVEN** An authenticated employee user is in the admin panel
- **WHEN** The employee creates or edits a post
- **THEN** The operation succeeds (same permissions as admin for this collection)

### Requirement: Post Access Control

The system MUST enforce access control: public (unauthenticated) users SHALL only read posts where `published = true`; authenticated admin/employee users SHALL have full CRUD access; customers SHALL NOT access the admin panel but SHALL read published posts on the frontend. The collection's `access.read` SHALL filter by `published` for non-admin contexts, while `access.create/update/delete` SHALL require admin or employee role.

#### Scenario: Public user reads only published posts via REST API
- **GIVEN** The database contains one published and one draft post
- **WHEN** An unauthenticated request is made to `GET /api/posts`
- **THEN** Only the published post is returned

#### Scenario: Admin reads all posts via admin API
- **GIVEN** An authenticated admin makes a request to `GET /api/posts`
- **WHEN** The request includes a valid admin session
- **THEN** Both published and draft posts are returned

#### Scenario: Customer attempts to access admin panel for posts
- **GIVEN** A user with role `customer` is logged in
- **WHEN** The user navigates to `/admin/collections/posts`
- **THEN** Access is denied and the user is redirected to `/`

#### Scenario: Unauthenticated user cannot create a post via API
- **GIVEN** No user is authenticated
- **WHEN** A POST request is made to `/api/posts` with valid data
- **THEN** The system returns 401/403 and no post is created
