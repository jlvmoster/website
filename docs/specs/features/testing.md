# Testing — Implementation Spec

## Goal
Wire up a unit-test smoke check and the minimum Playwright E2E coverage required by the acceptance criteria.

## Requirements covered
- §NFR-2.4.1 — At least one smoke test exists under `tests/`.
- §NFR-2.4.2 — Browser smoke E2E specs live under `tests/e2e/` and run with `bunx playwright test` against `bun run dev`.
- §NFR-2.4.3 — E2E minimum coverage: every route loads, hard-refresh deep links work, hero copy renders verbatim on `/`, social links resolve on `/` and `/about`, theme toggle cycles and persists, portrait image renders on `/about`, footer renders on every route, and SPA fallback handles unknown paths.
- §NFR-2.4.4 — Fresh machines and CI workers install Playwright's Chromium before E2E.
- §FR-1.7.1 — `bunx playwright test` is part of the GitHub Actions CI gate (see [`features/ci-cd.md`](./ci-cd.md)).

## File layout
- `tests/smoke.test.ts` — unit-level smoke test for the App shell.
- `tests/e2e/site.e2e.ts` — Playwright spec covering local dev-server behavior.
- `tests/e2e/built.e2e.ts` — Playwright spec covering built output via `bun run preview`.
- `tests/e2e/production.e2e.ts` — optional production smoke spec for `moster.dev` after deploy.
- `playwright.config.ts` — Playwright config at repo root.

## Behavior & edge cases
- **`bun test`:**
  - Finds `tests/**/*.test.ts` plus any colocated `src/**/*.test.ts`.
  - `smoke.test.ts` renders `<App />` inside a `MemoryRouter` and asserts the canonical Home page content renders without throwing.
- **`bunx playwright test`:**
  - Config:
    - `testDir: "tests/e2e"`.
    - `webServer: { command: "bun run dev", url: "http://localhost:3000", reuseExistingServer: !process.env.CI }` (port matches `scripts/dev.ts`).
    - Chromium project only — no Firefox / WebKit in v2.
    - No trace / video by default; opt in via CLI when debugging.
  - Fresh-machine setup requires `bun install` followed by `bun run setup:browsers` before the first E2E run.
  - CI must run the same browser install step before `bunx playwright test`; do not rely on a pre-existing Playwright cache. The canonical CI workflow lives in `.github/workflows/ci.yml` — see [`features/ci-cd.md`](./ci-cd.md) and [architecture §8.1](../architecture.md#81-ci-on-github-actions).
  - `site.e2e.ts`, `built.e2e.ts`, and `production.e2e.ts` cover, per §NFR-2.4.3:
    - **Page loads** — `await page.goto("/")` returns 200 and the document has `<div id="root">`.
    - **Hero copy** — the hero substring `"It's my pleasure to invite you into my portfolio."` is visible.
    - **Social links** — three anchors with `href` matching `github.com/jlvmoster`, `instagram.com/jlvmoster`, `linkedin.com/in/jlvmoster`.
    - **Theme toggle** — cycles light/dark/system and persists the selected value across reload via `localStorage["theme"]`.
  - Out of scope per the requirements: full-DOM snapshots, visual regression, multi-browser matrix.
  - Additional v2 assertions:
    - Navigate to each route (`/about`, `/articles`, `/projects`, `/uses`) via Header NavLinks; verify no full reload (scroll-position trick) and URL updates.
    - Hard-refresh on `/about`, `/articles`, `/projects`, `/uses`: each returns 200 and the page renders (Workers SPA fallback).
    - Theme toggle: click cycles `html.dark`; reload persists the choice via `localStorage["theme"]`.
    - `/about` renders an `<img src="/images/portrait.jpg">`.
    - `/articles` renders ≥ 1 article card; clicking it navigates to `/articles/:slug`.
    - Footer renders on every route.

## Test plan
- `bun test` passes (the smoke file is the test).
- `bunx playwright test` passes against `bun run dev`.
- Both run cleanly from a fresh clone after `bun install && bun run setup:browsers`.

## Open questions
- Visual regression tooling (e.g., Playwright screenshot diffs) — explicitly out of scope per §NFR-2.4.3, but worth confirming we won't add it casually later.
