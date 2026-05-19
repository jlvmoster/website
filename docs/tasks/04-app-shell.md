# Task 04 — App shell & Router

## Goal
Wire `react-router-dom` BrowserRouter, set up `src/App.tsx` with the Routes table, add the anti-flicker theme script to `src/index.html`, and create page-component stubs so the router compiles.

## Source spec
- [`features/app-shell.md`](../specs/features/app-shell.md)
- [`features/routing.md`](../specs/features/routing.md)
- [`features/theme-toggle.md`](../specs/features/theme-toggle.md)
- Requirements: §FR-1.1.1, §FR-1.1.4, §FR-1.1.5, §FR-1.1.6, §FR-1.3.1

## Prereqs
- Task 01 (`react-router-dom` installed).
- Task 03 (globals.css uses class-based dark).

## Steps

1. **Add the anti-flicker `<script>`** to `src/index.html` `<head>`, before the React script:
   ```html
   <script>
     (function () {
       try {
         var c = localStorage.getItem("theme") || "system";
         var d = c === "dark" || (c === "system" &&
           window.matchMedia("(prefers-color-scheme: dark)").matches);
         document.documentElement.classList.toggle("dark", d);
       } catch (e) {}
     })();
   </script>
   ```

2. **Edit `src/main.tsx`** to wrap with `<BrowserRouter>`:
   ```tsx
   import { StrictMode } from "react";
   import { createRoot } from "react-dom/client";
   import { BrowserRouter } from "react-router-dom";
   import { App } from "./App";

   createRoot(document.getElementById("root")!).render(
     <StrictMode>
       <BrowserRouter>
         <App />
       </BrowserRouter>
     </StrictMode>,
   );
   ```

3. **Rewrite `src/App.tsx`** with the Routes table (canonical shape in `architecture.md` §4.4). Use a stub `LayoutShell` that returns `{children}` for now — the real shell lands in Task 05.

4. **Create page stubs under `src/pages/`** so the router compiles. Each stub returns `<h1>{name}</h1>`. Files: `HomePage.tsx`, `AboutPage.tsx`, `ArticlesPage.tsx`, `ArticlePage.tsx`, `ProjectsPage.tsx`, `UsesPage.tsx`, `NotFoundPage.tsx`.

5. **Temporary: render the v1 Hero inside `HomePage.tsx`** so the verbatim-hero E2E assertion continues to pass through Tasks 05–07. Delete the v1 components and inline the Hero block in Task 07.

## Outputs
- Edited: `src/index.html`, `src/main.tsx`.
- New: `src/App.tsx`, `src/pages/*.tsx` (7 stubs).

## Verification
- `bun run check` passes.
- `bun run dev` serves all six routes; clicking around shows the stub bodies; URL updates without a full page load.
- `/` still renders the verbatim hero substring.

## Open questions
- See `routing.md` (wildcard 404 strategy).
