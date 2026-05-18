
Default to using Bun instead of Node.js.

- Use `bun <file>` instead of `node <file>` or `ts-node <file>`
- Use `bun test` instead of `jest` or `vitest`
- Use `bun build <file.html|file.ts|file.css>` instead of `webpack` or `esbuild`
- Use `bun install` instead of `npm install` or `yarn install` or `pnpm install`
- Use `bun run <script>` instead of `npm run <script>` or `yarn run <script>` or `pnpm run <script>`
- Use `bunx <package> <command>` instead of `npx <package> <command>`
- Bun automatically loads .env, so don't use dotenv.

## APIs

- `Bun.serve()` supports WebSockets, HTTPS, and routes. Don't use `express`.
- `bun:sqlite` for SQLite. Don't use `better-sqlite3`.
- `Bun.redis` for Redis. Don't use `ioredis`.
- `Bun.sql` for Postgres. Don't use `pg` or `postgres.js`.
- `WebSocket` is built-in. Don't use `ws`.
- Prefer `Bun.file` over `node:fs`'s readFile/writeFile
- Bun.$`ls` instead of execa.

## Testing

Use `bun test` to run tests.

```ts#index.test.ts
import { test, expect } from "bun:test";

test("hello world", () => {
  expect(1).toBe(1);
});
```

## Frontend
- Use `Bun.serve` + HTML imports for both dev and the entrypoint. **Don't use Vite, webpack, or esbuild.**
- HTML files can `<script src="./*.tsx">` and `<link href="./*.css">` directly; Bun bundles JSX/TS/CSS/Tailwind automatically.
- Run locally with `bun --hot ./scripts/dev.ts` (HMR + console forwarding).
- For full Bun API surface, read the bundled docs at `node_modules/bun-types/docs/**.mdx`.

---

# Project: moster.dev

This repo is Jalo's personal website. **The authoritative requirements doc is `docs/specs/requirements.md` — read it before any non-trivial change.** It covers the deployment model, file layout, content sections, growth path, and the resolved decisions (domain, socials, hero copy, typography).

Current state: v1 complete. `src/` ships Hero / Writing / About / Contact / Nav components, `scripts/dev.ts` + `scripts/build.ts` drive the Bun HTML bundler, `wrangler.toml` + `src/worker.ts` handle Workers + Static Assets, and `.github/workflows/ci.yml` runs check + dev/built E2E on PR and deploys on push to `master`. See `README.md` for the user-facing summary.

## Commands

| Purpose | Command |
|---|---|
| Install deps (also runs `husky` + `wrangler types` via `prepare`) | `bun install` |
| Install browser deps | `bun run setup:browsers` (`playwright install chromium`) |
| Dev server (HMR) | `bun run dev` (`scripts/dev.ts` + `Bun.serve`) |
| Production build | `bun run build` (`scripts/build.ts` → `dist/`) |
| Local Workers runtime | `bun run preview` (`wrangler dev`) |
| Deploy (break-glass only) | `bun run deploy` — prod deploys run from GitHub Actions on push to `master`, see `docs/specs/features/ci-cd.md` |
| Type + lint check | `bun run check` (`wrangler types && biome check && tsc --noEmit`) |
| Regenerate Worker types | `bunx wrangler types` |
| Unit tests | `bun test` |
| E2E (dev server) | `bun run test:e2e` against `bun run dev` |
| E2E (built artifact) | `bun run test:e2e:built` against `bun run preview` |
| E2E (production) | `bun run test:e2e:production` against `PRODUCTION_URL` or `https://moster.dev` |

