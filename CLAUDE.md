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

This repo is Jalo's personal website.

Current state: v2 redesign complete. Multi-page React 19 SPA via `react-router-dom` with six routes (`/`, `/about`, `/articles`, `/articles/:slug`, `/projects`, `/uses`). `src/pages/` holds the routed components; `src/components/` ships the LayoutShell + Header (with scaling avatar on Home) + Footer + theme toggle + the Card/SimpleLayout/Section/Prose/Container primitives. `src/content/articles/` hosts typed TSX article modules (no MDX). `scripts/dev.ts` + `scripts/build.ts` drive the Bun HTML bundler; `vercel.json` + `scripts/preview.ts` handle Vercel static hosting and local built-artifact preview. `vercel.json` has four literal rewrites (`/about`, `/articles`, `/projects`, and `/uses` to `index.html`), per-slug article HTML, and `404.html` for everything else. `.github/workflows/ci.yml` runs check + dev/built E2E on PR and push — it does not deploy; Vercel Git Integration builds and promotes `master`. See `README.md` for the user-facing summary.

## Commands

| Purpose                                        | Command                                                                                                                                       |
| ---------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Install deps (also runs `husky` via `prepare`) | `bun install`                                                                                                                                 |
| Install browser deps                           | `bun run setup:browsers` (`playwright install chromium`)                                                                                      |
| Dev server (HMR)                               | `bun run dev` (`scripts/dev.ts` + `Bun.serve`)                                                                                                |
| Production build                               | `bun run build` (`scripts/build.ts` → `dist/`)                                                                                                |
| Local built preview                            | `bun run preview` (`scripts/preview.ts` serves `dist/`)                                                                                       |
| Deploy                                         | none — Vercel Git Integration deploys `master`; break-glass is `bunx vercel --prod` from a linked checkout, only when Git Integration is down |
| Type + lint check                              | `bun run check` (`biome check && tsc --noEmit`)                                                                                               |
| Unit tests                                     | `bun test`                                                                                                                                    |
| E2E (dev server)                               | `bun run test:e2e` against `bun run dev`                                                                                                      |
| E2E (built artifact)                           | `bun run test:e2e:built` against `bun run preview`                                                                                            |
| E2E (production)                               | `bun run test:e2e:production` against `PRODUCTION_URL` or `https://moster.dev`; `VERCEL_SHARE_URL` for an SSO-protected preview               |

## Key files

- `src/pages/` — one routed component per URL (HomePage, AboutPage, ArticlesPage, ArticlePage, ProjectsPage, UsesPage, NotFoundPage). Page bodies live here, not in `src/components/`.
- `src/components/` — handwritten primitives (LayoutShell, Header, Footer, Container, Card, SimpleLayout, Section, Prose, Avatar, ThemeToggle, MobileNavigation, ArticleLayout, SocialLink, icons) plus `home/` subfolder for Resume/ArticleCard.
- `src/content/articles/index.ts` — article loader (`getAllArticles()`, `getArticleBySlug()`); each article is `src/content/articles/<slug>.tsx` exporting `meta`, `readingMinutes`, and a default component. Adding an article is two edits: drop the TSX file, register it in the `modules` record.
- `src/content/{projects,uses,resume}.ts` — typed data for the Projects, Uses, and Home-Resume surfaces.
- `src/lib/useTheme.ts` — three-state theme hook (`light` / `dark` / `system`), `localStorage["theme"]` persisted, subscribes to `prefers-color-scheme` changes when in system mode.
- `src/lib/{clsx,formatDate}.ts` — small utilities (six-liner `clsx`, Spotlight-shape `formatDate`).
- `src/styles/globals.css` — Tailwind v4 + `@plugin "@tailwindcss/typography";` + `@custom-variant dark` (class strategy) + zinc/red token block + `@theme` mapping.
- `src/index.html` — bundler entry; inline anti-flicker `<script>` in `<head>` runs synchronously before React mounts.
- `.claude/skills/changelog-generator/SKILL.md` — repo-local skill for release-note generation.
- `.claude/settings.json` — enabled plugins and Bash permission allowlist.
- `.github/CODEOWNERS` — requires `@jlvmoster` review on every PR.
- `.github/dependabot.yml` — weekly grouped Bun-ecosystem updates (open-PR limit 5); source of `Bump …` PRs like #3. PR #85 made Dependabot version-update PRs target qa, and security PRs open on master and get retargeted to qa.
- `.github/workflows/ci.yml` — single `check` job on PRs + pushes, no deploy job.
- `vercel.json` — Vercel static config (build, output `dist/`, four literal rewrites, security headers).
- `playwright.config.ts`, `playwright.built.config.ts`, `playwright.production.config.ts` — browser E2E targets for dev server, built artifact, and production acceptance checks.
- `.vercel/` — _(gitignored)_ local Vercel link metadata; do not commit.
- `README.md` — user-facing project summary (stack, quickstart, deploy flow); keep in sync when the project layout changes.
- `CHANGELOG.md` — reader-facing release notes (output of the `changelog-generator` skill); append a new dated section per release rather than rewriting prior entries.
- `.husky/` — pre-commit hook installed automatically by `prepare` on `bun install`.

