# Routing — Implementation Spec

## Goal

Single source of truth for the router config and the SPA-fallback handshake with Vercel.

## Requirements covered

- §FR-1.1.4 — `react-router-dom` is the routing library.
- §FR-1.1.5 — Six declared routes + wildcard NotFound.
- §FR-1.1.6 — Vercel rewrites the registered routes to `index.html` (HTTP 200). Unknown paths are HTTP 404 and the client wildcard still renders NotFoundPage.
- §FR-1.1.7 — In-app navigation uses `<Link>`; external uses plain `<a>`.

## File layout

- `src/main.tsx` — `BrowserRouter` wrap.
- `src/App.tsx` — `<Routes>` + LayoutShell.
- `src/pages/*.tsx` — one file per route.
- `vercel.json` — rewrites for `/about`, `/articles`, `/projects`, `/uses`. No `/articles/:slug` rewrite.
- `scripts/build.ts` — copies the shell to `dist/articles/<slug>/index.html` for each article slug.
- `scripts/dev.ts` — serves `index.html` for unknown paths during HMR (HTTP 200; not the Vercel status contract).
- `scripts/preview.ts` — directory index or file, then rewrite, then `404.html` at HTTP 404.

## Behavior & edge cases

- Use `BrowserRouter` from `react-router-dom@^7`.
- Routes:
  - `/` → `<HomePage />`
  - `/about` → `<AboutPage />`
  - `/articles` → `<ArticlesPage />`
  - `/articles/:slug` → `<ArticlePage />`
  - `/projects` → `<ProjectsPage />`
  - `/uses` → `<UsesPage />`
  - `*` → `<NotFoundPage />`
- Hard refresh on `/`, `/about`, `/articles`, a known `/articles/<slug>`, `/projects`, or `/uses` returns 200; the client router then renders the right page. `/` is the `index.html` file. A known article slug is `articles/<slug>/index.html`. `/about`, `/articles`, `/projects`, and `/uses` are rewrites.
- Hard refresh on any other path returns 404. The response body is `404.html` (a copy of the shell). An unknown `/articles/<slug>` is that 404, and ArticlePage renders its own not-found state. Any other miss renders NotFoundPage.
- `<NotFoundPage>` is a minimal component (heading + link back to `/`).
- `<Link>` for in-app navigation. External links (`href` starts with `http`) use plain `<a target="_blank" rel="noopener noreferrer">`.

## Test plan

- **E2E**:
  - Hard-refresh on `/about`, `/articles`, `/projects`, `/uses` returns 200 and the right page renders.
  - Hard-refresh on `/articles/hello-world` renders the article detail.
  - `/articles/this-slug-does-not-exist` returns 404 and ArticlePage renders its not-found state.
  - Client-side `<Link>` navigation doesn't trigger a full page load — verify by setting `window.__navMarker = "kept"` in the page, clicking a Link, and asserting the marker survives.
  - `/some-unknown-path` returns 404 and renders NotFoundPage.

## Related

- Per-route document metadata (titles + descriptions): `docs/specs/features/document-metadata.md` (covers §FR-1.2.9).

## Open questions

- Wildcard 404: minimal NotFoundPage (default) vs. redirect to `/`.
- Use BrowserRouter (default, History API) vs. HashRouter (no SPA rewrite needed). Default: BrowserRouter — Vercel already handles SPA rewrite.
