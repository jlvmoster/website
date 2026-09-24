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
- §FR-1.7.7 — `check` is a required status check on `master`; that gate is what keeps un-tested commits out of production.
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
- **Required status check (load-bearing):**
  - `check` must be a required status check on `master` in GitHub branch protection (§FR-1.7.7). Vercel starts building the moment a commit lands on `master`, so branch protection — not job ordering — is what stops an un-tested commit from reaching production.
  - This is the same gate that enforces §FR-1.7.1's "PR cannot merge until CI is green"; the migration to host-owned CD just makes it the *only* gate.
- **Vercel Git Integration:**
  - Install the [Vercel GitHub App](https://github.com/apps/vercel) and link the repo to the Vercel project. No tokens, org ids, or project ids are stored anywhere in GitHub.
  - Push to `master` → production deploy. Push to any PR branch → preview deploy, which is a useful extra acceptance surface (see `features/testing.md`).
  - Vercel builds from the repo root, so the committed `vercel.json` (rewrites + security headers) applies. A build that uploads only `dist/` would *not* pick up `vercel.json` — that is why nothing in this repo runs `vercel deploy dist`.
- **Failure semantics:**
  - CI failure on a PR → branch protection blocks the merge, so the commit never reaches `master` and never deploys.
  - Build failure on Vercel → visible in the Vercel dashboard and on the commit's checks; the live site stays on the previous deploy (Vercel only promotes successful builds).
- **Break-glass deploy:** `bunx vercel --prod` from a `vercel link`-ed checkout (§FR-1.5.4). Use only when Git Integration is unavailable. There is deliberately no committed `deploy` script — a script pinned in `package.json` invites routine use of the path that skips CI.

## Test plan
- **CI green path:** open a no-op PR; confirm `check` runs all commands and reports green.
- **CI red path:** push a deliberate Biome violation on a branch; confirm the PR cannot merge because `check` is red.
- **Gate check:** confirm `check` is listed as a required status check on `master` in branch protection. Without it, §FR-1.7.7 is unenforced and an un-tested push deploys.
- **CD path:** merge a trivial visible content change to `master`; confirm Vercel reports a successful production deploy, `curl -sI https://moster.dev` returns 200 (after DNS cutover), and the live page reflects the change.
- **Config-applied check:** after the first production deploy, `bun run test:e2e:production` — it asserts both deep-link rewrites and the `vercel.json` security headers, which is the only automated proof that `vercel.json` took effect.
- **Lockfile drift:** push a branch that adds a dep without updating `bun.lock`; confirm `bun install --frozen-lockfile` fails CI.

## Open questions
- Gate Vercel production builds further with an Ignored Build Step (`vercel.json` `ignoreCommand`)? Not needed while `check` is a required status check — every commit on `master` has already passed CI.
