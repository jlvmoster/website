# Task 08 — About & Articles

## Goal
Build the About page (portrait + prose + social column) and the Articles surface (list + detail) including the article content loader and a placeholder first article.

## Source spec
- [`features/articles-page.md`](../specs/features/articles-page.md)
- [`features/content-model.md`](../specs/features/content-model.md)

## Prereqs
- Task 07 (Home renders).
- User-provided: `public/images/portrait.jpg`, About-page bio copy, articles list-page title + intro.

## Steps

1. **Drop `public/images/portrait.jpg`** (user provides).
2. **Create `src/content/articles/index.ts`** — types + `getAllArticles()` + `getArticleBySlug()` (canonical shape in `architecture.md` §4.9).
3. **Create `src/content/articles/hello-world.tsx`** — placeholder first article:
   ```tsx
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
4. **Register the placeholder** in `src/content/articles/index.ts`'s `modules` record.
5. **Rewrite `src/pages/AboutPage.tsx`**: two-column grid with portrait, headline, four prose paragraphs, social column (GitHub, Instagram, LinkedIn, `mailto:jalo@moster.dev`).
6. **Rewrite `src/pages/ArticlesPage.tsx`**: `SimpleLayout` + left-bordered list of article cards. Empty state if `getAllArticles().length === 0`.
7. **Create `src/components/ArticleLayout.tsx`** — Container + back-arrow button + header (time + title) + Prose body.
8. **Rewrite `src/pages/ArticlePage.tsx`**:
   - `useParams<{ slug: string }>()` + `getArticleBySlug(slug)`.
   - If no match: render NotFound-equivalent inline ("Article not found." + link to `/articles`).
   - If match: `<ArticleLayout article={article}><article.Component /></ArticleLayout>`.

## Outputs
- Edited: `src/pages/AboutPage.tsx`, `src/pages/ArticlesPage.tsx`, `src/pages/ArticlePage.tsx`.
- New: `src/components/ArticleLayout.tsx`, `src/content/articles/index.ts`, `src/content/articles/hello-world.tsx`.

## Verification
- `bun test`: `getAllArticles()` returns `[helloWorld]`.
- `bun run dev`:
  - `/about`: portrait visible; mailto link works; three socials.
  - `/articles`: one card; click → `/articles/hello-world`.
  - `/articles/hello-world`: title + body render; back-arrow returns to `/articles`.
  - `/articles/does-not-exist`: "Article not found." state.

## Open questions
- See `features/articles-page.md` (list-page title + intro).