## Key files
- `docs/specs/requirements.md` — authoritative requirements doc (read first).
- `docs/specs/architecture.md` — rationale, code shapes, and operational notes that back the requirements.
- `docs/specs/features/*.md` — per-feature implementation specs (Hero, Writing, About, Contact, Nav, Theming, App Shell, Worker, Build Pipeline, Tooling, Testing, CI/CD). Read the relevant one before touching a feature.
- `docs/tasks/README.md` — ordered, nine-step implementation playbook bridging the spec layer and the (still-missing) `src/` scaffold. Each task lists prereqs, steps, and a verification block. Start here when implementing.
- `.claude/skills/changelog-generator/SKILL.md` — repo-local skill for release-note generation.
- `.claude/settings.json` — enabled plugins and Bash permission allowlist.
- `.github/CODEOWNERS` — requires `@jlvmoster` review on every PR.
- `.github/dependabot.yml` — weekly grouped Bun-ecosystem updates (open-PR limit 5); source of `Bump …` PRs like #3.
- `.github/workflows/ci.yml` — single workflow with `check` (PRs + pushes) and `deploy` (push to `master`, needs `check`); canonical YAML in architecture §8.1.
- `wrangler.toml`, `src/worker.ts` — Cloudflare Workers + Static Assets config and pass-through fetch handler.
- `playwright.config.ts`, `playwright.built.config.ts`, `playwright.production.config.ts` — browser E2E targets for dev server, built artifact, and production acceptance checks.
- `worker-configuration.d.ts` — _(generated, gitignored)_ Worker runtime types, refreshed by `bunx wrangler types`.
- `README.md` — user-facing project summary (stack, quickstart, deploy flow); keep in sync when the project layout changes.
- `CHANGELOG.md` — reader-facing release notes (output of the `changelog-generator` skill); append a new dated section per release rather than rewriting prior entries.
- `.husky/` — pre-commit hook installed automatically by `prepare` on `bun install`.

## Docs conventions
- **Three layers under `docs/specs/`:** `requirements.md` is *what must be true* (every requirement has an ID like `§FR-1.2.1.a`); `architecture.md` is *why + canonical code shapes*; `features/*.md` are per-feature implementation specs that cite requirements via those §IDs.
- **Implementation playbook in `docs/tasks/`** is a separate layer: *order and gates*, not spec content. Numbered tasks (`01-…` through `09-…`) sequence the work and cite feature specs by path; they must not restate spec content. When a task is ambiguous, the spec is authoritative.
- **Feature-spec template** (used by every file under `features/`): Goal → Requirements covered → File layout → Behavior & edge cases → Test plan → Open questions. Match it when adding a new feature spec.
- **Open questions** at the bottom of each feature spec are unresolved decisions, not idle musings. Surface them (and resolve them) when implementing that feature.

## Conductor workspace layout
- This project is usually edited through Conductor, which creates separate git worktrees under a shared project directory. The shared project directory is named `website`; individual worktrees are city-named directories such as `dublin`, and future sessions may use a different city.
- Treat the current working directory / `git rev-parse --show-toplevel` as the active worktree root for commands, diffs, tests, and file edits. Do not assume the current city directory is the canonical repo root across sessions.
- When documenting workflows, writing repo-local skills, or giving run instructions, prefer relative paths from the active worktree root. Avoid hard-coded absolute paths like `/Users/jalo/Dev/Conductor/workspaces/website/<city>`; if an absolute example is unavoidable, describe it as a Conductor worktree example, not a stable path.

## Frontend conventions
- Stack: Bun + React 19 + Tailwind v4 SPA, single page, deployed to Cloudflare Workers Static Assets via Wrangler.
- Tailwind v4 with CSS variables defined in `src/styles/globals.css`: `--bg`, `--fg`, `--muted`, `--accent`, `--font-sans`, `--font-serif`.
- System font stack only — no hosted fonts. Sans/serif/mono families are listed in `docs/specs/requirements.md` §1.3.3.
- Light + dark via `prefers-color-scheme`; no toggle.
- Prose max-width ~65ch; generous line-height.
- No component libraries (no shadcn, Radix, MUI, etc.). Handwritten components in `src/components/`.
- **Hero copy is canonical and must be preserved verbatim:** *"Hi, I'm Jalo and I'm a Software Engineer at Chick-fil-A. It's my pleasure to invite you into my portfolio."* Do not paraphrase "my pleasure" away — it's a deliberate Chick-fil-A tie-in.
- When building or restyling UI, invoke the `frontend-design` skill before generating code. It produces distinctive, non-generic components that fit the minimal aesthetic.