## Conductor workspace layout

- This project is usually edited through Conductor, which creates separate git worktrees under a shared project directory. The shared project directory is named `website`; individual worktrees are city-named directories such as `dublin`, and future sessions may use a different city.
- Treat the current working directory / `git rev-parse --show-toplevel` as the active worktree root for commands, diffs, tests, and file edits. Do not assume the current city directory is the canonical repo root across sessions.
- When documenting workflows, writing repo-local skills, or giving run instructions, prefer relative paths from the active worktree root. Avoid hard-coded absolute paths like `/Users/jalo/Dev/Conductor/workspaces/website/<city>`; if an absolute example is unavoidable, describe it as a Conductor worktree example, not a stable path.

## Frontend conventions

- Stack: Bun + React 19 + `react-router-dom` v7 + Tailwind v4 SPA, multi-page client routing, deployed to Vercel as static files from `dist/`.
- Tailwind v4 with CSS variables defined in `src/styles/globals.css`: `--bg`, `--fg`, `--muted`, `--accent`, `--panel`, `--ring`, `--font-sans`, `--font-serif`. The `@theme` block exposes each token as a Tailwind utility (`bg-bg`, `text-fg`, `text-accent`, etc.).
- **Use the `--accent` token utility class (`text-accent`, `hover:text-accent`, `from-accent/0`)** for the brand color across hover states, active links, and links; do not hard-code palette-specific accent pairs. The accent value swaps automatically via the class-based dark mode.
- `--accent` is `#e51636` in light and `#ff4f5e` in dark.
- Class-based dark mode: `@custom-variant dark (&:where(.dark, .dark *));` is declared in `globals.css`, so `dark:` utilities key off `html.dark` (not `prefers-color-scheme`). The theme toggle owns that class.
- Theme toggle: three states (`light` / `dark` / `system`), persisted to `localStorage["theme"]`, default `system`. An inline anti-flicker `<script>` in `src/index.html` `<head>` resolves the theme synchronously before React mounts.
- System font stacks only — no hosted fonts. Sans: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif. Serif: ui-serif, Georgia, Cambria, "Times New Roman", serif. Mono: ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace.
- Prose blocks use `@tailwindcss/typography` via the `<Prose>` wrapper (`prose dark:prose-invert`). Max-width ~65ch.
- No third-party UI component libraries (no shadcn, Radix, MUI, HeadlessUI). Handwritten components in `src/components/`. The mobile-nav popover is ~80 lines of handwritten React; backdrop click + Esc keydown both close it.
- Routing: `react-router-dom` v7 with `BrowserRouter` wrap in `src/main.tsx`. In-app links use `<Link>` from `react-router-dom`; external links use plain `<a target="_blank" rel="noopener noreferrer">`. The router table lives in `src/App.tsx`.
- `<Card>` is a compound component with `.Title`, `.Description`, `.Eyebrow`, `.Cta`, and `.Link`. `Card.Link` renders react-router `<Link>` for in-app hrefs and an `<a target="_blank">` when the href starts with `http` or `mailto:`. Lift article/project/uses cards from this primitive — don't roll your own card shape.
- **Hero copy is canonical and must be preserved verbatim:** _"Hi, I'm Jalo and I'm a Software Engineer at Chick-fil-A. It's my pleasure to invite you into my portfolio."_ Lives in `src/pages/HomePage.tsx`. Do not paraphrase "my pleasure" away — it's a deliberate Chick-fil-A tie-in.
- Images live under `public/images/` and ride along via `scripts/build.ts`'s `cp public dist`. Referenced as string URLs (`/images/avatar.jpg`, `/images/portrait.jpg`, `/images/logos/<n>.svg`, `/cv.pdf`). React does not import them.
- When building or restyling UI, invoke the `frontend-design` skill before generating code. It produces distinctive, non-generic components that fit the minimal aesthetic.
- For new or redesigned UI (a new page or section, nav or mobile menu patterns, empty or error states, article layout), use the UI/UX skills on `/uses`. `src/content/uses.ts` is the source of truth: UI UX Pro Max, Taste, Impeccable, emilkowalski/skills, and Mobbin for references. Put 2-3 Mobbin reference links and the pattern chosen in the PR body. Bug fixes, cleanups, and changes required to be 0 px vs production skip this step.
- **Per-route document metadata uses React 19's native support, not `react-helmet`.** Each page in `src/pages/` renders its own `<title>` and `<meta name="description">` directly in the returned tree. React 19 deduplicates `<title>` (so the static `<title>` in `src/index.html` is the pre-hydration fallback, replaced on mount) but **does not** dedupe `<meta>` — that's why `src/index.html` ships no static `<meta name="description">`. Article detail derives its tags from `article.title` / `article.description`. Adding a new route = add a `<title>` + `<meta name="description">` at the top of the returned tree.
- Titles use `"<Page> — Jalo Moster"` (Home may be a longer one-liner; article detail uses `article.title`; 404 and article-not-found set their own).

