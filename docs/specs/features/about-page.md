# About Page — Implementation Spec

## Goal
`/about` two-column layout: portrait + prose biography + social column with mailto.

## Requirements covered
- §FR-1.2.3 — About page exists.
- §FR-1.2.4 — Mailto link to `jalo@moster.dev` lives in the social column.
- §FR-1.3.4 — Prose paragraphs respect 65ch.

## File layout
- `src/pages/AboutPage.tsx` — the page.
- (Optional) `src/components/about/PortraitImage.tsx` — extracted if the JSX grows beyond one block.
- `public/images/portrait.jpg` — user-provided.

## Behavior & edge cases
- Grid: `grid-cols-1 lg:grid-cols-2 lg:grid-rows-[auto_1fr] lg:gap-y-12`.
- Portrait (left on desktop, top on mobile): `<img src="/images/portrait.jpg" class="aspect-square rotate-3 rounded-2xl bg-zinc-100 object-cover dark:bg-zinc-800 max-w-xs px-2.5 lg:max-w-none">`.
- Right column (top): headline `text-4xl font-bold tracking-tight sm:text-5xl` + four short prose paragraphs (each ~65ch, `mt-6 text-base text-zinc-600 dark:text-zinc-400`).
- Social column (right column, bottom on desktop; below prose on mobile): a `<ul>` of four list items — GitHub, Instagram, LinkedIn, `mailto:jalo@moster.dev`. Each item has icon (left) + text label (right). Hover tints to `teal-500 dark:teal-400`.
- A border-top `border-zinc-100 dark:border-zinc-700/40` separates the mailto from the other three.

## Test plan
- **E2E**:
  - `<img src="/images/portrait.jpg">` is visible on `/about`.
  - `<a href="mailto:jalo@moster.dev">` is in the DOM.
  - Three social anchors (GitHub, Instagram, LinkedIn) are present with the canonical URLs.

## Open questions
- Bio copy (four short paragraphs). User to provide.
- Headline string. User to provide.
- Location to mention (city). User has not confirmed; default: omit unless provided.