## Testing
- **Unit / integration:** `bun test`. Files: `*.test.ts` colocated with source or under `tests/`.
- **Browser smoke (dev E2E):** `bun run test:e2e` runs `tests/e2e/site.e2e.ts` against `bun run dev` (wired via `playwright.config.ts`).
- **Built artifact acceptance:** `bun run test:e2e:built` runs `tests/e2e/built.e2e.ts` after `bun run build`, served through `wrangler dev` (wired via `playwright.built.config.ts`).
- **Production acceptance:** `bun run test:e2e:production` runs `tests/e2e/production.e2e.ts` against `PRODUCTION_URL` or `https://moster.dev` (wired via `playwright.production.config.ts`).
  - Each fresh machine or CI worker must run `bun run setup:browsers` (`playwright install chromium`) once before the first run.
  - Keep specs thin: page loads, hero copy renders, all three social links resolve, dark mode applies via `prefers-color-scheme`, Tailwind utilities are present, and SPA fallback works. Don't snapshot the whole DOM.
- **Interactive verification during a task:** use the `mcp__plugin_playwright_playwright__*` MCP tools to drive a browser ad-hoc rather than writing throwaway specs. Per the global rule, UI changes must be exercised in a browser before being reported as complete.

## Agents and skills
Plugins enabled in `.claude/settings.json`: `frontend-design`, `playwright`, `typescript-lsp`, `claude-md-management`, `skill-creator`, `superpowers`.

Built-in subagents to lean on:
- **`Explore`** — locating code under `src/` or facts in `docs/specs/requirements.md`.
- **`Plan`** — before non-trivial work (new section, adding routing, introducing MDX, switching a route from static to a Worker fetch handler).

Repo-local skills in `.claude/skills/`:
- **`changelog-generator`** — turns git commits in a chosen range into a reader-facing changelog (categories: New, Improvements, Fixes, Breaking; filters internal/tooling commits; defaults to no emojis to match the site's minimal aesthetic). Triggers on "changelog", "release notes", "what's new", "site updates", weekly/monthly digest asks, etc.

Skills worth authoring **only when the workflow recurs** (don't pre-build):
- `new-post` — scaffold an MDX file under `src/content/` with frontmatter, once the blog ships.
- `deploy-check` — chain `bunx wrangler types && bun run check && bun run build && bunx wrangler deploy --dry-run` as a one-shot pre-push gate.
- `requirements-sync` — flag a diff between `docs/specs/requirements.md` and the implemented state if requirements start drifting.

## Hard rules specific to this repo
- Never paraphrase the hero copy. "my pleasure" stays.
- Never reintroduce Pages-based hosting; the requirements doc deliberately chose Workers + Static Assets.
- Never add a component library or framework (Next.js, Vite, etc.). The requirements doc deliberately picked Bun's HTML bundler.
- Worker types (`Env`, `ExportedHandler`, `Fetcher`) come from generated `worker-configuration.d.ts` — run `bunx wrangler types` after changes to `wrangler.toml`. The file is gitignored.

## Git conventions
- Branch naming: `<github-username>/<feature-slug>` (e.g., `jlvmoster/website-spec`).
- Base branch for PRs: `origin/master`.
- First push of a new branch: `git push -u origin <branch>` to set upstream.
- Pre-approved Bash (no permission prompt): `bun *`, `bunx *`, `git *`. See `.claude/settings.json`.
- Commit subject: imperative ("Add X"). Body: bullets explaining the "why". Trail with `Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>` when applicable.
