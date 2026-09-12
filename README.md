# moster.dev

Jalo Moster's personal website — a multi-page React SPA deployed to Cloudflare Workers with Static Assets.

**Status:** v2 redesign complete. Multi-page Spotlight architecture (Home / About / Articles / Projects / Uses), fixed header with scaling avatar, Spotlight-style dark mode toggle, zinc + red palette, typed TS article content model, and Playwright E2E for dev, built, and production targets.

## Stack

- **Runtime / tooling:** [Bun](https://bun.com) — package manager, dev server, HTML bundler, test runner.
- **UI:** React 19, `react-router-dom` v7 for routing, Tailwind v4 (via `bun-plugin-tailwind`) with `@tailwindcss/typography`, system font stacks only.
- **Hosting:** Cloudflare Workers + Static Assets (not Pages) on `moster.dev`. SPA fallback handles deep-link refreshes.
- **Lint / format:** Biome. **Types:** TypeScript strict mode + generated Worker types.
- **Testing:** `bun test` for units, `@playwright/test` for browser E2E.
- **CI/CD:** GitHub Actions — `check` on every PR/push, `deploy` on push to `master` via `cloudflare/wrangler-action@v3`.

No Vite, webpack, esbuild, Next.js, MDX, or third-party UI component libraries — the Bun HTML bundler is the entire build pipeline. `react-router-dom`, `clsx`, and `@tailwindcss/typography` are utilities/plugins and are permitted.

## Quickstart

```bash
bun install
bun run setup:browsers   # installs Playwright's Chromium (once per machine)
bun run dev              # http://localhost:3000 with HMR
```

## Scripts

| Command | What it does |
|---|---|
| `bun run dev` | Local dev server with HMR (`scripts/dev.ts` → `Bun.serve`). |
| `bun run build` | Bundles `src/index.html` to `dist/` and copies `public/` over (`scripts/build.ts`). |
| `bun run preview` | Production-equivalent Workers runtime via `wrangler dev`. |
| `bun run deploy` | `wrangler deploy` — break-glass only; prod deploys run from GitHub Actions. |
| `bun run check` | `wrangler types && biome check && tsc --noEmit`. |
| `bun test` | Unit / integration tests. |
| `bun run test:e2e` | Browser E2E against the Bun dev server. |
| `bun run test:e2e:built` | Browser E2E against a freshly built `dist/` served by `wrangler dev`. |
| `bun run test:e2e:production` | Browser E2E against `PRODUCTION_URL` or `https://moster.dev`. |
| `bun run setup:browsers` | `playwright install chromium`. |

## Routes

| Path | What |
|---|---|
| `/` | Hero (verbatim "my pleasure" copy + three socials), 4 most-recent articles, Resume timeline + Download CV. |
| `/about` | Portrait + multi-paragraph bio + social column with mailto. |
| `/articles` | Reverse-chronological list of typed TSX article modules. |
| `/articles/:slug` | Individual article rendered via `ArticleLayout` + `<Prose>` (back-arrow navigates to `/articles`). |
| `/projects` | Three-column grid of project cards (logo, title, description, external link). |
| `/uses` | Section-based list of hardware, dev tools, and productivity software. |
| `*` | Minimal NotFoundPage. |

Hard-refresh on any deep link returns 200 from Workers via the SPA fallback (`not_found_handling = "single-page-application"`); the client router resolves the URL after mount.

## Project layout

```
src/
  index.html              # bundler entry; anti-flicker theme script in <head>
  main.tsx                # React root + BrowserRouter wrap
  App.tsx                 # LayoutShell + Routes table
  worker.ts               # pass-through fetch → env.ASSETS.fetch(req)
  pages/                  # HomePage, AboutPage, ArticlesPage, ArticlePage, ProjectsPage, UsesPage, NotFoundPage
  components/             # LayoutShell, Header, Footer, Container, Card, Button, SimpleLayout, Section, Prose,
                          # Avatar, ThemeToggle, MobileNavigation, ArticleLayout, SocialLink, icons
  components/home/        # Resume, ArticleCard
  content/articles/       # index.ts (loader + types) + <slug>.tsx (typed TS modules; no MDX)
  content/                # projects.ts, uses.ts, resume.ts
  lib/                    # clsx.ts, formatDate.ts, useTheme.ts
  styles/globals.css      # Tailwind v4 + @plugin typography + zinc/red tokens + class-based dark
scripts/
  dev.ts                  # Bun.serve dev loop with HMR + SPA fallback
  build.ts                # Bun.build + public/ copy
tests/
  smoke.test.ts           # bun test — renders App in MemoryRouter, asserts hero copy + socials
  e2e/site.e2e.ts         # Playwright against bun run dev
  e2e/built.e2e.ts        # Playwright against bun run preview
  e2e/production.e2e.ts   # Playwright against moster.dev / PRODUCTION_URL
public/
  favicon.ico, robots.txt
  cv.pdf                  # referenced by Resume's "Download CV" button
  images/avatar.jpg       # Header avatar
  images/portrait.jpg     # About-page portrait
  images/logos/           # Resume + Projects company logos
docs/
  specs/                  # requirements, architecture, per-feature specs
  tasks/                  # numbered implementation playbook (01–13)
wrangler.toml             # Workers + Static Assets config
worker-configuration.d.ts # generated, gitignored
```

## Theming

The Header toggle switches between the resolved light and dark themes and persists the choice in `localStorage["theme"]`. First load defaults to `system`, so the OS preference is honored until the user chooses light or dark. An inline anti-flicker script in `src/index.html` runs synchronously before React mounts, so the right theme class lands on `<html>` before first paint — no FOUC.

Design tokens are exposed as CSS variables in `src/styles/globals.css`: `--bg`, `--fg`, `--muted`, `--accent`, `--panel`, `--ring`, `--font-sans`, `--font-serif`. Values map to a zinc base with a Chick-fil-A red accent (`#e51636` / `#ff4f5e`). The `@theme` block exposes each token as a Tailwind utility (`bg-bg`, `text-fg`, `text-accent`, etc.) so the toggle is a single `html.dark` class swap. Typography uses system font stacks only.

## Testing

- **Unit:** `bun test` — specs colocated with source or under `tests/`. The smoke spec renders `<App />` inside `<MemoryRouter initialEntries={["/"]}>` and asserts the verbatim hero substring + three social URLs.
- **Dev E2E:** `bun run test:e2e` against `bun run dev`. Coverage: every route loads, hero copy renders verbatim on `/`, theme toggle cycles + persists, footer renders on every route, SPA fallback handles unknown paths.
- **Built E2E:** `bun run test:e2e:built` builds `dist/`, serves it through `wrangler dev`, and verifies SPA fallback for hard-refreshes on each deep link.
- **Production E2E:** `bun run test:e2e:production` runs the same acceptance checks against `PRODUCTION_URL` or `https://moster.dev`.
- A fresh machine can recreate the full test environment with `bun install && bun run setup:browsers`.

## Deployment

Production deploys run automatically on push to `master`:

1. `check` job: `bun install --frozen-lockfile`, `setup:browsers`, `check`, `build`, `bun test`, `bunx playwright test`, `bun run test:e2e:built`.
2. `deploy` job (depends on `check`): builds and ships `dist/` via `cloudflare/wrangler-action@v3`.

Cloudflare credentials live as GitHub Actions secrets (`CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`) and are never committed. `bun run deploy` from a developer machine is supported as a break-glass path but is not the source of truth.

## Docs

- [`docs/specs/requirements.md`](./docs/specs/requirements.md) — authoritative requirements (every requirement has an ID like `§FR-1.2.1.a`).
- [`docs/specs/architecture.md`](./docs/specs/architecture.md) — rationale and canonical code shapes (router config, LayoutShell, Header scroll math, theme toggle, content model, primitives, iconography).
- [`docs/specs/features/*.md`](./docs/specs/features/) — per-feature implementation specs.
- [`docs/tasks/README.md`](./docs/tasks/README.md) — 13-step implementation playbook.
- [`CLAUDE.md`](./CLAUDE.md) — conventions and hard rules for agent-driven work in this repo.

## Growth path

Designed-in but not built: `/api/contact` form handler in `src/worker.ts`, `/api/og` image generation via `workers-og`, RSS feed at `/feed.xml`, per-route metadata (`react-helmet-async` or hand-rolled `<title>` updates), Cloudflare Web Analytics, and edge data via Workers KV/D1/R2. See [`docs/specs/requirements.md` §3](./docs/specs/requirements.md).
