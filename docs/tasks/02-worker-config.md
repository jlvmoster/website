# Task 02 — Worker config & generated types

## Goal
Stand up `wrangler.toml`, the pass-through `src/worker.ts`, and run `wrangler types` so `Env` / `ExportedHandler` / `Fetcher` resolve in TypeScript.

## Source spec
- [`features/worker.md`](../specs/features/worker.md)
- Architecture: [§4.1 wrangler.toml](../specs/architecture.md#41-wranglertoml-static-only-day-1), [§4.2 worker.ts](../specs/architecture.md#42-srcworkerts-pass-through-stub), [§6 Worker type generation](../specs/architecture.md#6-worker-type-generation)
- Requirements: §FR-1.4.1–§FR-1.4.5, §FR-1.6.1–§FR-1.6.3

## Prereqs
- Task 01 (deps include `wrangler`).

## Steps

1. **Create `wrangler.toml`** at repo root using the canonical config in architecture §4.1. Leave the `[[routes]]` block commented out — it stays off until the first `/api/*` handler exists.
   - `compatibility_date` pins the Cloudflare Workers runtime semantics — it controls which version of the runtime your Worker sees, not when the file was edited. Copy the value verbatim from architecture §4.1 (`"2026-05-17"`). Only bump it when you deliberately want newer runtime behavior, and update architecture §4.1 in the same change.
2. **Create `src/worker.ts`** with the canonical pass-through handler in architecture §4.2. One expression — `return env.ASSETS.fetch(req)`. Don't add error handling or routing branches yet.
3. **Generate Worker types**: run `bunx wrangler types`. This writes `worker-configuration.d.ts` at repo root.
   - Confirm `.gitignore` still excludes it (Task 01 verified this). Do **not** commit the generated file.
4. **Update `tsconfig.json`** so `compilerOptions.types` lists both `"bun"` and `"./worker-configuration.d.ts"`. Order is irrelevant; both must be present now that the generated file exists, or `Env` resolves to `any`.
5. **Sanity check the SPA fallback line.** `wrangler.toml` must contain `not_found_handling = "single-page-application"` under `[assets]` — this is the single line that satisfies §FR-1.4.3.

## Outputs
- New: `wrangler.toml`, `src/worker.ts`.
- Generated (gitignored): `worker-configuration.d.ts`.

## Verification
- `bunx wrangler types` regenerates without error.
- `bunx tsc --noEmit` resolves `Env` and `ExportedHandler<Env>` referenced from `src/worker.ts`.
- `bun run check` (defined in Task 01) chain runs in order: types → biome → tsc.

## Open questions to surface
- None for v1 — first dynamic route triggers a revisit of `[[routes]]`.

## Notes for later tasks
- Don't add a `[[routes]]` block until a feature actually needs it. The pass-through Worker is enough on day 1; static asset requests bypass it entirely.
