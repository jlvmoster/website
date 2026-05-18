# Task 10 — Build pipeline & `public/`

## Goal
Wire up `scripts/dev.ts` (Bun.serve + HMR) and `scripts/build.ts` (Bun.build + `public/` copy), and ship the static files that aren't in the import graph.

## Source spec
- [`features/build-pipeline.md`](../specs/features/build-pipeline.md)
- Architecture: [§4.3 scripts/build.ts](../specs/architecture.md#43-scriptsbuildts-programmatic-build--public-copy)
- Requirements: §FR-1.5.1, §FR-1.5.2, §NFR-2.1.2, §NFR-2.3.2, §NFR-2.3.4

## Prereqs
- Task 02 (`wrangler.toml` and `src/worker.ts` exist for `bun run preview`).
- Task 04 (`src/index.html`, `src/main.tsx` exist as the bundler entrypoint chain).
- Task 05 (real components exist for the dev-server render/HMR checks).

## Steps

1. **Create `scripts/dev.ts`** using `Bun.serve` with HMR enabled (run via `bun --hot ./scripts/dev.ts` — the script in `package.json` already does this from Task 01).
   - Register `src/index.html` as the root route so Bun's HTML imports resolve bundled JS/CSS automatically.
   - **Add a catch-all `fetch` handler that returns the bundled `src/index.html` for any unknown path** (any request that didn't match an asset emitted by the bundler). This mirrors the Workers Static Assets `not_found_handling = "single-page-application"` fallback in `wrangler.toml`, so local dev behaves the same as production for unknown routes. Task 11's E2E asserts this against `bun run dev`.
   - Pin port `3000` and log it on startup. Task 11's `playwright.config.ts` hardcodes the same value.
2. **Create `scripts/build.ts`** verbatim from architecture §4.3. The key invariants:
   - Delete `dist/` first (idempotent rebuild).
   - `Bun.build({ entrypoints: ["src/index.html"], outdir: "dist", minify: true, sourcemap: "linked" })`.
   - On build failure, print every log and `process.exit(1)`. Do not leave a partial `dist/`.
   - `await cp("public", "dist", { recursive: true })` — **mandatory**, the HTML bundler does not auto-copy `public/`.
3. **Create `public/`** at repo root and seed it with:
   - `favicon.ico` — small favicon, referenced from `index.html`. Use any reasonable 32x32 placeholder if Jalo hasn't supplied one.
   - `robots.txt` — resolve open question first: open (`User-agent: *` + `Allow: /`) for launch, or closed (`Disallow: /`) until launch. Default to **open** unless Jalo says otherwise.
   - `og-image.png` — 1200x630 OG card. Acceptable to defer; if deferred, omit the `<meta property="og:image">` tag in `index.html` until the asset exists.
   - For v2, also ensure `public/images/avatar.jpg`, `public/images/portrait.jpg`, `public/images/photos/image-{1..5}.jpg`, `public/images/logos/<n>.svg`, and `public/cv.pdf` exist. `cp("public", "dist", { recursive: true })` ships them all unchanged.
4. **Confirm `.gitignore`** excludes `dist/` (it does as of Task 01).

## Outputs
- New: `scripts/dev.ts`, `scripts/build.ts`, `public/favicon.ico`, `public/robots.txt`, optionally `public/og-image.png`.

## Verification
- `bun run dev` serves the site at the chosen port; opening it renders Task 05's components.
- `bun run dev` HMR works: edit a component, browser updates without a full reload.
- `bun run build` produces:
  - `dist/index.html`
  - hashed `dist/*.js` and `dist/*.css`
  - `dist/favicon.ico` and `dist/robots.txt` (regression guard for the `cp` step)
- After `bun run build`, `bun run preview` (`wrangler dev`, defined Task 01) serves the built `dist/` through the Workers runtime.

## Open questions to surface
- Robots policy at launch — open or closed?
- OG image — ship a placeholder now or defer to the post-scaffold operational steps in architecture §7?
