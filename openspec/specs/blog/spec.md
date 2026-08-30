# Blog

## Purpose
This spec defines the public-facing blog system of the e-commerce platform. The blog exposes Payload `posts` (from `collection-post`) to visitors and search-engine crawlers to improve SEO. It provides a blog listing section, individual post pages, and SEO/crawler integrations. Content is authored in the Payload admin with the Lexical rich-text editor and rendered as SEO-friendly HTML on the frontend.

## Requirements

### Requirement: Blog Listing Page

The system MUST provide a publicly accessible blog listing page at `/blog` that displays all published posts. Each list item SHALL show the post name, excerpt (or truncated content), cover image (if present), and publication date. The page SHALL be paginated (default 12 posts per page) and ordered newest first. Draft posts (`published = false`) SHALL NOT appear.

#### Scenario: Visitor views blog listing with published posts
- **GIVEN** At least three published posts exist
- **WHEN** A visitor navigates to `/blog`
- **THEN** All published posts are displayed as cards in descending creation date order
- **AND** Each card shows name, excerpt, cover image thumbnail, and date

#### Scenario: Blog listing hides draft posts
- **GIVEN** One published and one draft post exist
- **WHEN** A visitor navigates to `/blog`
- **THEN** Only the published post is visible
- **AND** The draft post is not rendered and not in the HTML source

#### Scenario: Empty blog listing
- **GIVEN** No published posts exist
- **WHEN** A visitor navigates to `/blog`
- **THEN** A friendly empty state is displayed (e.g., "No articles yet")
- **AND** No error occurs

#### Scenario: Blog listing pagination
- **GIVEN** 13 published posts exist and page size is 12
- **WHEN** A visitor navigates to `/blog`
- **THEN** The first 12 posts are displayed with a pagination control
- **WHEN** The visitor navigates to `/blog?page=2`
- **THEN** The remaining 1 post is displayed

### Requirement: Blog Detail Page

The system MUST provide a public detail page for each published post at `/blog/[slug]` that renders the full Lexical rich-text content as HTML. The page SHALL display the post name as `<h1>`, the cover image (if any), the formatted publish date, and the rich-text body. Draft posts SHALL return 404 for public users.

#### Scenario: Visitor views a published post
- **GIVEN** A published post exists with slug `copper-guide` and Lexical content containing headings, lists, and links
- **WHEN** A visitor navigates to `/blog/copper-guide`
- **THEN** The page displays the post name as H1
- **AND** The rich-text content is rendered as semantic HTML preserving formatting

#### Scenario: Visitor tries to view a draft post
- **GIVEN** A post exists with slug `draft-article` and `published = false`
- **WHEN** A visitor navigates to `/blog/draft-article`
- **THEN** The system returns a 404 Not Found page

#### Scenario: Non-existent slug returns 404
- **GIVEN** No post exists with slug `unknown-slug`
- **WHEN** A visitor navigates to `/blog/unknown-slug`
- **THEN** The system returns a 404 Not Found page

### Requirement: Blog Content Rich-Text Rendering

The system MUST render Lexical JSON from `posts.content` to HTML using `@payloadcms/richtext-lexical`'s server component (`RichText` or `payload generate:types` output). All formatting (headings, bold/italic, lists, blockquotes, links, embedded media) SHALL be preserved. Images embedded in content SHALL have alt text and be responsive. The rendering MUST be compatible with both light and dark themes.

#### Scenario: Rich-text with all formatting is rendered correctly
- **GIVEN** A post contains H2, bold, italic, ordered list, link, and an inline image
- **WHEN** The detail page loads
- **THEN** Each element is rendered with correct semantic tags (`<h2>`, `<strong>`, `<ul>`, `<a>`, `<img>`)
- **AND** No raw JSON is visible

#### Scenario: Embedded media image is displayed
- **GIVEN** A post's Lexical content includes an image block referencing `media` ID 5
- **WHEN** The detail page loads
- **THEN** The image is displayed with its `alt` text and responsive sizing

### Requirement: Blog SEO Metadata

Every blog listing and detail page MUST include SEO metadata. The detail page title SHALL be `"{post.name} | {siteName}"` and meta description SHALL use `excerpt` if present, otherwise truncated plain-text of `content` (max 160 chars). Open Graph tags (`og:title`, `og:description`, `og:image`, `og:type=article`) and `article:published_time` SHALL be set. Canonical URL SHALL be `https://{domain}/blog/[slug]`.

#### Scenario: Detail page meta title and description are generated
- **GIVEN** Site Settings has siteName "Abafarin" and a post has name "Copper Guide" and excerpt "Learn about copper..."
- **WHEN** The visitor loads `/blog/copper-guide`
- **THEN** The `<title>` is "Copper Guide | Abafarin"
- **AND** `<meta name="description">` content is "Learn about copper..."
- **AND** `og:title` and `og:description` match

#### Scenario: Detail page Open Graph image uses coverImage
- **GIVEN** A post has coverImage with URL `https://example.com/media/cover.jpg`
- **WHEN** The detail page loads
- **THEN** `<meta property="og:image">` is set to the cover image URL

