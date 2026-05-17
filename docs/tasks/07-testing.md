# Task 07 — Unit smoke + Playwright E2E

## Goal
Add the smoke unit test and the Playwright config + spec that cover the minimum E2E surface required by §NFR-2.4.3, without pulling in a DOM polyfill.

## Source spec
- [`features/testing.md`](../specs/features/testing.md)
- Requirements: §NFR-2.4.1–§NFR-2.4.4

## Prereqs
- Task 04 (App shell mounts).
- Task 05 (real section components, so hero copy and social links exist to assert against).
- Task 06 (`bun run dev` serves the site — Playwright's `webServer` points at it).

## Approach: server-render the smoke test, leave DOM concerns to Playwright

The Bun docs' default recommendation for DOM-style tests is `@happy-dom/global-registrator` + a `bunfig.toml` preload. We're skipping it because:

- The v1 components (Hero, Writing empty state, About, Contact `mailto:`) are pure JSX with no client state, effects, or event handlers worth unit-testing.
- `react-dom/server`'s `renderToStaticMarkup` already ships with the `react-dom` dep installed in Task 01 — it renders `<App />` to an HTML string synchronously, with zero extra packages and no preload wiring.
- DOM-only concerns (dark mode via `prefers-color-scheme`, computed styles, scroll behavior, IntersectionObserver) belong in Playwright per §NFR-2.4.3, not in `bun test`.
- Effects don't run during `renderToStaticMarkup` — that's exactly the bound we want for a smoke check ("does the tree render without throwing and contain the right static content?").

**Revisit later** (don't add prematurely): add `@happy-dom/global-registrator` only when a component's correctness depends on a DOM API that Playwright can't reasonably exercise — e.g. a logic-heavy hook that we genuinely want to unit-test. Until then, every interactive concern lives in `tests/e2e/`.

## Steps

1. **`tests/smoke.test.ts`** — `bun:test` unit smoke using `react-dom/server`. No preload, no globals, no DOM:
   ```ts
   import { test, expect } from "bun:test";
   import { createElement } from "react";
   import { renderToStaticMarkup } from "react-dom/server";
   import { App } from "../src/App";

   test("App renders without throwing and contains the canonical hero copy + section IDs in order", () => {
     const html = renderToStaticMarkup(createElement(App));

     expect(html).toContain(
       "It's my pleasure to invite you into my portfolio."
     );

     const order = ["hero", "writing", "about", "contact"].map((id) =>
       html.indexOf(`id="${id}"`)
     );
     expect(order.every((i) => i >= 0)).toBe(true);
     expect(order).toEqual([...order].sort((a, b) => a - b));

     for (const url of [
       "https://github.com/jlvmoster",
       "https://instagram.com/jlvmoster",
       "https://linkedin.com/in/jlvmoster",
     ]) {
       expect(html).toContain(url);
     }
   });
   ```
   - The "renders without throwing" requirement of §NFR-2.4.1 is satisfied by the call itself — `renderToStaticMarkup` throws on a broken tree.
   - The hero-copy substring is the unit-level guard for FR-1.2.1.a / the CLAUDE.md "my pleasure" hard rule. Worth duplicating at this layer because regressing it is cheap to introduce and expensive to notice.
2. **Install Playwright browsers**: `bun run setup:browsers` (runs `playwright install chromium`). CI must run the same step before E2E — do not rely on a machine-local cache (§NFR-2.4.4).
3. **`playwright.config.ts`** at repo root:
   - `testDir: "tests/e2e"`.
   - `webServer: { command: "bun run dev", url: "http://localhost:<port>", reuseExistingServer: !process.env.CI }` — port must match Task 06's `scripts/dev.ts`.
   - `use: { baseURL: "http://localhost:<port>" }` so specs can call `page.goto("/")` and `page.goto("/some-unknown-path")`.
   - Chromium project only (no Firefox / WebKit in v1).
   - No trace / video by default; opt in via CLI when debugging.
4. **`tests/e2e/site.spec.ts`** covering §NFR-2.4.3:
   - **Page loads**: `await page.goto("/")` returns 200 and `<div id="root">` is in the document.
   - **Hero copy verbatim**: substring `"It's my pleasure to invite you into my portfolio."` is visible (the "my pleasure" guard).
   - **Social links**: three anchors with `href` matching `github.com/jlvmoster`, `instagram.com/jlvmoster`, `linkedin.com/in/jlvmoster`.
   - **Dark mode**: launch a second context with `colorScheme: "dark"`; computed `background-color` of `<body>` differs from the light-scheme baseline.
   - **Dev-server fallback**: `await page.goto("/some-unknown-path")` returns 200 and the body contains `<div id="root">` — keeps local dev behavior SPA-compatible. The Workers Static Assets fallback is verified in Task 08 against `bun run preview`.
5. **Out of scope** (don't add): full-DOM snapshots, visual regression, multi-browser matrix, `@happy-dom/global-registrator`, `@testing-library/react`.

## Outputs
- New: `tests/smoke.test.ts`, `tests/e2e/site.spec.ts`, `playwright.config.ts`.
- No new deps. No `bunfig.toml` changes (no test preload required).

## Verification
- `bun test` passes; the smoke test exists and exercises real React rendering (§NFR-2.4.1).
- `bunx playwright test` passes against `bun run dev`.
- From a clean state: `bun install && bun run setup:browsers && bun test && bunx playwright test` all succeed (§NFR-2.4.4).

## Open questions to surface
- Wire E2E into GitHub Actions on day 1, or defer until after first deploy? (Affects whether `.github/workflows/` needs to land in this task.)
- Confirm visual regression remains out of scope — don't add it casually later.
- Confirm we're comfortable deferring a DOM polyfill until a component actually needs one. If you'd rather have Happy DOM in place from day 1 (e.g. so a future contributor can `bun add` a testing-library without re-plumbing the preload), say so and we'll restore the Task 01 dep and a minimal `tests/setup-dom.ts`.