## Testing

- **Unit / integration:** `bun test`. Files: `*.test.ts` colocated with source or under `tests/`. The smoke spec wraps `<App />` in `<MemoryRouter initialEntries={["/"]}>` (since `BrowserRouter` is mounted in `src/main.tsx`, outside `App`) and asserts the verbatim hero substring + four URLs, including the mailto.
- **Browser smoke (dev E2E):** `bun run test:e2e` runs `tests/e2e/site.e2e.ts` against `bun run dev` (wired via `playwright.config.ts`).
- **Built artifact acceptance:** `bun run test:e2e:built` runs `tests/e2e/built.e2e.ts` after `bun run build`, served through `bun run preview` (wired via `playwright.built.config.ts`).
- **Production acceptance:** `bun run test:e2e:production` runs `tests/e2e/production.e2e.ts` against `PRODUCTION_URL` or `https://moster.dev` (wired via `playwright.production.config.ts`). It owns the `vercel.json` security-header assertions — `scripts/preview.ts` applies the `vercel.json` rewrites, directory indexes, and the 404 status, but not the headers, so built E2E cannot cover them. Deployment Protection is `all_except_custom_domains`, so a `*.vercel.app` preview URL 302s to Vercel's login page unless `VERCEL_SHARE_URL` is a share link (`https://<host>/?_vercel_share=<token>`). That link is opened once in `globalSetup`, and the `_vercel_jwt` cookie is saved under gitignored `playwright/.auth/` for `use.storageState`. The token is not logged. Unset, the suite is unchanged.
  - Each fresh machine or CI worker must run `bun run setup:browsers` (`playwright install chromium`) once before the first run.
  - Keep specs thin: every route loads, hero copy verbatim on `/`, three social links and the mailto are visible, theme toggle cycles + persists, `/articles` list + detail navigation. Known routes return 200 on hard refresh; an unknown path returns 404 from preview and production, and stays 200 on the dev server. Don't snapshot the whole DOM.
