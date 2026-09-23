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
- §FR-1.7.2 — Production deploys run via GitHub Actions after CI. See [`features/ci-cd.md`](./ci-cd.md).

## File layout
- `vercel.json` — build command, output directory, SPA rewrites, security headers. See [architecture §4.1](../architecture.md#41-verceljson-static-spa).
- `scripts/preview.ts` — local Bun server for `dist/` with SPA fallback. See [architecture §4.2](../architecture.md#42-scriptspreviewts-local-built-artifact-server).
- Retired (removed): `wrangler.toml`, `src/worker.ts`, `worker-configuration.d.ts`.

## Behavior & edge cases
- Vercel serves existing files under `dist/` first; the rewrite supplies `index.html` for client routes and unknown paths.
- Security headers (HSTS, X-Frame-Options, Referrer-Policy, COOP, Permissions-Policy, CSP, X-Content-Type-Options) are declared in `vercel.json` `headers` — the same intent formerly implemented in `src/worker.ts`.
- `scripts/preview.ts` listens on port `4173` (matched by `playwright.built.config.ts`).
- Hard-refreshing `/about`, `/articles`, `/articles/:slug`, `/projects`, `/uses` must return the SPA shell so `react-router-dom` can resolve the route client-side.
- Do not reintroduce Wrangler, Cloudflare Workers Static Assets, or Pages Functions for production.

## Test plan
- **Pre-deploy smoke:** `bun run build && bun run preview` serves the built site without errors.
- **E2E:** request `/some-unknown-path` returns the SPA shell (status 200, body contains `<div id="root">`).
- **Type check:** `bun run check` passes without `wrangler types`.

## Open questions
- Prefer Vercel Git Integration alone for production vs GitHub Actions `vercel deploy`? **Resolved for this migration:** keep Actions as the production deploy path after `check`; Git Integration may create preview deployments.
