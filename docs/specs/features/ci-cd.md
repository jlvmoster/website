# CI/CD — Implementation Spec

## Goal
Automated CI on every PR and push to `master`, and automated production deploys on push to `master` through GitHub Actions using the Vercel CLI.

## Requirements covered
- §FR-1.7.1 — CI on every PR and push runs `bun install --frozen-lockfile`, `bun run setup:browsers`, `bun run check`, `bun run build`, `bun test`, `bunx playwright test`, and `bunx playwright test -c playwright.built.config.ts`.
- §FR-1.7.2 — Push to `master` triggers an automated production deploy after CI passes.
- §FR-1.7.3 — CI and CD both run on GitHub Actions; deploys use the Vercel CLI (`vercel deploy`).
- §FR-1.7.4 — Workflow files committed under `.github/workflows/`.
- §FR-1.7.5 — Vercel deploy credentials are stored only as GitHub Actions secrets (`VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`) and are never committed.
- §FR-1.7.6 — `bun run deploy` remains supported as a break-glass path only.
- §FR-1.7.7 — Vercel Git Integration must not race ahead of the Actions `check` gate for production.
- §NFR-2.2.3 — CI/CD stays within GitHub Actions' free tier where possible.
- §NFR-2.4.4 — CI workers run Playwright's Chromium installer on every run, after restoring the browser cache if available, so E2E does not depend on a pre-existing cache.

## File layout
- `.github/workflows/ci.yml` — single workflow with `check` and `deploy` jobs. See [architecture §8.1](../architecture.md#81-ci-on-github-actions) for the canonical YAML.
- No Cloudflare Wrangler action. CD flows through GitHub Actions → Vercel CLI.

## Behavior & edge cases
- **Workflow (`.github/workflows/ci.yml`):**
  - Triggers: `pull_request` against `master` and `push` to `master`.
  - `check` job runs on `ubuntu-latest`.
  - `check` steps in order: `actions/checkout@v6` → `oven-sh/setup-bun@v2` → restore Bun package cache → restore Playwright browser cache → `bun install --frozen-lockfile` → `bun run setup:browsers` → `bun run check` → `bun run build` → `bun test` → `bunx playwright test` → `bunx playwright test -c playwright.built.config.ts`.
  - `deploy` job has `needs: check` and only runs when `github.event_name == 'push' && github.ref == 'refs/heads/master'`.
  - `deploy` steps: checkout → setup-bun → Bun cache → `bun install --frozen-lockfile` → `bun run build` → `bunx vercel deploy dist --prod --yes --token="$VERCEL_TOKEN"` with `VERCEL_ORG_ID` / `VERCEL_PROJECT_ID` in the environment.
  - `--frozen-lockfile` enforces that PRs touching dependencies update `bun.lock`.
  - Cache Bun packages with `actions/cache@v5`, path `~/.bun/install/cache`, key `bun-${{ runner.os }}-${{ hashFiles('bun.lock') }}`.
  - Cache Playwright browsers with `actions/cache@v5`, path `~/.cache/ms-playwright`, key `playwright-${{ runner.os }}-${{ hashFiles('bun.lock') }}`.
  - Do not cache `node_modules`; keep `bun install --frozen-lockfile` as the source of truth.
  - Keep `bun run setup:browsers` after the Playwright cache restore so CI works on cold caches.
  - Required-status-check on `check` (configured in GitHub branch protection) is what enforces §FR-1.7.1's "PR cannot merge until CI is green."
- **Vercel credentials:**
  - Create a Vercel token with deploy access for the team/project.
  - Store `VERCEL_TOKEN`, `VERCEL_ORG_ID` (team id), and `VERCEL_PROJECT_ID` as GitHub Actions secrets.
  - Never commit either value or print them in logs.
  - Install the [Vercel GitHub App](https://github.com/apps/vercel) if using Git Integration for preview deployments or linking the repo in the Vercel dashboard.
- **Failure semantics:**
  - CI failure on a PR → branch protection blocks the merge.
  - CI failure on a push to `master` → `deploy` is skipped because it depends on `check`.
  - Deploy failure → visible in the GitHub Actions run; the live site stays on the previous deploy.
- **Break-glass deploy:** `bun run deploy` (§FR-1.5.4) still works for a developer with `vercel login` / a token. Use only when GitHub Actions is unavailable.

## Test plan
- **CI green path:** open a no-op PR; confirm `check` runs all commands and reports green.
- **CI red path:** push a deliberate Biome violation on a branch; confirm the PR cannot merge because `check` is red.
- **CD path:** merge a trivial visible content change to `master`; confirm the GitHub Actions `deploy` job runs after `check`, Vercel reports a successful deploy, `curl -sI https://moster.dev` returns 200 (after DNS cutover), and the live page reflects the change.
- **Lockfile drift:** push a branch that adds a dep without updating `bun.lock`; confirm `bun install --frozen-lockfile` fails CI.

## Open questions
- Add a protected GitHub Environment for production deploy approval? Skipped for v1; the deploy job already runs only on `master` after `check` passes.
