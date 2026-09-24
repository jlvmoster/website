# Task 02 — Hosting config (Vercel)

## Goal
Stand up `vercel.json` (build/output/SPA rewrites/headers) and `scripts/preview.ts` so deep links and built-artifact E2E work.

## Specs
- [`features/hosting.md`](../specs/features/hosting.md)
- Architecture: [§4.1 vercel.json and scripts/preview.ts](../specs/architecture.md#41-verceljson-and-scriptspreviewts)

## Prereqs
- Task 01 (tooling deps installed). No hosting CLI is needed — Vercel deploys through Git Integration.

## Steps
1. **Create `vercel.json`** at repo root: `outputDirectory: "dist"` (mandatory — the framework-less default is `public/`), SPA rewrite to `/index.html`, and the security headers. See `features/hosting.md`.
2. **Create `scripts/preview.ts`** to serve `dist/` on port 4173 with SPA fallback.
3. **Wire scripts** in `package.json`: `"preview": "bun ./scripts/preview.ts"`, `"check": "biome check && tsc --noEmit"`. Do not add a `deploy` script.
4. **Do not** add `wrangler.toml`, `src/worker.ts`, or `worker-configuration.d.ts`.

## Expected outputs
- New: `vercel.json`, `scripts/preview.ts`.
- Removed/absent: Wrangler Worker entrypoints, any deploy script or deploy job.

## Verification
- `bun run build && bun run preview` serves `http://localhost:4173` without error.
- Hard-refresh `/about` against preview returns 200 and renders the About page.
- `bun run check` passes.
