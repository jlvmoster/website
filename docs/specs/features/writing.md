# Writing — Implementation Spec

## Goal
Section that reserves placement for a future blog post list. v1 renders an empty state only.

## Requirements covered
- §FR-1.2.2 — Empty state, placeholder for future post list.
- §GP-3.1 — Must be replaceable by an MDX-backed post list later without restructuring siblings.

## File layout
- `src/components/Writing.tsx`.
- Imported into `src/App.tsx` between Hero and About.

## Behavior & edge cases
- Section element has `id="writing"`.
- Renders a heading (e.g., `Writing`) and an empty-state line — copy below is the working default.
- Empty-state body should be a single child component (or inline JSX block) so swapping to `<PostList />` later touches one location.
- No fetching, no state, no client-side routing in v1.

## Test plan
- **Unit:** renders the section heading and the empty-state line.
- **E2E:** section is visible on page load.

## Open questions
- Empty-state copy: "First post coming soon." vs something less placeholder-y? Default to that line unless you object.
