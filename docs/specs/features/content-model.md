# Content Model — Implementation Spec

## Goal
Where the data lives for Articles, Projects, Uses, and Resume. All four are typed TS files under `src/content/`.

## Requirements covered
- §FR-1.2.5 (Resume), §FR-1.2.6 (Projects), §FR-1.2.7 (Uses), §FR-1.2.8 (Articles).
- §NFR-2.1.4 — TypeScript strict.

## File layout
- `src/content/articles/index.ts` — loader + `ArticleMeta` + `ArticleWithSlug` types.
- `src/content/articles/<slug>.tsx` — one file per article. Each exports `meta` + default React component.
- `src/content/projects.ts` — typed `Project[]`.
- `src/content/uses.ts` — typed categories list.
- `src/content/resume.ts` — typed `Role[]`.
- `src/lib/formatDate.ts` — pure helper.

## Behavior & edge cases
- Articles loader (canonical shape in `architecture.md` §4.9). Modules are hand-registered (no runtime glob).
- Adding an article = two edits: drop the new TSX file under `src/content/articles/`, then add an `import` and a key in the `modules` record in `index.ts`.
- `formatDate` matches Spotlight verbatim: `en-US`, day/long-month/year, UTC — e.g. `"May 18, 2026"`.
- Typed shapes:
  - `Project = { name: string; description: string; link: { href: string; label: string }; logo: string }`.
  - `UsesCategory = { category: string; tools: Array<{ title: string; href?: string; description: string }> }`.
  - `Role = { company: string; title: string; logo: string; start: string; end: string }`.

## Test plan
- **Smoke** (`bun test`):
  - `getAllArticles()` returns ≥ 1 article and is sorted by date descending.
  - Each project in `projects.ts` has all four required fields.
  - `formatDate("2026-05-18")` returns `"May 18, 2026"`.

## Open questions
- Slug regex / validation. Default: lowercase-kebab from the filename, no runtime validation.
- Whether to support an `image` field on `ArticleMeta` for OG cards. Default: defer.
