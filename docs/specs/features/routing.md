# Routing — Implementation Spec

## Goal
Single source of truth for the router config and the SPA-fallback handshake with Workers.

## Requirements covered
- §FR-1.1.4 — `react-router-dom` is the routing library.
- §FR-1.1.5 — Six declared routes + wildcard NotFound.
- §FR-1.1.6 — Workers `not_found_handling = "single-page-application"` returns `index.html` for any non-asset deep link; the client router resolves the URL after mount.
- §FR-1.1.7 — In-app navigation uses `<Link>`; external uses plain `<a>`.

## File layout
- `src/main.tsx` — `BrowserRouter` wrap.
- `src/App.tsx` — `<Routes>` + LayoutShell.
- `src/pages/*.tsx` — one file per route.
- `wrangler.toml` — `not_found_handling = "single-page-application"` (existing).
- `scripts/dev.ts` — already serves `index.html` for unknown paths (existing).

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
- Hard refresh on any of the six static routes returns 200 from Workers via SPA fallback; the client router then renders the right page.
- `<NotFoundPage>` is a minimal component (heading + link back to `/`).
- `<Link>` for in-app navigation. External links (`href` starts with `http`) use plain `<a target="_blank" rel="noopener noreferrer">`.

## Test plan
- **E2E**:
  - Hard-refresh on `/about`, `/articles`, `/projects`, `/uses` returns 200 and the right page renders.
  - Hard-refresh on `/articles/hello-world` renders the article detail.
  - Client-side `<Link>` navigation doesn't trigger a full page load — verify by setting `window.__navMarker = "kept"` in the page, clicking a Link, and asserting the marker survives.
  - `/some-unknown-path` returns 200 and renders NotFoundPage.

## Open questions
- Wildcard 404: minimal NotFoundPage (default) vs. redirect to `/`.
- Use BrowserRouter (default, History API) vs. HashRouter (no Workers SPA fallback needed). Default: BrowserRouter — Workers already handles SPA fallback.
