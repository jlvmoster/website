# Task 01 — Tooling & TS config

## Goal
Get `package.json` scripts, dependencies, TypeScript, Biome, and Bun configured so subsequent tasks can build, lint, type-check, and run.

## Source spec
- [`features/tooling.md`](../specs/features/tooling.md)
- Requirements: §FR-1.5.4, §FR-1.5.5, §FR-1.5.6, §NFR-2.1.1, §NFR-2.1.3, §NFR-2.1.4

## Prereqs
- None — first task.

## Steps

1. **Add runtime + dev deps** (Bun): `react`, `react-dom`, `tailwindcss`, `@tailwindcss/cli` (or the Bun-supported Tailwind v4 entrypoint), `wrangler`, `@biomejs/biome`, `@types/react`, `@types/react-dom`. Keep the existing `@playwright/test`, `@types/bun`, and `typescript`. Task 07 decides whether a DOM polyfill is needed for `bun test`; if so, it adds the dep there.
   - Use `bun add` / `bun add -d` so `bun.lock` updates. Do not introduce npm/yarn/pnpm.
2. **Rewrite `package.json` scripts** to match the canonical block in `features/tooling.md` §Behavior:
   ```json
   {
     "dev": "bun --hot ./scripts/dev.ts",
     "build": "bun ./scripts/build.ts",
     "preview": "wrangler dev",
     "deploy": "wrangler deploy",
     "test": "bun test",
     "setup:browsers": "playwright install chromium",
     "check": "wrangler types && biome check && tsc --noEmit"
   }
   ```
3. **Update `tsconfig.json`** so `compilerOptions.types` is `["bun"]` for now. Add `"lib": ["ES2022", "DOM", "DOM.Iterable"]` if not already covered, and keep `strict`, `noUncheckedIndexedAccess`, `noImplicitOverride` on. Keep `jsx: "react-jsx"` and `moduleResolution: "bundler"`. Task 02 adds `"./worker-configuration.d.ts"` after `wrangler types` creates the file.
4. **Create `biome.json`** with the recommended ruleset, formatter on, double quotes, trailing commas, and `files.ignore` covering `dist/`, `.wrangler/`, `worker-configuration.d.ts`, `node_modules/`.
5. **Create `bunfig.toml`** — defaults are fine. Task 07 deliberately avoids a DOM polyfill, so no `[test] preload` section is needed.
6. **Delete the stub `index.ts`** at repo root left over from `bun init --empty`. The real entry is `src/index.html` (added in Task 04).
7. **Confirm `.gitignore`** already ignores `dist/`, `.wrangler/`, `worker-configuration.d.ts`, `node_modules/`. (It does as of this writing — verify only.)

## Outputs
- Updated: `package.json`, `tsconfig.json`, `bun.lock`.
- New: `biome.json`, `bunfig.toml`.
- Removed: `index.ts`.

## Verification
- `bun install` succeeds.
- `bunx biome check` runs (may report zero files initially — that's fine).
- `bunx tsc --showConfig` parses `tsconfig.json` without error. Full `tsc --noEmit` is deferred to Task 02 — at this stage there are no `.ts`/`.tsx` files yet (`index.ts` was deleted in step 6, and `src/` doesn't exist), so a bare `tsc --noEmit` emits `TS18003: No inputs were found`. (`wrangler types` also hasn't run, so `tsconfig.json` should not reference `./worker-configuration.d.ts` until Task 02.)

## Open questions to surface
- Override any Biome recommended rules? Default to "no" unless the user objects.
- Set up a pre-commit hook (`lefthook` / `simple-git-hooks`) now or defer? Default to defer.
