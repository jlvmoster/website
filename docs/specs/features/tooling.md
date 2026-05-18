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
- §FR-1.7.1 — The same bootstrap (`bun install`, `bun run setup:browsers`, `bun run check`, `bun test`) runs in CI. CI workflow shape is owned by [`features/ci-cd.md`](./ci-cd.md), not this spec.

## File layout
- `package.json` — `scripts` block + deps + `"prepare": "husky"`.
- `.husky/pre-commit` — shell script that runs `bun run check`.
- `tsconfig.json` — already strict; ensure `types: ["bun", "./worker-configuration.d.ts"]`.
- `biome.json` — formatter + linter config.
- `bunfig.toml` — Bun-specific config; registers `bun-plugin-tailwind` under `[serve.static]`.
- `package.json` — adds `react-router-dom@^7` (runtime) and `@tailwindcss/typography@^0.5` (dev). Optionally `clsx@^2` (runtime) — see open questions.

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
      "check": "wrangler types && biome check && tsc --noEmit",
      "prepare": "husky"
    }
  }
  ```
  `"prepare"` runs automatically after `bun install`. Husky points `core.hooksPath` at `.husky/_/`, so fresh clones — including Conductor worktrees — get the pre-commit hook without writing to `.git/hooks/`. The hook itself lives at `.husky/pre-commit` and is a one-liner: `bun run check`.
- `tsconfig.json` `compilerOptions`:
  - `strict: true`, `noUncheckedIndexedAccess: true` (recommended), `noImplicitOverride: true`.
  - `jsx: "react-jsx"`, `moduleResolution: "bundler"`, `module: "Preserve"`, `target: "ESNext"`.
  - `verbatimModuleSyntax: true` — pairs with `module: "Preserve"`, Bun's modern idiomatic combination.
  - `types: ["bun", "./worker-configuration.d.ts"]` — both entries required.
  - `lib: ["ESNext", "DOM", "DOM.Iterable"]`.
- `biome.json`:
  - Enable formatter + linter with Biome's recommended ruleset (no rule overrides).
  - `files.includes`: include `**`, then negate `dist`, `.wrangler`, `worker-configuration.d.ts`, `node_modules` (Biome 2.x folder-ignore form; no trailing `/**`).
  - Formatter: 2-space indent, double quotes, trailing commas `"all"`.
- `bunfig.toml`:
  - `[serve.static] plugins = ["bun-plugin-tailwind"]` — registers Tailwind v4 with Bun's HTML bundler.
- Wrangler is installed as a dev dependency so `bunx wrangler …` works offline against the lockfile version.
- Fresh development environment bootstrap on any new machine or CI worker:
  1. `bun install`
  2. `bun run setup:browsers`
  3. `bun run check`
  4. `bun test`
  5. `bunx playwright test`
- CI must include the same browser setup step before E2E tests so it does not depend on a machine-local Playwright cache. Workflow lives at `.github/workflows/ci.yml`; see [`features/ci-cd.md`](./ci-cd.md).
- `react-router-dom` is a routing utility, not a UI/component library; it is permitted under §FR-1.3.5.
- `clsx` is a class-name utility, not a UI library; permitted. The alternative is a six-liner at `src/lib/clsx.ts`.
- `@tailwindcss/typography` is loaded CSS-first via `@plugin "@tailwindcss/typography";` in `globals.css` — no `tailwind.config.ts`.

## Test plan
- **Clean install:** `rm -rf node_modules && bun install && bun run setup:browsers && bun run check && bun test && bunx playwright test` succeeds on a fresh clone.
- **Lint guard:** introduce a known violation (e.g., unused import), confirm `biome check` flags it; revert.
- **Type guard:** introduce a type error in a component, confirm `tsc --noEmit` flags it; revert.

## Open questions
- Override any Biome recommended rules? **Resolved:** no — use the recommended ruleset as-is. Document this as the default for future agents.
- Pre-commit hook: **Resolved:** wired in Task 01 via `husky` (v9). Hook script lives at `.husky/pre-commit`; `"prepare": "husky"` installs it automatically on `bun install`. Chosen over `simple-git-hooks` because Conductor worktrees (where the user develops day-to-day) have `.git` as a file rather than a directory; `simple-git-hooks` blindly `mkdir`s `.git/hooks/` and fails silently in worktrees, while `husky` uses `core.hooksPath` and works everywhere.
- Pull `clsx@^2` (~500 bytes) or inline a six-liner at `src/lib/clsx.ts`? Default: inline (no new dep).
