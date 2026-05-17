# Testing — Implementation Spec

## Goal
Wire up a unit-test smoke check and the minimum Playwright E2E coverage required by the acceptance criteria.

## Requirements covered
- §NFR-2.4.1 — At least one smoke test exists under `tests/`.
- §NFR-2.4.2 — Browser smoke E2E specs live under `tests/e2e/` and run with `bunx playwright test` against `bun run dev`.
- §NFR-2.4.3 — E2E minimum coverage: page loads, hero copy renders verbatim, three social links resolve, dark mode applies via `prefers-color-scheme`.
- §NFR-2.4.4 — Fresh machines and CI workers install Playwright's Chromium before E2E.

## File layout
- `tests/smoke.test.ts` — unit-level smoke test for the App shell.
- `tests/e2e/site.spec.ts` — Playwright spec covering the required minimum.
- `playwright.config.ts` — Playwright config at repo root.

## Behavior & edge cases
- **`bun test`:**
  - Finds `tests/**/*.test.ts` plus any colocated `src/**/*.test.ts`.
  - `smoke.test.ts` asserts `<App />` renders without throwing and contains the four section IDs.
- **`bunx playwright test`:**
  - Config:
    - `testDir: "tests/e2e"`.
    - `webServer: { command: "bun run dev", url: "http://localhost:<port>", reuseExistingServer: !process.env.CI }`.
    - Chromium project only — no Firefox / WebKit in v1.
    - No trace / video by default; opt in via CLI when debugging.
  - Fresh-machine setup requires `bun install` followed by `bun run setup:browsers` before the first E2E run.
  - CI must run the same browser install step before `bunx playwright test`; do not rely on a pre-existing Playwright cache.
  - `site.spec.ts` covers, per §NFR-2.4.3:
    - **Page loads** — `await page.goto("/")` returns 200 and the document has `<div id="root">`.
    - **Hero copy** — the hero substring `"It's my pleasure to invite you into my portfolio."` is visible.
    - **Social links** — three anchors with `href` matching `github.com/jlvmoster`, `instagram.com/jlvmoster`, `linkedin.com/in/jlvmoster`.
    - **Dark mode** — second context launched with `colorScheme: "dark"`; computed `background-color` of `<body>` differs from the light baseline.
  - Out of scope per the requirements: full-DOM snapshots, visual regression, multi-browser matrix.

## Test plan
- `bun test` passes (the smoke file is the test).
- `bunx playwright test` passes against `bun run dev`.
- Both run cleanly from a fresh clone after `bun install && bun run setup:browsers`.

## Open questions
- CI integration — wire E2E into GitHub Actions on day 1, or defer until after first deploy?
- Visual regression tooling (e.g., Playwright screenshot diffs) — explicitly out of scope per §NFR-2.4.3, but worth confirming we won't add it casually later.
