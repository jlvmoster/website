# Hosting (Vercel) — Implementation Spec

## Goal

Static SPA hosting on Vercel: `vercel.json` build/output settings, SPA rewrites for the registered client routes, a root `404.html` for everything else, security headers, and local `bun run preview` that mirrors those status codes.

## Requirements covered

- §FR-1.4.1 — Deploys to Vercel as a static SPA from `dist/` (not Cloudflare Workers/Pages, not Next.js).
- §FR-1.4.2 — Hosting config lives in `vercel.json`; no Worker entrypoint.
- §FR-1.4.3 — Registered routes rewrite to `index.html` (HTTP 200). Unknown paths are `404.html` at HTTP 404.
- §FR-1.4.4 — Served from `moster.dev` with automatic HTTPS after DNS cutover.
- §FR-1.4.5 — Future dynamic routes use Vercel serverless/Edge Functions under `/api/*`.
- §FR-1.5.3 — `bun run preview` serves `dist/` via `scripts/preview.ts`.
- §FR-1.6.1 — No platform-generated Worker type stubs.
- §FR-1.7.2 — Production deploys run via Vercel Git Integration. See [`features/ci-cd.md`](./ci-cd.md).

## File layout

- `vercel.json` — build command, output directory, SPA rewrites, security headers. See [architecture §4.1](../architecture.md#41-verceljson-and-scriptspreviewts).
- `scripts/preview.ts` — local Bun server for `dist/`. Serves a file when it exists, applies the `vercel.json` rewrites, and otherwise returns `404.html` with status 404.
- Retired (removed): `wrangler.toml`, `src/worker.ts`, `worker-configuration.d.ts`.

## Behavior & edge cases

- Vercel checks the filesystem before `rewrites`, so hashed assets and `public/` files are served as themselves (HTTP 200). The rewrite `source` must not be an existing file.
- Registered routes that are not files rewrite to `/index.html` (HTTP 200): `/about`, `/articles`, `/articles/:slug` (one segment), `/projects`, `/uses`. `/` is `dist/index.html` and needs no rewrite.
- `cleanUrls` stays off (default `false`). It only strips `.html` from real HTML files. It does not create client routes, and turning it on would serve `404.html` at `/404` with HTTP 200.
- `trailingSlash` is `false`. Any path other than `/` that ends in `/` 308-redirects to the slashless path, which is then handled as usual ([trailingSlash](https://vercel.com/docs/project-configuration#trailingslash)). `/about/` ends on `/about` at HTTP 200, and the same for `/articles/`, `/articles/<slug>/`, `/projects/`, and `/uses/`. Slashless URLs are not redirected, so static files stay HTTP 200 and an unknown path with no trailing slash is still `404.html` at HTTP 404.
- `scripts/build.ts` copies `dist/index.html` to `dist/404.html`. When no file and no rewrite matches, Vercel serves that root `404.html` with HTTP 404 ([custom 404 guide](https://vercel.com/kb/guide/custom-404-page)). The body is the SPA shell and the browser URL stays the unknown path, so the client `*` route renders NotFoundPage. Rewriting the miss to `404.html` would still be HTTP 200, because a rewrite serves the static file's status. Unknown paths are not rewritten.
- Security headers (HSTS, X-Frame-Options, Referrer-Policy, COOP, Permissions-Policy, CSP, X-Content-Type-Options) are declared in `vercel.json` `headers` — the same intent formerly implemented in `src/worker.ts`.
- **`vercel.json` must be at the repo root of whatever gets deployed.** Git Integration deploys the repo root, so it applies. Deploying a built directory instead (`vercel deploy dist`) uploads a root with no `vercel.json`, silently dropping every rewrite and header — deep links 404 and the site ships with no security headers. This is why CD is Git Integration and not a CLI call on `dist/`.
- `vercel.json` also carries `buildCommand` / `installCommand` / `outputDirectory`. `outputDirectory: "dist"` is mandatory — the default for a framework-less project is `public/`, which exists here and holds only copy-along assets. The other two restate Vercel's defaults but stay explicit: since Vercel now owns the production build, the build contract belongs in a committed file rather than in dashboard settings that `vercel.json` would override anyway.
- `scripts/preview.ts` listens on port `4173` (matched by `playwright.built.config.ts`). It mirrors the trailing-slash redirect, the rewrites, and the 404 status, not the headers — so built-artifact E2E cannot prove the header block is live. `tests/e2e/production.e2e.ts` covers that against the real edge.
- Hard-refreshing `/about`, `/articles`, `/articles/:slug`, `/projects`, `/uses` must return the SPA shell at HTTP 200 so `react-router-dom` can resolve the route client-side.
- Do not reintroduce Wrangler, Cloudflare Workers Static Assets, or Pages Functions for production.

## Test plan

- **Pre-deploy smoke:** `bun run build && bun run preview` serves the built site without errors.
- **E2E:** `/`, `/about`, `/articles`, `/articles/hello-world`, `/projects`, `/uses` return 200. `/about/` 308-redirects to `/about` and the followed response is 200. `/images/avatar.jpg` returns 200. `/some-unknown-path` returns 404 and the NotFound heading is visible. `E2E_BASE_URL` points `bun run test:e2e:built` at a deployment instead of `scripts/preview.ts` (see the comment in `playwright.built.config.ts`). `*.vercel.app` previews need Deployment Protection bypass first.
- **Headers:** `bun run test:e2e:production` asserts each `vercel.json` header on the deployed origin. Nothing local can substitute. Run it against the custom domain — Deployment Protection blocks `*.vercel.app`.
- **Type check:** `bun run check` passes without `wrangler types`.

## Open questions

- Prefer Vercel Git Integration alone for production vs a GitHub Actions `vercel deploy` job? **Resolved:** Git Integration alone. Actions runs CI only. A second deploy path would race the platform's own build on every push to `master`, needs three long-lived secrets, and pulls the Vercel CLI into the lockfile (+170 packages) to do what the installed GitHub App already does. Production is gated by a GitHub required check plus a Vercel Deployment Check on that workflow (§FR-1.7.7).
