# Task 12 — CI/CD bootstrap

## Goal
Land the GitHub Actions workflow that gates PRs and deploys `master` through Cloudflare's official Wrangler action. Manual `bun run deploy` becomes break-glass, not the production path.

## Source spec
- [`features/ci-cd.md`](../specs/features/ci-cd.md)
- Architecture [§8 CI/CD](../specs/architecture.md#8-cicd) and [§7 Post-scaffold operational steps](../specs/architecture.md#7-post-scaffold-operational-steps)
- Requirements: §FR-1.7.1–§FR-1.7.6, §NFR-2.2.3

## Prereqs
- Task 01 (canonical `package.json` scripts — CI invokes them).
- Task 02 (`wrangler.toml` exists — Wrangler action reads it).
- Task 06 (`bun run build` produces `dist/` — deploy job runs the build).
- Task 07 (`bun test` + `bunx playwright test` exist — CI runs them).

## Steps

1. **Create Cloudflare deploy secrets in GitHub**:
   - In Cloudflare, create a narrowly scoped API token with Workers deploy permissions for this account/project.
   - In GitHub repo settings → Secrets and variables → Actions, add `CLOUDFLARE_API_TOKEN`.
   - Add `CLOUDFLARE_ACCOUNT_ID`.
   - Do not commit either value.
2. **Create `.github/workflows/ci.yml`** matching the canonical YAML in [architecture §8.1](../specs/architecture.md#81-ci-on-github-actions). Do not paraphrase — copy verbatim. The workflow has:
   - `check` job for PRs and pushes to `master`.
   - `deploy` job with `needs: check`, guarded to `push` events on `refs/heads/master`.
   - `actions/cache@v5` steps keyed by `bun.lock` for `~/.bun/install/cache` and `~/.cache/ms-playwright`.
   - `cloudflare/wrangler-action@v3` as the deploy step.
3. **Enable branch protection on `master`** (GitHub repo settings → Branches): require the `check` status check to pass before merge; require PRs (no direct push). This is what enforces §FR-1.7.1's "PR cannot merge until CI is green."
4. **Confirm `bun run deploy` still works** locally as a break-glass path (§FR-1.7.6). Do not delete the script.

## Outputs
- New: `.github/workflows/ci.yml`.
- New GitHub Actions secrets: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID` (dashboard state, not repo files).
- No Workers Builds configuration.

## Verification
- Push the branch and open a PR; the `check` job runs all five commands and reports green.
- Push a deliberate Biome violation on a throwaway branch; confirm the PR cannot merge because `check` is red. Revert.
- Merge a trivial visible content change to `master`; confirm the GitHub Actions `deploy` job runs after `check`, `cloudflare/wrangler-action@v3` reports a successful deploy, `curl -sI https://moster.dev` returns 200, and the live page reflects the change.
- Drop a dependency change without updating `bun.lock`; confirm `bun install --frozen-lockfile` fails CI. Revert.

## Open questions to surface
- Add a protected GitHub Environment for production deploy approval? Defer for v1; the deploy job already runs only on `master` after `check` passes.
