# Articles Pages — Implementation Spec

## Goal
`/articles` lists articles using the Card compound. `/articles/:slug` renders an individual article using `ArticleLayout` (dek + date + derived reading time + `<Prose>` + optional “More writing”).

## Requirements covered
- §FR-1.2.2 — Articles surface.
- §FR-1.2.8 — Articles content model (typed TSX modules).
- §FR-1.1.5, §FR-1.1.7 — Both routes are part of the router config.

## File layout
- `src/pages/ArticlesPage.tsx` — list using `SimpleLayout`.
- `src/pages/ArticlePage.tsx` — detail using `ArticleLayout`.
- `src/components/ArticleLayout.tsx` — `Container` + back-arrow button + header (title, dek, date, reading time) + `<Prose>` body + optional “More writing” nav.
- `src/components/EmptyState.tsx` — dashed empty-state panel used when the list is empty.
- `src/content/articles/index.ts` — loader + types + `getAdjacentArticles()`.
- `src/content/articles/hello-world.tsx` — placeholder first article.
- `src/lib/formatDate.ts` — date formatter.
- `src/lib/readingTime.ts` — `readingTimeMinutes(markup)` strips tags and `Math.max(1, ceil(words / 200))`. Does not render the article component.

## Behavior & edge cases
- List page (`/articles`):
  - `<SimpleLayout title="…" intro="…">` (final wording is an open question).
  - Body: left-bordered (`md:border-l md:border-zinc-100 md:pl-6 md:dark:border-zinc-700/40`) flex column of article cards.
  - Each card: `Card.Eyebrow` shows date (`formatDate(article.date)`) with `tone="accent"` (`text-accent`, decorated bar `bg-accent/50`); `Card.Title as="h2" href={`/articles/${article.slug}`}`; `Card.Description` shows `article.description`; `Card.Cta` shows "Read article" with `<ChevronRightIcon>`.
  - On `md+`, the date sits in a separate left column (`md:grid md:grid-cols-4 md:items-baseline`).
  - Empty state: if `getAllArticles().length === 0`, render `<EmptyState title="First post coming soon" description="…">` (dashed panel; still satisfies §FR-1.2.2's empty-state line).
- Detail page (`/articles/:slug`):
  - Reads `:slug` via `useParams()`; resolves with `getArticleBySlug(slug)`.
  - If no match: render `<NotFoundPage>` (or inline equivalent: h1 "Article not found." + link back to `/articles`).
  - If match: `<ArticleLayout article={article} readingMinutes={…} previous={…} next={…}><article.Component /></ArticleLayout>`.
- `ArticleLayout`: a back-arrow button at the top navigates to `/articles` (handles cold deep-load). Header: `<h1>` (article.title), a one-line dek from `article.description` under the title, and a metadata row with `<time dateTime={article.date}>` (formatted date; keep `datetime`) beside a derived “N min read” (`readingTimeMinutes` on `article.description` so a body that uses `Link` / `useParams` cannot throw during counting). Date stays zinc (list dates remain `tone="accent"`). `<Prose>` wraps `{children}` (the article body). No table of contents, comments, likes, or audio.
- “More writing”: below `Prose`, when `getAllArticles().length >= 2`, render a `<nav aria-labelledby="more-writing-heading">` with previous (older) and/or next (newer) `Card`s (up to two). Hide the whole block when the only article is `hello-world` (or any single-article catalog). No newsletter signup.
- Article TSX module shape (no MDX):

  ```tsx
  // src/content/articles/hello-world.tsx
  export const meta = {
    title: "Hello, world",
    description: "Why this site exists and what's coming.",
    date: "2026-05-18",
  };
  export default function HelloWorld() {
    return (
      <>
        <p>The first post — placeholder.</p>
      </>
    );
  }
  ```

## Test plan
- **Smoke**: `getAllArticles()` returns ≥ 1 entry (the placeholder) and sorts by date descending. `getAdjacentArticles` returns `{}` for a one-item list and previous/next for a multi-item list. `readingTimeMinutes` is at least 1.
- **E2E**:
  - `/articles` renders ≥ 1 article card.
  - Clicking the first card navigates to `/articles/hello-world` and the URL updates.
  - `/articles/hello-world` renders the title, the meta description as a dek, a `datetime` on `<time>`, “N min read”, and the placeholder paragraph. “More writing” is not shown while only `hello-world` exists.
  - `/articles/does-not-exist` renders the "Article not found." state.

## Open questions
- List page title + intro copy. User to provide.
- First article content. Placeholder for v2; user replaces later.
- Date format. Default: Spotlight's `en-US`, day/long-month/year, UTC — produces "May 18, 2026".
