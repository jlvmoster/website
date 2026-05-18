# App Shell — Implementation Spec

## Goal
Mount the React root with `BrowserRouter`, wire the Routes through `<LayoutShell>`, set up the anti-flicker theme script.

## Requirements covered
- §FR-1.1.1 — Multi-page client SPA.
- §FR-1.1.4 — `react-router-dom` is the routing library.
- §FR-1.1.5 — Six declared routes.
- §FR-1.1.6 — Workers SPA fallback feeds the router for deep links.
- §FR-1.3.1 — Anti-flicker script in `<head>` applies `html.dark` before React mounts.

## File layout
- `src/index.html` — entry HTML; anti-flicker script in `<head>`; existing favicon and meta tags.
- `src/main.tsx` — `createRoot` + `StrictMode` + `BrowserRouter` wrap.
- `src/App.tsx` — `LayoutShell` + `Routes` (Home / About / Articles / Articles/:slug / Projects / Uses / wildcard NotFound).
- `src/pages/*.tsx` — one file per route; bodies live in their own feature specs.

## Behavior & edge cases
- `src/index.html` carries:
  - existing `<link rel="stylesheet" href="./styles/globals.css">`
  - existing `<script type="module" src="./main.tsx">`
  - new: `<script>` block (see `theme-toggle.md`) before the React script
  - existing `<div id="root">`
  - `<meta name="theme-color" content="#fafafa" media="(prefers-color-scheme: light)">` and `<meta name="theme-color" content="#09090b" media="(prefers-color-scheme: dark)">` matching the new zinc/teal palette
- `main.tsx` keeps `StrictMode`. The only change is wrapping `<App />` in `<BrowserRouter>`.
- `App.tsx` is new — it exports `App`, composes `<LayoutShell>` with `<Routes>`, and is the single place new routes get added.
- `NotFoundPage` is a minimal page (h1 "Page not found." + link to `/`).

## Test plan
- **Smoke:** `renderToStaticMarkup(<App />)` works inside a `<MemoryRouter initialEntries={["/"]}>`.
- **E2E:** see `routing.md`.

## Open questions
- Wildcard 404: minimal NotFoundPage (default) vs. redirect to `/`.
- Whether to consolidate `main.tsx` + `App.tsx` into a single file. Default: keep separated — `main.tsx` is the boot file, `App.tsx` is the route table.
