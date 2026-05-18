# Task 01 — Tooling & TS config

## Goal
Get `package.json` scripts, dependencies, TypeScript, Biome, and Bun configured so subsequent tasks can build, lint, type-check, and run.

## Source spec
- [`features/tooling.md`](../specs/features/tooling.md)
- Requirements: §FR-1.5.4, §FR-1.5.5, §FR-1.5.6, §NFR-2.1.1, §NFR-2.1.3, §NFR-2.1.4

## Prereqs
- None — first task.

## Steps

1. **Add runtime + dev deps** (Bun): `react`, `react-dom`, `tailwindcss`, `bun-plugin-tailwind`, `wrangler`, `@biomejs/biome`, `@types/react`, `@types/react-dom`, `husky`. Keep the existing `@playwright/test`, `@types/bun`, and `typescript`. Task 07 decides whether a DOM polyfill is needed for `bun test`; if so, it adds the dep there.
   - Use `bun add` / `bun add -d` so `bun.lock` updates. Do not introduce npm/yarn/pnpm.
2. **Rewrite `package.json` scripts** to match the canonical block in `features/tooling.md` §Behavior, and wire husky via `"prepare"`:
   ```json
   {
     "scripts": {
       "dev": "bun --hot ./scripts/dev.ts",
       "build": "bun ./scripts/build.ts",
       "preview": "wrangler dev",
       "deploy": "wrangler deploy",
       "test": "bun test",
       "setup:browsers": "playwright install chromium",
       "check": "wrangler types && biome check && tsc --noEmit",
       "prepare": "husky"
     }
   }
   ```
   `"prepare"` runs after `bun install`. Husky sets `git config --local core.hooksPath .husky/_`, so the hook is installed via git config rather than by writing to `.git/hooks/` — required for Conductor worktrees where `.git` is a file, not a directory.
   Then create the hook file `.husky/pre-commit` with a single line `bun run check`, and `chmod +x` it.
3. **Update `tsconfig.json`** — expand `compilerOptions.lib` from `["ESNext"]` to `["ESNext", "DOM", "DOM.Iterable"]`. The Bun-init defaults already provide `target: "ESNext"`, `module: "Preserve"`, `moduleResolution: "bundler"`, `jsx: "react-jsx"`, `verbatimModuleSyntax: true`, `types: ["bun"]`, plus `strict`, `noUncheckedIndexedAccess`, `noImplicitOverride` — keep them. Task 02 adds `"./worker-configuration.d.ts"` to `types` after `wrangler types` creates the file.
4. **Create `biome.json`** via `bunx biome init`, then edit: recommended ruleset (no overrides), formatter on with 2-space indent, double quotes, trailing commas `"all"`. Set `files.includes` to `["**", "!dist", "!.wrangler", "!worker-configuration.d.ts", "!node_modules"]` (Biome 2.x folder-ignore form — no trailing `/**`).
5. **Create `bunfig.toml`** registering the Tailwind v4 plugin for the HTML bundler:
   ```toml
   [serve.static]
   plugins = ["bun-plugin-tailwind"]
   ```
   Task 07 deliberately avoids a DOM polyfill, so no `[test] preload` section is needed.
6. **Delete the stub `index.ts`** at repo root left over from `bun init --empty`. The real entry is `src/index.html` (added in Task 04).
7. **Confirm `.gitignore`** already ignores `dist/`, `.wrangler/`, `worker-configuration.d.ts`, `node_modules/`. (It does as of this writing — verify only.)

## Outputs
- Updated: `package.json`, `tsconfig.json`, `bun.lock`.
- New: `biome.json`, `bunfig.toml`.
- Removed: `index.ts`.

## Verification
- `bun install` succeeds; husky's `prepare` runs cleanly (no `[ERROR]` lines).
- `bunx biome check` runs (may report zero or some format errors initially — that's fine; we only need the config to parse).
- `tsc` verification is **deferred to Task 02**: there are no `.ts`/`.tsx` files yet (`index.ts` was deleted in step 6, and `src/` doesn't exist), and TypeScript 6 emits `TS18003: No inputs were found` for both `tsc --noEmit` *and* `tsc --showConfig` at this stage. Task 02 lands `src/worker.ts` and `./worker-configuration.d.ts` and exercises the real `tsc --noEmit`.
- The pre-commit hook is installed: `.husky/pre-commit` exists, is executable, and `git config --local core.hooksPath` returns `.husky/_`. The hook itself will fail when fired until Task 02 lands `wrangler.toml` — confirm the hook *fires*, not that it succeeds.

## Open questions to surface
- Override any Biome recommended rules? **Resolved:** no — recommended ruleset, no overrides. Kept as the documented default for future agents.
- Set up a pre-commit hook now or defer? **Resolved:** wired now via `husky` v9 (`.husky/pre-commit` runs `bun run check`). `simple-git-hooks` was the original choice but fails silently in Conductor worktrees because it `mkdir`s `.git/hooks/`, and `.git` is a file in a worktree. Husky's `core.hooksPath` approach sidesteps that.
