# App Shell — Implementation Spec

## Goal
The HTML entry point, the React root mount, and the top-level component that composes the nav and four sections.

## Requirements covered
- §FR-1.1.1 — Single-page React SPA.
- §FR-1.5.2 — `src/index.html` is the Bun build entrypoint.
- §NFR-2.1.4 — TypeScript strict, `react-jsx`.

## File layout
- `src/index.html` — minimal HTML shell.
- `src/main.tsx` — React 19 `createRoot` mount.
- `src/App.tsx` — composes `<Nav />` + the four section components.

## Behavior & edge cases
- `index.html`:
  - `<html lang="en">`, `<meta charset="utf-8">`, `<meta name="viewport" content="width=device-width, initial-scale=1">`.
  - `<title>` — defaults to "Jalo Moster" unless overridden.
  - `<meta name="description">` — one-line bio, doubles as the OG description.
  - `<meta property="og:title">`, `<meta property="og:description">`, `<meta property="og:image">` (image lives in `public/og-image.png` if present).
  - `<meta name="theme-color" media="(prefers-color-scheme: light)" content="…">` and a dark counterpart, matching the `--bg` tokens from [theming.md](./theming.md).
  - `<link rel="icon" href="/favicon.ico">`.
  - `<link rel="stylesheet" href="./styles/globals.css">` and `<script type="module" src="./main.tsx"></script>`.
  - A single `<div id="root"></div>` and nothing else in `<body>`.
- `main.tsx`:
  - `createRoot(document.getElementById("root")!).render(<StrictMode><App /></StrictMode>)`.
- `App.tsx`:
  - Renders `<Nav />` followed by `<Hero />`, `<Writing />`, `<About />`, `<Contact />` in order.
  - No top-level providers in v1 (no router, no theme context, no query client).

## Test plan
- **Unit:** `App.test.tsx` renders `<App />` and asserts the four section IDs (`hero`, `writing`, `about`, `contact`) are present in document order.
- **E2E:** page loads with HTTP 200; `<title>` matches the expected value.

## Open questions
- Final `<title>` and `<meta description>` copy.
- OG image source — generate now or defer to post-scaffold (per [architecture §7](../architecture.md#7-post-scaffold-operational-steps))?
