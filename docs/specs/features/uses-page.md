# Uses Page — Implementation Spec

## Goal
`/uses` left-bordered `Section` layout listing tools per category.

## Requirements covered
- §FR-1.2.7 — Uses page.
- §FR-1.1.5 — Route registered.

## File layout
- `src/pages/UsesPage.tsx`.
- `src/content/uses.ts` — typed `Array<{ category: string; tools: Array<{ title: string; href?: string; description: string }> }>`.
- `src/components/Section.tsx` — used here.

## Behavior & edge cases
- Page layout: `<SimpleLayout title="…" intro="…">` then a `<div className="space-y-20">` containing one `<Section>` per category.
- `Section`: left-bordered (`md:border-l md:border-zinc-100 md:pl-6 md:dark:border-zinc-700/40`) two-column grid (`grid max-w-3xl grid-cols-1 items-baseline gap-y-8 md:grid-cols-4`) with the category title on the left (`md:col-span-1`) and a `<ul>` of `<Tool>` items on the right (`md:col-span-3`).
- `Tool` item: `<li><Card as="div">` with `<Card.Title as="h3" href={href}>{title}</Card.Title>` (if href, renders as external link) and `<Card.Description>{description}</Card.Description>`.

## Test plan
- **E2E**: at least one Section renders; at least one Tool has a visible title and description.

## Open questions
- Initial categories + tools. User to provide.
- Whether external tool links open in a new tab. Default: yes (`target="_blank"`).
