# CI/CD — Implementation Spec

## Goal
Automated CI on every PR and push to `master` through GitHub Actions, and automated production deploys on push to `master` through Vercel Git Integration. Two systems, one job each — GitHub Actions never deploys.

## Requirements covered
- §FR-1.7.1 — CI on every PR and push runs `bun install --frozen-lockfile`, `bun run setup:browsers`, `bun run check`, `bun run build`, `bun test`, `bunx playwright test`, and `bunx playwright test -c playwright.built.config.ts`.
- §FR-1.7.2 — Push to `master` triggers an automated production deploy.
- §FR-1.7.3 — Exactly one production deploy path: Vercel Git Integration. The workflow has no deploy job.
- §FR-1.7.4 — Workflow files committed under `.github/workflows/`.
- §FR-1.7.5 — No deploy credentials in the repo or in Actions secrets; the Vercel GitHub App authenticates.
- §FR-1.7.6 — Manual `bunx vercel --prod` remains available as break-glass only.
- §FR-1.7.7 — `check` is a required GitHub status check on `master`, and a Vercel Deployment Check on that workflow holds production promotion.
- §NFR-2.2.3 — CI/CD stays within GitHub Actions' free tier where possible.
- §NFR-2.4.4 — CI workers run Playwright's Chromium installer on every run, after restoring the browser cache if available, so E2E does not depend on a pre-existing cache.

## File layout
- `.github/workflows/ci.yml` — single `check` job. See [architecture §8.1](../architecture.md#81-ci-on-github-actions) for the canonical YAML.
- No deploy job, no Wrangler action, no Vercel CLI. CD is not in this repo's workflow files at all.

## Behavior & edge cases
- **Workflow (`.github/workflows/ci.yml`):**
  - Triggers: `pull_request` against `master` and `push` to `master`.
  - `check` job runs on `ubuntu-latest`.
  - `check` steps in order: `actions/checkout@v6` → `oven-sh/setup-bun@v2` → restore Bun package cache → restore Playwright browser cache → `bun install --frozen-lockfile` → `bun run setup:browsers` → `bun run check` → `bun run build` → `bun test` → `bunx playwright test` → `bunx playwright test -c playwright.built.config.ts`.
  - `--frozen-lockfile` enforces that PRs touching dependencies update `bun.lock`.
  - Cache Bun packages with `actions/cache@v5`, path `~/.bun/install/cache`, key `bun-${{ runner.os }}-${{ hashFiles('bun.lock') }}`.
  - Cache Playwright browsers with `actions/cache@v5`, path `~/.cache/ms-playwright`, key `playwright-${{ runner.os }}-${{ hashFiles('bun.lock') }}`.
  - Do not cache `node_modules`; keep `bun install --frozen-lockfile` as the source of truth.
  - Keep `bun run setup:browsers` after the Playwright cache restore so CI works on cold caches.
  - `permissions: contents: read` — checkout is all `GITHUB_TOKEN` needs now that nothing deploys.
- **Production gate (load-bearing, §FR-1.7.7):**
  - GitHub branch protection requires `check` on `master`. That blocks a red pull request. It does not pause Vercel.
  - Vercel Deployment Checks include the `check` workflow (Project Settings → Deployment Checks → GitHub). Vercel still builds when the production branch updates; the check holds the production alias until `check` is green.
  - Branch protection is also what enforces §FR-1.7.1's "PR cannot merge until CI is green."
- **Vercel Git Integration:**
  - Install the [Vercel GitHub App](https://github.com/apps/vercel) and link the repo to the Vercel project. No tokens, org ids, or project ids are stored anywhere in GitHub.
  - Push to `master` → production deploy. Push to any PR branch → preview deploy.
  - Preview URLs are **not** an automated acceptance surface as configured: the project has Deployment Protection set to `all_except_custom_domains`, so `*.vercel.app` URLs redirect to Vercel's login page and `bun run test:e2e:production` fails on every assertion. Pointing it at a preview would require a Protection Bypass for Automation secret; not worth adding until something needs it.
  - Vercel builds from the repo root, so the committed `vercel.json` (rewrites + security headers) applies. A build that uploads only `dist/` would *not* pick up `vercel.json` — that is why nothing in this repo runs `vercel deploy dist`.
- **Failure semantics:**
  - CI failure on a PR → branch protection blocks the merge, so the commit never reaches `master` and never deploys.
  - Build failure on Vercel → visible in the Vercel dashboard and on the commit's checks; the live site stays on the previous deploy (Vercel only promotes successful builds).
- **Break-glass deploy:** `bunx vercel --prod` from a `vercel link`-ed checkout (§FR-1.5.4). Use only when Git Integration is unavailable. There is deliberately no committed `deploy` script — a script pinned in `package.json` invites routine use of the path that skips CI.

## Test plan
- **CI green path:** open a no-op PR; confirm `check` runs all commands and reports green.
- **CI red path:** push a deliberate Biome violation on a branch; confirm the PR cannot merge because `check` is red.
- **Gate check:** confirm `check` is a required status check on `master`, and that the Vercel project lists `check` under Deployment Checks. Without the Vercel half, a push to the production branch promotes while CI is still running.
- **CD path:** merge a trivial visible content change to `master`; confirm Vercel reports a successful production deploy, `curl -sI https://moster.dev` returns 200 (after DNS cutover), and the live page reflects the change.
- **Config-applied check:** after the first production deploy, `bun run test:e2e:production` — it asserts both deep-link rewrites and the `vercel.json` security headers, which is the only automated proof that `vercel.json` took effect.
- **Lockfile drift:** push a branch that adds a dep without updating `bun.lock`; confirm `bun install --frozen-lockfile` fails CI.

## Open questions
- Skip Vercel builds with `ignoreCommand` until `check` passes? No. That skips the build entirely and races the Actions run. Deployment Checks hold promotion after the build, which is the gate §FR-1.7.7 names.
