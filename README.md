# moster.dev

Jalo Moster's personal website — a multi-page React SPA deployed to Vercel.

**Status:** v2 redesign complete. Multi-page Spotlight architecture (Home / About / Articles / Projects / Uses), fixed header with scaling avatar, Spotlight-style dark mode toggle, zinc + red palette, typed TS article content model, and Playwright E2E for dev, built, and production targets. Hosting migrated from Cloudflare Workers + Static Assets to Vercel.

## Stack

- **Runtime / tooling:** [Bun](https://bun.com) — package manager, dev server, HTML bundler, test runner.
- **UI:** React 19, `react-router-dom` v7 for routing, Tailwind v4 (via `bun-plugin-tailwind`) with `@tailwindcss/typography`, system font stacks only.
- **Hosting:** [Vercel](https://vercel.com) static SPA on `moster.dev`. `vercel.json` rewrites deep links to `index.html`.
- **Lint / format:** Biome. **Types:** TypeScript strict mode.
- **Testing:** `bun test` for units, `@playwright/test` for browser E2E.
- **CI/CD:** GitHub Actions runs `check` on every PR/push; Vercel Git Integration deploys `master`.

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
| `bun run preview` | Serves built `dist/` locally with SPA fallback (`scripts/preview.ts`). |
| `bun run check` | `biome check && tsc --noEmit`. |
| `bun test` | Unit / integration tests. |
| `bun run test:e2e` | Browser E2E against the Bun dev server. |
| `bun run test:e2e:built` | Browser E2E against a freshly built `dist/` served by `bun run preview`. |
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

Hard-refresh on any deep link returns 200 from Vercel via the SPA rewrite; the client router resolves the URL after mount.

## Project layout

```
src/
  index.html              # bundler entry; anti-flicker theme script in <head>
  main.tsx                # React root + BrowserRouter wrap
  App.tsx                 # LayoutShell + Routes table
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
  preview.ts              # Bun.serve of dist/ with SPA fallback
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
vercel.json               # Vercel static SPA config (rewrites + headers)
```

## Theming

The Header toggle switches between the resolved light and dark themes and persists the choice in `localStorage["theme"]`. First load defaults to `system`, so the OS preference is honored until the user chooses light or dark. An inline anti-flicker script in `src/index.html` runs synchronously before React mounts, so the right theme class lands on `<html>` before first paint — no FOUC.

Design tokens are exposed as CSS variables in `src/styles/globals.css`: `--bg`, `--fg`, `--muted`, `--accent`, `--panel`, `--ring`, `--font-sans`, `--font-serif`. Values map to a zinc base with a Chick-fil-A red accent (`#e51636` / `#ff4f5e`). The `@theme` block exposes each token as a Tailwind utility (`bg-bg`, `text-fg`, `text-accent`, etc.) so the toggle is a single `html.dark` class swap. Typography uses system font stacks only.

## Testing

- **Unit:** `bun test` — specs colocated with source or under `tests/`. The smoke spec renders `<App />` inside `<MemoryRouter initialEntries={["/"]}>` and asserts the verbatim hero substring + three social URLs.
- **Dev E2E:** `bun run test:e2e` against `bun run dev`. Coverage: every route loads, hero copy renders verbatim on `/`, theme toggle cycles + persists, footer renders on every route, SPA fallback handles unknown paths.
- **Built E2E:** `bun run test:e2e:built` builds `dist/`, serves it through `bun run preview`, and verifies SPA fallback for hard-refreshes on each deep link.
- **Production E2E:** `bun run test:e2e:production` runs the same acceptance checks against `PRODUCTION_URL` or `https://moster.dev`, plus the `vercel.json` security headers — `scripts/preview.ts` does not serve those, so this is the only place they're verified. Point it at a Vercel preview URL to check a deployment before promoting it.
- A fresh machine can recreate the full test environment with `bun install && bun run setup:browsers`.

## Deployment

Two systems, one job each:

- **GitHub Actions** runs the `check` job on every PR and push: `bun install --frozen-lockfile`, `setup:browsers`, `check`, `build`, `bun test`, `bunx playwright test`, `bun run test:e2e:built`. It never deploys.
- **Vercel Git Integration** deploys. Push to `master` → production; push to a PR branch → preview. Vercel builds from the repo root so the committed `vercel.json` (SPA rewrites + security headers) applies.

The gate is branch protection: `check` is a required status check on `master`, so nothing reaches production without green CI. No deploy credentials exist in the repo or in Actions secrets — the Vercel GitHub App authenticates. Break-glass is `bunx vercel --prod` from a `vercel link`-ed checkout.

## Docs

- [`docs/specs/requirements.md`](./docs/specs/requirements.md) — authoritative requirements (every requirement has an ID like `§FR-1.2.1.a`).
- [`docs/specs/architecture.md`](./docs/specs/architecture.md) — rationale and canonical code shapes (router config, LayoutShell, Header scroll math, theme toggle, content model, primitives, iconography).
- [`docs/specs/features/*.md`](./docs/specs/features/) — per-feature implementation specs.
- [`docs/tasks/README.md`](./docs/tasks/README.md) — 13-step implementation playbook.
- [`CLAUDE.md`](./CLAUDE.md) — conventions and hard rules for agent-driven work in this repo.

## Growth path

Designed-in but not built: `/api/contact` as a Vercel Function, `/api/og` image generation, RSS feed at `/feed.xml`, Vercel Analytics, and edge data via Vercel KV/Blob. See [`docs/specs/requirements.md` §3](./docs/specs/requirements.md).
