# Hosting (Vercel) — Implementation Spec

## Goal
Static SPA hosting on Vercel: `vercel.json` build/output settings, SPA rewrites for client routes, security headers, and local `bun run preview` that mirrors production rewrite semantics.

## Requirements covered
- §FR-1.4.1 — Deploys to Vercel as a static SPA from `dist/` (not Cloudflare Workers/Pages, not Next.js).
- §FR-1.4.2 — Hosting config lives in `vercel.json`; no Worker entrypoint.
- §FR-1.4.3 — Unknown paths rewrite to `index.html`.
- §FR-1.4.4 — Served from `moster.dev` with automatic HTTPS after DNS cutover.
- §FR-1.4.5 — Future dynamic routes use Vercel serverless/Edge Functions under `/api/*`.
- §FR-1.5.3 — `bun run preview` serves `dist/` via `scripts/preview.ts`.
- §FR-1.6.1 — No platform-generated Worker type stubs.
- §FR-1.7.2 — Production deploys run via Vercel Git Integration. See [`features/ci-cd.md`](./ci-cd.md).

## File layout
- `vercel.json` — build command, output directory, SPA rewrites, security headers. See [architecture §4.1](../architecture.md#41-verceljson-and-scriptspreviewts).
- `scripts/preview.ts` — local Bun server for `dist/` with SPA fallback (13 lines; the SPA fallback is the whole feature).
- Retired (removed): `wrangler.toml`, `src/worker.ts`, `worker-configuration.d.ts`.

## Behavior & edge cases
- Vercel serves existing files under `dist/` first; the rewrite supplies `index.html` for client routes and unknown paths.
- Security headers (HSTS, X-Frame-Options, Referrer-Policy, COOP, Permissions-Policy, CSP, X-Content-Type-Options) are declared in `vercel.json` `headers` — the same intent formerly implemented in `src/worker.ts`.
- **`vercel.json` must be at the repo root of whatever gets deployed.** Git Integration deploys the repo root, so it applies. Deploying a built directory instead (`vercel deploy dist`) uploads a root with no `vercel.json`, silently dropping every rewrite and header — deep links 404 and the site ships with no security headers. This is why CD is Git Integration and not a CLI call on `dist/`.
- `vercel.json` also carries `buildCommand` / `installCommand` / `outputDirectory`. `outputDirectory: "dist"` is mandatory — the default for a framework-less project is `public/`, which exists here and holds only copy-along assets. The other two restate Vercel's defaults but stay explicit: since Vercel now owns the production build, the build contract belongs in a committed file rather than in dashboard settings that `vercel.json` would override anyway.
- `scripts/preview.ts` listens on port `4173` (matched by `playwright.built.config.ts`). It mirrors the *rewrite* only, not the headers — so built-artifact E2E cannot prove the header block is live. `tests/e2e/production.e2e.ts` covers that against the real edge.
- Hard-refreshing `/about`, `/articles`, `/articles/:slug`, `/projects`, `/uses` must return the SPA shell so `react-router-dom` can resolve the route client-side.
- Do not reintroduce Wrangler, Cloudflare Workers Static Assets, or Pages Functions for production.

## Test plan
- **Pre-deploy smoke:** `bun run build && bun run preview` serves the built site without errors.
- **E2E:** request `/some-unknown-path` returns the SPA shell (status 200, body contains `<div id="root">`).
- **Headers:** `bun run test:e2e:production` asserts each `vercel.json` header on the deployed origin. Nothing local can substitute. Run it against the custom domain — Deployment Protection blocks `*.vercel.app`.
- **Type check:** `bun run check` passes without `wrangler types`.

## Open questions
- Prefer Vercel Git Integration alone for production vs a GitHub Actions `vercel deploy` job? **Resolved:** Git Integration alone. Actions runs CI only. A second deploy path would race the platform's own build on every push to `master`, needs three long-lived secrets, and pulls the Vercel CLI into the lockfile (+170 packages) to do what the installed GitHub App already does. The `check` required status check is what gates production (§FR-1.7.7).
