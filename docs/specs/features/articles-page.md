# Articles Pages — Implementation Spec

## Goal
`/articles` lists articles using the Card compound. `/articles/:slug` renders an individual article using `Container` + `<Prose>`.

## Requirements covered
- §FR-1.2.2 — Articles surface.
- §FR-1.2.8 — Articles content model (typed TSX modules).
- §FR-1.1.5, §FR-1.1.7 — Both routes are part of the router config.

## File layout
- `src/pages/ArticlesPage.tsx` — list using `SimpleLayout`.
- `src/pages/ArticlePage.tsx` — detail using `ArticleLayout`.
- `src/components/ArticleLayout.tsx` — `Container` + back-arrow button + `<Prose>` body.
- `src/content/articles/index.ts` — loader + types.
- `src/content/articles/hello-world.tsx` — placeholder first article.
- `src/lib/formatDate.ts` — date formatter.

## Behavior & edge cases
- List page (`/articles`):
  - `<SimpleLayout title="…" intro="…">` (final wording is an open question).
  - Body: left-bordered (`md:border-l md:border-zinc-100 md:pl-6 md:dark:border-zinc-700/40`) flex column of article cards.
  - Each card: `Card.Eyebrow` shows date (`formatDate(article.date)`); `Card.Title as="h2" href={`/articles/${article.slug}`}`; `Card.Description` shows `article.description`; `Card.Cta` shows "Read article" with `<ChevronRightIcon>`.
  - On `md+`, the date sits in a separate left column (`md:grid md:grid-cols-4 md:items-baseline`).
  - Empty state: if `getAllArticles().length === 0`, render `<p>First post coming soon.</p>`.
- Detail page (`/articles/:slug`):
  - Reads `:slug` via `useParams()`; resolves with `getArticleBySlug(slug)`.
  - If no match: render `<NotFoundPage>` (or inline equivalent: h1 "Article not found." + link back to `/articles`).
  - If match: `<ArticleLayout article={article}><article.Component /></ArticleLayout>`.
- `ArticleLayout`: a back-arrow button at the top calls `navigate(-1)` with a fallback to `/articles` (handles cold deep-load). Below: `<header>` with `<time>` (formatted date) + `<h1>` (article.title) + `<Prose>` wrapping `{children}` (the article body).
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
- **Smoke**: `getAllArticles()` returns ≥ 1 entry (the placeholder) and sorts by date descending.
- **E2E**:
  - `/articles` renders ≥ 1 article card.
  - Clicking the first card navigates to `/articles/hello-world` and the URL updates.
  - `/articles/hello-world` renders the title and the placeholder paragraph.
  - `/articles/does-not-exist` renders the "Article not found." state.

## Open questions
- List page title + intro copy. User to provide.
- First article content. Placeholder for v2; user replaces later.
- Date format. Default: Spotlight's `en-US`, day/long-month/year, UTC — produces "May 18, 2026".
