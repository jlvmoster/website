# Task 09 — Projects & Uses

## Goal
Build the Projects page (three-column card grid) and the Uses page (Section-based tool list).

## Source spec
- `requirements.md` §FR-1.2.6, §FR-1.2.7

## Prereqs
- Task 08.
- User-provided: project list, uses categories + tools, project logos under `public/images/logos/`.

## Steps

1. **Create `src/content/projects.ts`** — typed `Project[]` (placeholders OK if user hasn't shipped final list yet).
2. **Create `src/content/uses.ts`** — typed categories array.
3. **Rewrite `src/pages/ProjectsPage.tsx`** — `<SimpleLayout title intro>` + `<ul className="grid grid-cols-1 gap-x-12 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">` of project cards (logo disc + title + description + link with LinkIcon).
4. **Rewrite `src/pages/UsesPage.tsx`** — `<SimpleLayout title intro>` + `<div className="space-y-20">` of `<Section title={category.category}>` blocks, each containing a `<ul>` of `<Tool>` items.

## Outputs
- Edited: `src/pages/ProjectsPage.tsx`, `src/pages/UsesPage.tsx`.
- New: `src/content/projects.ts`, `src/content/uses.ts`.

## Verification
- `bun run dev`:
  - `/projects`: at least one card; each external link opens in a new tab to the right URL.
  - `/uses`: at least one Section with at least one Tool.

## Open questions
- Initial projects + uses content (user provides).
