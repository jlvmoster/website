# Task 02 — Hosting config (Vercel)

> Historical playbook note: this task originally stood up Cloudflare Workers + Wrangler types. The site now hosts on Vercel; follow [`features/hosting.md`](../specs/features/hosting.md) and architecture §4.1–§4.2 instead of Wrangler.

## Goal
Stand up `vercel.json` (build/output/SPA rewrites/headers) and `scripts/preview.ts` so deep links and built-artifact E2E work without Cloudflare Workers.

## Specs
- [`features/hosting.md`](../specs/features/hosting.md)
- Architecture: [§4.1 vercel.json](../specs/architecture.md#41-verceljson-static-spa), [§4.2 preview.ts](../specs/architecture.md#42-scriptspreviewts-local-built-artifact-server)

## Prereqs
- Task 01 (deps include tooling; Vercel CLI is a later/devDependency).

## Steps
1. **Create `vercel.json`** at repo root using the canonical config in architecture §4.1 (`framework: null`, `buildCommand: bun run build`, `outputDirectory: dist`, SPA rewrite to `/index.html`, security headers).
2. **Create `scripts/preview.ts`** to serve `dist/` on port 4173 with SPA fallback for extensionless paths.
3. **Wire scripts** in `package.json`: `"preview": "bun ./scripts/preview.ts"`, `"deploy": "vercel deploy --prod"`, `"check": "biome check && tsc --noEmit"` (no `wrangler types`).
4. **Do not** add `wrangler.toml`, `src/worker.ts`, or `worker-configuration.d.ts`.

## Expected outputs
- New: `vercel.json`, `scripts/preview.ts`.
- Removed/absent: Wrangler Worker entrypoints.

## Verification
- `bun run build && bun run preview` serves `http://localhost:4173` without error.
- Hard-refresh `/about` against preview returns 200 and renders the About page.
- `bun run check` passes without Wrangler.
