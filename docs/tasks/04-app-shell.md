# Task 04 — App shell

## Goal
Create the HTML entry, React 19 root mount, and the top-level `App` that composes nav + four sections (the section components are stubs until Task 05).

## Source spec
- [`features/app-shell.md`](../specs/features/app-shell.md)
- Requirements: §FR-1.1.1, §FR-1.5.2, §NFR-2.1.4, §NFR-2.3.1

## Prereqs
- Task 01 (React installed, tsconfig has `jsx: "react-jsx"`).
- Task 03 (`src/styles/globals.css` exists — `index.html` links to it).

## Steps

1. **Create `src/index.html`** per the feature spec §Behavior. Required elements:
   - `<html lang="en">`, charset, viewport.
   - `<title>` — default "Jalo Moster" unless the user provides a custom one.
   - `<meta name="description">` — one-line bio, doubles as OG description.
   - `<meta property="og:title">` and `<meta property="og:description">`. Add `<meta property="og:image" content="/og-image.png">` only if Task 06 will ship `public/og-image.png`; don't point crawlers at a missing image.
   - `<meta name="theme-color" media="(prefers-color-scheme: light)" content="…">` and dark counterpart, matching the `--bg` token values resolved in Task 03.
   - `<link rel="icon" href="/favicon.ico">` (file shipped in Task 06).
   - `<link rel="stylesheet" href="./styles/globals.css">` and `<script type="module" src="./main.tsx"></script>`.
   - Body contains only `<div id="root"></div>`.
2. **Create `src/main.tsx`**:
   ```tsx
   import { StrictMode } from "react";
   import { createRoot } from "react-dom/client";
   import { App } from "./App";

   createRoot(document.getElementById("root")!).render(
     <StrictMode>
       <App />
     </StrictMode>,
   );
   ```
   Do **not** `import "./styles/globals.css"` here — `index.html`'s `<link rel="stylesheet">` is the canonical loading path, and adding the JS import would make Bun's HTML bundler register the CSS twice.
3. **Create `src/App.tsx`** as a function component that returns `<Nav />` followed by `<Hero />`, `<Writing />`, `<About />`, `<Contact />` in order.
   - Import those five components from `src/components/`. Until Task 05 creates the real components, create one-line stub files there so the shell type-checks. The section stubs must use the correct IDs (`hero`, `writing`, `about`, `contact`) from day 1; `Nav` can return `null` until Task 05 fills in the anchor links.
4. **No providers** in v1: no router, no theme context, no query client.

## Outputs
- New: `src/index.html`, `src/main.tsx`, `src/App.tsx`, plus stub `src/components/{Nav,Hero,Writing,About,Contact}.tsx` (one-line returns) so `App.tsx` resolves.

## Verification
- `bunx tsc --noEmit` passes.
- Once Task 06 lands, `bun run dev` serves a blank page with the four section IDs in the DOM.

## Open questions to surface
- Final `<title>` and `<meta description>` strings.
- OG image — ship a placeholder in v1 and include the `og:image` meta tag, or defer both to a follow-up (per architecture §7)?
- `theme-color` values must match Task 03's resolved palette — confirm before writing the `<meta>` tags.
