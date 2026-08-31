## MODIFIED Requirements

### Requirement: Post Slug

The system MUST generate a URL-friendly `slug` for every post, derived from the post's `name` field. The `slug` SHALL be unique across the `posts` collection, indexed, required, and SHALL be used as the public URL identifier (`/blog/[slug]`). The slug MUST be validated to contain only lowercase URL-safe characters.

The slug field MUST be rendered in the admin panel as Payload's native `SlugField`: locked by default with a lock/unlock button, and exposing a "generate" button when unlocked that re-runs the slugify function against the post's current `name` value. Once a slug is set on a post, the system MUST NOT regenerate it automatically when `name` is later edited; the editor MUST click the generate button (or unlock and edit) to change the slug.

When a post is created without a `name`, the system MUST auto-assign a fallback slug of the form `posts-<N>` where `<N>` is the lowest positive integer that yields a unique slug across the collection. The fallback slug SHALL be presented to the editor in the admin panel just like any other slug and is editable like any other slug.

#### Scenario: Slug auto-generated from name

- **GIVEN** An admin creates a post with name "How to Choose Copper Pipes"
- **WHEN** The admin saves without manually entering a slug
- **THEN** The system generates slug `how-to-choose-copper-pipes`

#### Scenario: Slug remains stable when name changes

- **GIVEN** A post exists with name "How to Choose Copper Pipes" and slug `how-to-choose-copper-pipes`
- **WHEN** The admin edits the name to "How to Choose Premium Copper Pipes" and saves without clicking the generate button or unlocking the slug field
- **THEN** The slug remains `how-to-choose-copper-pipes`
- **AND** The existing URL `/blog/how-to-choose-copper-pipes` continues to resolve to the post

#### Scenario: Editor regenerates slug from updated name

- **GIVEN** A post exists with name "How to Choose Copper Pipes" and slug `how-to-choose-copper-pipes`
- **WHEN** The admin edits the name to "How to Choose Premium Copper Pipes", unlocks the slug field, clicks the generate button, and saves
- **THEN** The slug becomes `how-to-choose-premium-copper-pipes`
- **AND** The new slug becomes the canonical URL for the post

#### Scenario: Duplicate slug is rejected

- **GIVEN** A post exists with slug `copper-guide`
- **WHEN** An admin attempts to create or update another post to have slug `copper-guide`
- **THEN** The system rejects the operation with a uniqueness error
- **AND** No post is saved with a duplicate slug

#### Scenario: Post is accessible via slug on frontend

- **GIVEN** A published post exists with slug `copper-guide`
- **WHEN** A visitor navigates to `/blog/copper-guide`
- **THEN** The post detail page is displayed

#### Scenario: Fallback slug assigned when name is empty on create

- **GIVEN** No post exists with slug `posts-1`
- **WHEN** An admin creates a post with an empty name and saves
- **THEN** The system stores slug `posts-1`
- **AND** The save succeeds without a validation error
- **AND** The post can later be renamed; once a non-empty name is set, the admin unlocks the slug field, clicks generate, and the slug becomes the derived value