# Document Metadata — Implementation Spec

## Goal
Per-route `<title>` and `<meta name="description">` for every route on moster.dev, rendered via React 19's native document-metadata support — no third-party library.

## Requirements covered
- §FR-1.2.9 — Each routed page renders its own `<title>` and `<meta name="description">` via React 19 native support; no `react-helmet` / `react-helmet-async`.
- §FR-1.2.9.a — Title pattern `"<Page> — Jalo Moster"`; Home may use a longer one-line title.
- §FR-1.2.9.b — Article detail derives title and description from `article.title` / `article.description` (§FR-1.2.8). The article-not-found fallback sets its own title.
- §FR-1.2.9.c — The 404 route sets its own title and description.

## File layout
- `src/pages/HomePage.tsx`, `src/pages/AboutPage.tsx`, `src/pages/ArticlesPage.tsx`, `src/pages/ArticlePage.tsx`, `src/pages/ProjectsPage.tsx`, `src/pages/UsesPage.tsx`, `src/pages/NotFoundPage.tsx` — each renders its own `<title>` + `<meta>` near the top of its returned tree.
- `src/index.html` — keeps a static `<title>Jalo Moster</title>` as a pre-hydration fallback; React 19 deduplicates `<title>` and replaces it on mount. **No** static `<meta name="description">` ships in `index.html` — React 19 does not deduplicate `<meta>` against pre-existing HTML, so shipping one would yield two description tags per page.

## Behavior & edge cases
- React 19 hoists `<title>`, `<meta>`, and `<link>` rendered in the component tree into `<head>`. `<title>` is deduplicated (React keeps only one in the DOM, including replacing any static `<title>` shipped in `src/index.html`). `<meta>` is appended and not deduplicated against pre-existing HTML — which is why `src/index.html` ships no static `<meta name="description">`.
- Title/description are set per route. Switching routes via `<Link>` causes React to unmount the previous page, remove its hoisted tags, and mount the new page's tags — `document.title` updates with no extra wiring.
- Article detail: `<title>{article.title} — Jalo Moster</title>` and `<meta name="description" content={article.description} />` come from the typed `ArticleMeta` (§FR-1.2.8). The article-not-found branch sets its own static title.
- 404 (`<NotFoundPage>`): static "Not found — Jalo Moster" title and a short description.
- Pre-hydration: the static title in `src/index.html` is what a non-JS crawler or the loading flash sees. React 19 overwrites it on mount.
- Open Graph (`og:title`, `og:description`) tags currently live only in `src/index.html` as site-wide values. Per-route OG can be added later by rendering `<meta property="og:title" content={…} />` inside the page; no library needed.

## Why no `react-helmet` / `react-helmet-async`
- React 19 already does what Helmet does for `<title>` / `<meta>` / `<link>`. Adding Helmet would be a dependency for behavior the framework now provides.
- The HTTP security headers in `src/worker.ts` (HSTS, X-Frame-Options, Permissions-Policy, COOP, Referrer-Policy, X-Content-Type-Options, CSP) cannot be set via `<meta>` at all (most) or would not cover pre-`<meta>` script execution (CSP). Helmet does not help with these.
- Per CLAUDE.md "Hard rules": no third-party UI/component libraries beyond `react-router-dom`, `clsx`, and `@tailwindcss/typography`.

## Test plan
- **Unit**: smoke test renders `<App />` with `MemoryRouter` and asserts the rendered HTML includes `"<title>Jalo Moster — Software Engineer at Chick-fil-A</title>"` for the home route.
- **E2E (dev + built)**: visit each of `/`, `/about`, `/articles`, `/articles/:slug`, `/projects`, `/uses`, plus an unknown path, and assert `document.title` matches the expected per-route value. Navigation between routes via `<Link>` updates `document.title` without a full page reload.

## Open questions
- Per-route Open Graph and Twitter card tags: deferred until the site has dedicated share imagery (see §GP-3.3 OG image generation). Implementation path will be the same React 19 native pattern (`<meta property="og:title" …/>` inside each page) — no library needed.
- Canonical `<link rel="canonical">` per route: deferred; not required for v2.
