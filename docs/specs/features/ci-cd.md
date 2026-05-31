# CI/CD — Implementation Spec

## Goal
Automated CI on every PR and push to `master`, and automated production deploys on push to `master` through GitHub Actions using Cloudflare's official Wrangler action.

## Requirements covered
- §FR-1.7.1 — CI on every PR and push runs `bun install --frozen-lockfile`, `bun run setup:browsers`, `bun run check`, `bun run build`, `bun test`, `bunx playwright test`, and `bunx playwright test -c playwright.built.config.ts`.
- §FR-1.7.2 — Push to `master` triggers an automated production deploy after CI passes.
- §FR-1.7.3 — CI and CD both run on GitHub Actions; deploys use `cloudflare/wrangler-action@v3`.
- §FR-1.7.4 — Workflow files committed under `.github/workflows/`.
- §FR-1.7.5 — Cloudflare deploy credentials are stored only as GitHub Actions secrets (`CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`) and are never committed.
- §FR-1.7.6 — `bun run deploy` remains supported as a break-glass path only.
- §NFR-2.2.3 — CI/CD stays within GitHub Actions' free tier where possible.
- §NFR-2.4.4 — CI workers run Playwright's Chromium installer on every run, after restoring the browser cache if available, so E2E does not depend on a pre-existing cache.

## File layout
- `.github/workflows/ci.yml` — single workflow with `check` and `deploy` jobs. See [architecture §8.1](../architecture.md#81-ci-on-github-actions) for the canonical YAML.
- No Workers Builds configuration. CD flows through GitHub Actions.

## Behavior & edge cases
- **Workflow (`.github/workflows/ci.yml`):**
  - Triggers: `pull_request` against `master`, `push` to `master`, and a `schedule: '0 11 * * 0'` cron (Sundays at 06:00 EST / 11:00 UTC) that fires only the `lighthouse` job (see `features/lighthouse-ci.md`).
  - `check` job runs on `ubuntu-latest` and is gated with `if: github.event_name != 'schedule'` so cron runs do not re-execute the suite.
  - `check` steps in order: `actions/checkout@v6` → `actions/setup-node@v6` (node 22) → `oven-sh/setup-bun@v2` → restore Bun package cache → restore Playwright browser cache → `bun install --frozen-lockfile` → `bun run setup:browsers` → `bun run check` → `bun run build` → `bun test` → `bunx playwright test` → `bunx playwright test -c playwright.built.config.ts`.
  - `deploy` job has `needs: check` and only runs when `github.event_name == 'push' && github.ref == 'refs/heads/master'`.
  - `deploy` steps: `actions/checkout@v6` → `actions/setup-node@v6` (node 22) → `oven-sh/setup-bun@v2` → restore Bun package cache → `bun install --frozen-lockfile` → `bun run build` → `cloudflare/wrangler-action@v3`.
  - `lighthouse` job (`needs: deploy`, `if: always() && (needs.deploy.result == 'success' || github.event_name == 'schedule')`) runs post-deploy and on the weekly cron; see `features/lighthouse-ci.md` for behavior.
  - The Wrangler action receives `apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}` and `accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}`.
  - `--frozen-lockfile` enforces that PRs touching dependencies update `bun.lock`.
  - Cache Bun packages with `actions/cache@v5`, path `~/.bun/install/cache`, key `bun-${{ runner.os }}-${{ hashFiles('bun.lock') }}`.
  - Cache Playwright browsers with `actions/cache@v5`, path `~/.cache/ms-playwright`, key `playwright-${{ runner.os }}-${{ hashFiles('bun.lock') }}`.
  - Do not cache `node_modules`; keep `bun install --frozen-lockfile` as the source of truth and use the Bun package cache only to speed downloads.
  - Keep `bun run setup:browsers` after the Playwright cache restore so CI works on cold caches and repairs incomplete browser caches.
  - Required-status-check on `check` (configured in GitHub branch protection) is what enforces §FR-1.7.1's "PR cannot merge until CI is green."
- **Cloudflare credentials:**
  - Create a scoped Cloudflare API token with Workers deploy permissions for the target account/project.
  - Store it in GitHub Actions secrets as `CLOUDFLARE_API_TOKEN`; store the account ID as `CLOUDFLARE_ACCOUNT_ID`.
  - Never commit either value or print them in logs.
- **Failure semantics:**
  - CI failure on a PR → branch protection blocks the merge.
  - CI failure on a push to `master` → `deploy` is skipped because it depends on `check`.
  - Deploy failure → visible in the GitHub Actions run; the live site stays on the previous deploy.
- **Break-glass deploy:** `bun run deploy` (§FR-1.5.4) still works for a developer with `wrangler login` configured. Use only when GitHub Actions is unavailable.

## Test plan
- **CI green path:** open a no-op PR; confirm `check` runs all five commands and reports green.
- **CI red path:** push a deliberate Biome violation on a branch; confirm the PR cannot merge because `check` is red.
- **CD path:** merge a trivial visible content change to `master`; confirm the GitHub Actions `deploy` job runs after `check`, `cloudflare/wrangler-action@v3` reports a successful deploy, `curl -sI https://moster.dev` returns 200, and the live page reflects the change.
- **Lockfile drift:** push a branch that adds a dep without updating `bun.lock`; confirm `bun install --frozen-lockfile` fails CI.

## Open questions
- Add a protected GitHub Environment for production deploy approval? Skipped for v1; the deploy job already runs only on `master` after `check` passes.
