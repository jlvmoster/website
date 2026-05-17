# Tooling — Implementation Spec

## Goal
The non-runtime config that makes the project install, build, lint, type-check, and run scripts uniformly.

## Requirements covered
- §FR-1.5.4 — `bun run deploy` ships `dist/` via `wrangler deploy`.
- §FR-1.5.5 — `bun run check` runs `wrangler types && biome check && tsc --noEmit`.
- §FR-1.5.6 — `bun test` runs unit tests.
- §NFR-2.1.1 — Bun is the package manager, dev server, bundler, test runner.
- §NFR-2.1.3 — Biome is the single lint + format tool.
- §NFR-2.1.4 — TypeScript strict + `react-jsx` + bundler module resolution.

## File layout
- `package.json` — `scripts` block + deps.
- `tsconfig.json` — already strict; ensure `types: ["bun", "./worker-configuration.d.ts"]`.
- `biome.json` — formatter + linter config.
- `bunfig.toml` — Bun-specific defaults (test runner, install).

## Behavior & edge cases
- `package.json` scripts (canonical):
  ```json
  {
    "scripts": {
      "dev": "bun --hot ./scripts/dev.ts",
      "build": "bun ./scripts/build.ts",
      "preview": "wrangler dev",
      "deploy": "wrangler deploy",
      "test": "bun test",
      "setup:browsers": "playwright install chromium",
      "check": "wrangler types && biome check && tsc --noEmit"
    }
  }
  ```
- `tsconfig.json` `compilerOptions`:
  - `strict: true`, `noUncheckedIndexedAccess: true` (recommended), `noImplicitOverride: true`.
  - `jsx: "react-jsx"`, `moduleResolution: "bundler"`, `module: "ESNext"`, `target: "ES2022"`.
  - `types: ["bun", "./worker-configuration.d.ts"]` — both entries required.
  - `lib: ["ES2022", "DOM", "DOM.Iterable"]`.
- `biome.json`:
  - Enable formatter + linter with Biome's recommended ruleset.
  - `files.ignore`: `dist/`, `.wrangler/`, `worker-configuration.d.ts`, `node_modules/`.
  - Formatter: 2-space indent, single quotes off (use double), trailing commas as default.
- `bunfig.toml`:
  - Defaults are fine; set explicit test root if needed (`[test] root = "."`).
- Wrangler is installed as a dev dependency so `bunx wrangler …` works offline against the lockfile version.
- Fresh development environment bootstrap on any new machine or CI worker:
  1. `bun install`
  2. `bun run setup:browsers`
  3. `bun run check`
  4. `bun test`
  5. `bunx playwright test`
- CI must include the same browser setup step before E2E tests so it does not depend on a machine-local Playwright cache.

## Test plan
- **Clean install:** `rm -rf node_modules && bun install && bun run setup:browsers && bun run check && bun test && bunx playwright test` succeeds on a fresh clone.
- **Lint guard:** introduce a known violation (e.g., unused import), confirm `biome check` flags it; revert.
- **Type guard:** introduce a type error in a component, confirm `tsc --noEmit` flags it; revert.

## Open questions
- Override any Biome recommended rules? Defaults are fine to start.
- Pre-commit hook (`lefthook` / `simple-git-hooks`) to run `bun run check` on staged files — set up now, or wait until it becomes painful?