- **Interactive verification during a task:** use the `mcp__plugin_playwright_playwright__*` MCP tools to drive a browser ad-hoc rather than writing throwaway specs. Per the global rule, UI changes must be exercised in a browser before being reported as complete.

## Agents and skills

Plugins enabled in `.claude/settings.json`: official marketplace plugins `claude-md-management`, `frontend-design`, `playwright`, `skill-creator`, `superpowers`, `typescript-lsp`. The `cloudflare@cloudflare` plugin and its marketplace were removed with the hosting cutover.

Built-in subagents to lean on:

- **`Explore`** — locating code under `src/`.
- **`Plan`** — before non-trivial work (new section, adding routing, switching a route from static to a Vercel Function).

Repo-local skills in `.claude/skills/`:

- **`changelog-generator`** — turns git commits in a chosen range into a reader-facing changelog (categories: New, Improvements, Fixes, Breaking; filters internal/tooling commits; defaults to no emojis to match the site's minimal aesthetic). Triggers on "changelog", "release notes", "what's new", "site updates", weekly/monthly digest asks, etc.

Skills worth authoring **only when the workflow recurs** (don't pre-build):

- `deploy-check` — chain `bun run check && bun run build && bun run test:e2e:built` as a one-shot pre-push gate. Nothing deploys locally, so there's no CLI step.

## Hard rules specific to this repo

- Never paraphrase the hero copy. "my pleasure" stays verbatim in `src/pages/HomePage.tsx`.
- Never reintroduce Cloudflare Workers or Pages hosting; hosting is Vercel.
- Never add Next.js, Vite, MDX runtime, or a third-party UI component library (shadcn, Radix, MUI, HeadlessUI). `react-router-dom`, `clsx`, and `@tailwindcss/typography` are utilities/plugins and are permitted.
- Never reintroduce media-query dark mode. Dark mode is class-based (`html.dark`); the theme toggle owns that class. The `prefers-color-scheme` media query is only consulted when the user choice is `"system"`.
- Use the `--accent` token (and the `text-accent` / `fill-accent` / `from-accent/0` utilities) for the brand color. Don't hand-write palette-specific accent pairs.
- Hosting config is `vercel.json`. Local built-artifact preview is `scripts/preview.ts` (no Wrangler).
- Never add a deploy job to `.github/workflows/ci.yml` or a `deploy` script to `package.json`. Vercel Git Integration is the single production path; a second one races it, and `vercel deploy dist` ships a deployment with no `vercel.json` (no rewrites, no security headers).
- Articles are typed TSX modules under `src/content/articles/<slug>.tsx`. No MDX, no markdown parsing, no runtime globbing. Each module exports `meta`, `readingMinutes`, and a default component. Adding an article = drop the TSX + register in `src/content/articles/index.ts`'s `modules` record.
- Never add `react-helmet` or `react-helmet-async`. Per-route `<title>` / `<meta>` go directly in the page component via React 19 native head support (see Frontend conventions).

## Git conventions

- Branch naming: `<github-username>/<feature-slug>` (e.g., `jlvmoster/website-spec`).
- Feature branches are cut from `origin/qa`. Pull requests target `qa`. A release is a `qa` -> `master` pull request.
- First push of a new branch: `git push -u origin <branch>` to set upstream.
- Pre-approved Bash (no permission prompt): `bun *`, `bunx *`, `git *`. See `.claude/settings.json`.
- Commit subject: imperative ("Add X"). Body: bullets explaining the "why". Trail with `Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>` when applicable.
