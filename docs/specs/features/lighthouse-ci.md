# Lighthouse CI — Implementation Spec

## Goal
Post-deploy performance monitoring against `https://moster.dev` that asserts Core Web Vitals budgets on every push to `master` and on a nightly schedule. Failures alert; they do not gate PR merges.

## Requirements covered
- §FR-1.8.1 — Lighthouse runs against the live site on a representative set of routes after every production deploy.
- §FR-1.8.2 — Budgets live in committed `lighthouserc.json`; assertions run via `@lhci/cli` invoked through `treosh/lighthouse-ci-action`.
- §FR-1.8.3 — Triggered on push to `master` (after `deploy`) and on a daily `schedule:` cron. Not a PR merge gate.
- §FR-1.8.4 — `numberOfRuns: 3` with `aggregationMethod: "median"` on every assertion.
- §FR-1.8.5 — Reports uploaded to Google's temporary public storage and saved as a GitHub Actions artifact.
- §NFR-2.5.1 — LCP median ≤ 2500 ms (`error`).
- §NFR-2.5.2 — CLS median ≤ 0.1 (`error`).
- §NFR-2.5.3 — TBT median ≤ 200 ms (`warn`).
- §NFR-2.5.4 — Performance category median ≥ 0.9 (`error`).
- §NFR-2.2.3 — Stays on GitHub Actions' free tier (one runner, ~5 minutes, runs only on master + nightly).

## File layout
- `lighthouserc.json` — repo root, consumed by the action via `configPath`. Holds the URL list, run count, assertion thresholds, and upload target.
- `.github/workflows/ci.yml` — single workflow now hosts three jobs: `check`, `deploy`, `lighthouse`. See [architecture §8.1](../architecture.md#81-ci-on-github-actions) for the canonical YAML and [§8.5](../architecture.md#85-post-deploy-lighthouse-ci) for the design rationale.
- No new dependency in `package.json`; the action provisions `@lhci/cli` in the runner.

## Behavior & edge cases
- **Trigger surface:**
  - `push` to `master` → `check` → `deploy` → `lighthouse` (in that order, via `needs:` chain).
  - `schedule` (`0 7 * * *` UTC) → only `lighthouse` runs; `check` is skipped via `if: github.event_name != 'schedule'`, `deploy` is skipped by its existing event-name guard, and `lighthouse` evaluates because of `always() && (needs.deploy.result == 'success' || github.event_name == 'schedule')`.
  - `pull_request` → `check` runs; `deploy` and `lighthouse` are skipped. Lighthouse never gates a PR.
- **Audited routes (in `lighthouserc.json`):** `/`, `/about`, `/articles`. Keeps audit time bounded (~5 min for 3 URLs × 3 runs) and covers the three structurally distinct pages (Home hero + avatar scaling, image-heavy About, list page). Adding `/projects` and `/uses` is a one-line edit when their performance becomes a concern.
- **Run count and aggregation:** `numberOfRuns: 3` with `aggregationMethod: "median"` on each assertion. Single-run Lighthouse on shared GH runners commonly swings ±500 ms on LCP; the median across three runs absorbs that.
- **Lighthouse settings:** `preset: "desktop"`. The site's audience is desktop-first portfolio readers, and desktop preset reduces runner-throttling noise vs. the mobile default. A future `mobile` matrix entry would be additive, not a swap.
- **Assertion levels:**
  - `error` on LCP, CLS, and `categories:performance` — these are the absolute Core Web Vitals "good" cutoffs; a failure indicates a real regression.
  - `warn` on TBT — TBT is a lab-only proxy for the production INP signal; a failed budget is informational.
- **Assertion scope:** `lighthouserc.json` intentionally omits LHCI assertion presets such as `lighthouse:no-pwa`; only the explicit Core Web Vitals and performance-score budgets above are enforced. Broader accessibility, SEO, best-practices, or image-optimization audits should be added as separate requirements when they become intentional gates.
- **Deploy → measurement gap:** the `lighthouse` job sleeps 30 s on the `push` path (`if: github.event_name == 'push'`) so Cloudflare's global propagation completes before the audit. The schedule path skips the sleep because production is already live.
- **Report surfacing:** `temporaryPublicStorage: true` posts a shareable link in the workflow log (Google-hosted, no auth, no history). `uploadArtifacts: true` also stashes the raw HTML report as a workflow artifact. No LHCI Server is provisioned for v1 (§FR-1.8.5).
- **Failure semantics:** a Lighthouse assertion failure marks the workflow run red and emails the repo owner via GitHub's default notifications. The site stays on the just-deployed revision; rolling back is a manual decision based on the report link.
- **Cost:** one ubuntu-latest runner × ~5 min × (push-frequency + nightly) stays well under the free-tier 2,000 min/month even with daily runs.

## Test plan
- **First-run smoke:** merge this feature to `master`, watch CI; confirm `lighthouse` job runs after `deploy`, posts a `temporary-public-storage` URL in the log, and uploads an artifact.
- **Scheduled-run smoke:** on the next nightly cron firing, confirm a workflow run appears with only `lighthouse` executed (no `check`, no `deploy`).
- **Failing-budget rehearsal:** temporarily lower `largest-contentful-paint.maxNumericValue` to `100` in `lighthouserc.json` on a throwaway branch, push to `master`, confirm the `lighthouse` job fails red and the linked report shows the assertion. Revert.
- **PR isolation:** open a PR; confirm `lighthouse` does not run and is not listed as a required check in branch protection.

## Open questions
- Add a separate **mobile** preset matrix entry? Deferred — desktop-first audience, and a second preset doubles audit time.
- Move to a self-hosted LHCI Server (`serverBaseUrl` + `serverToken`) for historical diffing? Deferred per §FR-1.8.5 — not worth the Postgres + Heroku/Docker footprint for a personal site.
- Add a `budget.json` for byte-size budgets (JS/CSS/images)? Deferred until a regression actually demands it; the assertion budgets above already catch LCP regressions caused by oversized assets.
