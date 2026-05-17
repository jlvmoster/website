# Build Pipeline — Implementation Spec

## Goal
Local dev server with HMR, production build that emits `dist/`, and the `public/` copy step that ships static assets not in the bundler import graph.

## Requirements covered
- §FR-1.5.1 — `bun run dev` via `Bun.serve` with HMR.
- §FR-1.5.2 — `bun run build` invokes `scripts/build.ts`, which runs `Bun.build()` on `src/index.html` and copies `public/` → `dist/`.
- §NFR-2.1.2 — Bun HTML bundler is the only build pipeline; no Vite/webpack/esbuild.
- §NFR-2.3.2 — Static assets that aren't part of the bundler import graph live under `public/`.
- §NFR-2.3.4 — `dist/` is gitignored.

## File layout
- `scripts/dev.ts` — `Bun.serve` with HMR. Run via `bun --hot ./scripts/dev.ts`.
- `scripts/build.ts` — programmatic `Bun.build()` + `cp public dist`. See [architecture §4.3](../architecture.md#43-scriptsbuildts-programmatic-build--public-copy) for the canonical code.
- `public/` — favicon, robots, OG image.

## Behavior & edge cases
- `scripts/dev.ts`:
  - `Bun.serve({ static: { ... }, fetch: req => ... })` configured to serve `src/index.html` as the root document with bundled JS/CSS resolved by Bun's HTML imports.
  - HMR is enabled by running with `bun --hot`.
- `scripts/build.ts`:
  - Deletes `dist/` first (idempotent rebuild).
  - Calls `Bun.build({ entrypoints: ["src/index.html"], outdir: "dist", minify: true, sourcemap: "linked" })`.
  - On build failure, prints every log and `process.exit(1)` — no partial dist left around.
  - Then `cp("public", "dist", { recursive: true })` — **mandatory**; the HTML bundler does not auto-copy `public/`.
- `public/` contents at v1:
  - `favicon.ico` — small favicon, referenced from `index.html` via `<link rel="icon" href="/favicon.ico">`.
  - `robots.txt` — `User-agent: *` + `Allow: /` (open by default; switch to `Disallow: /` only if you want to delay indexing).
  - `og-image.png` — 1200×630 OG card, referenced from `<meta property="og:image">`. Acceptable to omit in v1 and add post-scaffold.

## Test plan
- **Build smoke:** `bun run build` produces `dist/index.html` plus hashed `dist/*.js` and `dist/*.css`.
- **Public-copy assertion:** `dist/favicon.ico` and `dist/robots.txt` exist after a clean build (regression guard for the `cp` step).
- **Dev manual:** `bun run dev`, open the site, edit a component, confirm HMR updates without a full reload.

## Open questions
- Robots policy for v1 — open (`Allow: /`) or closed (`Disallow: /`) until launch?
- OG image — ship a placeholder in v1 or defer?
