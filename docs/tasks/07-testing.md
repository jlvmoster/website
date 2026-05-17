# Task 07 — Unit smoke + Playwright E2E

## Goal
Add the smoke unit test and the Playwright config + spec that cover the minimum E2E surface required by §NFR-2.4.3.

## Source spec
- [`features/testing.md`](../specs/features/testing.md)
- Requirements: §NFR-2.4.1–§NFR-2.4.4

## Prereqs
- Task 04 (App shell mounts).
- Task 05 (real section components, so hero copy and social links exist to assert against).
- Task 06 (`bun run dev` serves the site — Playwright's `webServer` points at it).
- Task 01 installed `@happy-dom/global-registrator` so `bun test` can run DOM-based React smoke tests.

## Steps

1. **`tests/setup-dom.ts`** — register Happy DOM globals before any unit tests run:
   ```ts
   import { GlobalRegistrator } from "@happy-dom/global-registrator";

   GlobalRegistrator.register();
   ```
2. **Update `bunfig.toml`** so Bun preloads the DOM setup for `bun test`:
   ```toml
   [test]
   preload = "./tests/setup-dom.ts"
   ```
3. **`tests/smoke.test.ts`** — `bun:test` unit smoke. Imports `<App />`, renders it with `react-dom/client` into a fresh `document.createElement("div")`, asserts no throw, and verifies that the four section IDs (`hero`, `writing`, `about`, `contact`) appear in document order. Clean up the root/container after the test.
4. **Install Playwright browsers**: `bun run setup:browsers` (runs `playwright install chromium`). CI must run the same step before E2E — do not rely on a machine-local cache (§NFR-2.4.4).
5. **`playwright.config.ts`** at repo root:
   - `testDir: "tests/e2e"`.
   - `webServer: { command: "bun run dev", url: "http://localhost:<port>", reuseExistingServer: !process.env.CI }` — port must match Task 06's `scripts/dev.ts`.
   - Chromium project only (no Firefox / WebKit in v1).
   - No trace / video by default; opt in via CLI when debugging.
6. **`tests/e2e/site.spec.ts`** covering §NFR-2.4.3:
   - **Page loads**: `await page.goto("/")` returns 200 and `<div id="root">` is in the document.
   - **Hero copy verbatim**: substring `"It's my pleasure to invite you into my portfolio."` is visible (the "my pleasure" guard).
   - **Social links**: three anchors with `href` matching `github.com/jlvmoster`, `instagram.com/jlvmoster`, `linkedin.com/in/jlvmoster`.
   - **Dark mode**: launch a second context with `colorScheme: "dark"`; computed `background-color` of `<body>` differs from the light-scheme baseline.
   - **Dev-server fallback**: `await page.goto("/some-unknown-path")` returns 200 and the body contains `<div id="root">` — keeps local dev behavior SPA-compatible. The Workers Static Assets fallback is verified in Task 08 against `bun run preview`.
7. **Out of scope** (don't add): full-DOM snapshots, visual regression, multi-browser matrix.

## Outputs
- New: `tests/setup-dom.ts`, `tests/smoke.test.ts`, `tests/e2e/site.spec.ts`, `playwright.config.ts`.
- Updated: `bunfig.toml`.

## Verification
- `bun test` passes; at least one smoke test exists (§NFR-2.4.1).
- `bunx playwright test` passes against `bun run dev`.
- From a clean state: `bun install && bun run setup:browsers && bun test && bunx playwright test` all succeed (§NFR-2.4.4).

## Open questions to surface
- Wire E2E into GitHub Actions on day 1, or defer until after first deploy? (Affects whether `.github/workflows/` needs to land in this task.)
- Confirm visual regression remains out of scope — don't add it casually later.