#### Scenario: Listing page has SEO title and description
- **GIVEN** A visitor navigates to `/blog`
- **WHEN** The page loads
- **THEN** The title is "Blog | {siteName}" (or localized equivalent)
- **AND** A meta description like "Read the latest articles from {siteName}" is present

### Requirement: Blog Crawler Indexability and Sitemap

Published posts MUST be indexable by search-engine crawlers. The system SHALL include all published post URLs in the sitemap (`/sitemap.xml`) and allow crawling via `robots.txt`. Draft posts SHALL be excluded from the sitemap and include `noindex` if ever rendered. The blog listing and detail pages SHALL be server-rendered (SSR/SSG) so crawlers receive full HTML without requiring JavaScript execution. The system SHOULD expose an RSS feed at `/blog/rss.xml` listing published posts.

#### Scenario: Published post appears in sitemap
- **GIVEN** A post with slug `copper-guide` is published
- **WHEN** A crawler fetches `/sitemap.xml`
- **THEN** The URL `https://{domain}/blog/copper-guide` is present with `<lastmod>` equal to `updatedAt`

#### Scenario: Draft post is excluded from sitemap
- **GIVEN** A draft post with slug `draft-article` exists
- **WHEN** A crawler fetches `/sitemap.xml`
- **THEN** The draft URL is NOT present

#### Scenario: Blog pages are server-rendered for crawlers
- **GIVEN** A published post exists
- **WHEN** Googlebot fetches `/blog/copper-guide` with JavaScript disabled
- **THEN** The response HTML already contains the post name, meta tags, and body content

#### Scenario: RSS feed contains published posts
- **GIVEN** Two published posts exist
- **WHEN** A client fetches `/blog/rss.xml`
- **THEN** The feed contains two `<item>` entries with title, link, description, and pubDate

### Requirement: Blog Navigation and Breadcrumb

The blog section SHALL include navigation aids: a link to `/blog` in the main header/navigation, and a breadcrumb trail on detail pages. The breadcrumb SHALL be `Home › Blog › {post.name}` with clickable `Home` and `Blog` segments.

#### Scenario: Blog link is visible in header
- **GIVEN** A visitor is on any page
- **WHEN** The header loads
- **THEN** A "Blog" link is visible and points to `/blog`

#### Scenario: Detail page breadcrumb is displayed
- **GIVEN** A visitor is on `/blog/copper-guide`
- **WHEN** The page loads
- **THEN** A breadcrumb shows "Home › Blog › Copper Guide"
- **AND** "Home" links to `/` and "Blog" links to `/blog`

### Requirement: Blog Visibility respects Published Flag (Frontend Filtering)

All frontend data fetching for the blog (listing, detail, sitemap, RSS, related posts) SHALL filter with `where: { published: { equals: true } }` or equivalent access control. The Payload `posts` collection's public read access MUST enforce this so direct API queries cannot leak drafts. Preview of drafts MAY be allowed only for authenticated admin/employee via a preview route with authentication.

#### Scenario: Direct API query without auth cannot fetch drafts
- **GIVEN** One draft and one published post exist
- **WHEN** An unauthenticated `fetch('/api/posts?where[published][equals]=false')` is attempted from the browser
- **THEN** No draft data is returned (access denied or empty)

#### Scenario: Admin preview can view draft
- **GIVEN** An authenticated admin has a draft post with slug `draft-article`
- **WHEN** The admin navigates to a preview URL like `/blog/draft-article?preview=true` with valid auth
- **THEN** The draft content is rendered (preview mode)
- **AND** The page includes `<meta name="robots" content="noindex, nofollow">`

### Requirement: Blog Accessibility and Theming

Blog pages SHALL be accessible (WCAG AA) and respect the site's theming system (light/dark/system). Rich-text content SHALL use CSS variables for colors so it adapts to dark mode. Images SHALL have alt text, links SHALL be keyboard-accessible, and headings SHALL follow a logical hierarchy (H1 for post title, H2/H3 inside content).

#### Scenario: Blog respects dark mode
- **GIVEN** The user has selected dark mode
- **WHEN** The visitor navigates to `/blog` and `/blog/[slug]`
- **THEN** Backgrounds, text, and rich-text elements use dark theme CSS variables without flash of light theme

#### Scenario: Rich-text content is accessible
- **GIVEN** A post contains images and links
- **WHEN** A screen-reader user navigates the detail page
- **THEN** Images have alt text announced
- **AND** Links have discernible names
- **AND** Headings are navigable by heading level

### Requirement: Blog Performance and Caching

Blog pages SHOULD be statically generated or cached with ISR (Incremental Static Regeneration) where possible. After a post is published or updated, the cache for `/blog` and `/blog/[slug]` SHALL be revalidated so changes appear promptly without full redeployment.

#### Scenario: Newly published post appears after revalidation
- **GIVEN** A post is newly set to `published = true`
- **WHEN** The system revalidates the blog paths (via Payload hook or webhook)
- **THEN** `/blog` and `/blog/[slug]` serve the updated content on next request without manual deploy

#### Scenario: Blog listing loads quickly
- **GIVEN** The blog listing page is requested
- **WHEN** The page loads
- **THEN** The initial HTML is served from cache (if available) and interactive elements hydrate without blocking content display
