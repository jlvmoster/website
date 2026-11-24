# moster.dev

Jalo Moster's personal website — a multi-page React SPA deployed to Vercel.

**Status:** v2 redesign complete. Multi-page Spotlight architecture (Home / About / Articles / Projects / Uses), fixed header with scaling avatar, Spotlight-style dark mode toggle, zinc + red palette, typed TS article content model, and Playwright E2E for dev, built, and production targets. Hosting migrated from Cloudflare Workers + Static Assets to Vercel.

## Stack

- **Runtime / tooling:** [Bun](https://bun.com) — package manager, dev server, HTML bundler, test runner.
- **UI:** React 19, `react-router-dom` v7 for routing, Tailwind v4 (via `bun-plugin-tailwind`) with `@tailwindcss/typography`, system font stacks only.
- **Hosting:** [Vercel](https://vercel.com) static SPA on `moster.dev`. `vercel.json` has four literal rewrites (`/about`, `/articles`, `/projects`, and `/uses` to `index.html`), per-slug article HTML, and `404.html` for everything else.
- **Lint / format:** Biome. **Types:** TypeScript strict mode.
- **Testing:** `bun test` for units, `@playwright/test` for browser E2E.
- **CI/CD:** GitHub Actions runs `check` on every pull request and push to `qa` and `master`. Feature pull requests target `qa`. A release is a `qa` -> `master` pull request; Vercel Git Integration deploys `master`.

No Vite, webpack, esbuild, Next.js, MDX, or third-party UI component libraries — the Bun HTML bundler is the entire build pipeline. `react-router-dom`, `clsx`, and `@tailwindcss/typography` are utilities/plugins and are permitted.

## Quickstart

```bash
bun install
bun run setup:browsers   # installs Playwright's Chromium (once per machine)
bun run dev              # http://localhost:3000 with HMR
```

## Scripts

| Command                       | What it does                                                                                                                                                                                             |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `bun run dev`                 | Local dev server with HMR (`scripts/dev.ts` → `Bun.serve`).                                                                                                                                              |
| `bun run build`               | Bundles `src/index.html` to `dist/` and copies `public/` over (`scripts/build.ts`).                                                                                                                      |
| `bun run preview`             | Serves built `dist/` locally (`scripts/preview.ts`): four literal rewrites (`/about`, `/articles`, `/projects`, and `/uses` to `index.html`), per-slug article HTML, and `404.html` for everything else. |
| `bun run check`               | `biome check && tsc --noEmit`.                                                                                                                                                                           |
| `bun test`                    | Unit / integration tests.                                                                                                                                                                                |
| `bun run test:e2e`            | Browser E2E against the Bun dev server.                                                                                                                                                                  |
| `bun run test:e2e:built`      | Browser E2E against a freshly built `dist/` served by `bun run preview`.                                                                                                                                 |
| `bun run test:e2e:production` | Browser E2E against `PRODUCTION_URL` or `https://moster.dev`. Set `VERCEL_SHARE_URL` to a Vercel share link to run against an SSO-protected preview.                                                     |
| `bun run setup:browsers`      | `playwright install chromium`.                                                                                                                                                                           |

## Routes

| Path              | What                                                                                                                  |
| ----------------- | --------------------------------------------------------------------------------------------------------------------- |
| `/`               | Hero (verbatim "my pleasure" copy, three socials, and mailto), 4 most-recent articles, Resume timeline + Download CV. |
| `/about`          | Portrait + multi-paragraph bio + social column with mailto.                                                           |
| `/articles`       | Reverse-chronological list of typed TSX article modules.                                                              |
| `/articles/:slug` | Individual article rendered via `ArticleLayout` + `<Prose>` (back-arrow navigates to `/articles`).                    |
| `/projects`       | Three-column grid of project cards (logo, title, description, external link).                                         |
| `/uses`           | Section-based list of hardware, AI tools, and skills & plugins.                                                       |
| `*`               | Minimal NotFoundPage.                                                                                                 |

Hard-refresh on a known route returns 200 from Vercel (`/` is `index.html`; a known `/articles/<slug>` is `articles/<slug>/index.html`; `/about`, `/articles`, `/projects`, and `/uses` rewrite to `index.html`) and the client router resolves the URL after mount. Any other path, including an unknown article slug, returns HTTP 404 with the same shell, so the in-app not-found page still renders.

## Project layout

```
src/
  index.html              # bundler entry; anti-flicker theme script in <head>
  main.tsx                # React root + BrowserRouter wrap
  App.tsx                 # LayoutShell + Routes table
  pages/                  # HomePage, AboutPage, ArticlesPage, ArticlePage, ProjectsPage, UsesPage, NotFoundPage
  components/             # LayoutShell, Header, Footer, Container, Card, SimpleLayout, Section, Prose,
                          # Avatar, ThemeToggle, MobileNavigation, ArticleLayout, SocialLink, icons
  components/home/        # Resume, ArticleCard
  content/articles/       # index.ts (loader + types) + <slug>.tsx (typed TS modules; no MDX)
  content/                # projects.ts, uses.ts, resume.ts
  lib/                    # clsx.ts, formatDate.ts, useTheme.ts
  styles/globals.css      # Tailwind v4 + @plugin typography + zinc/red tokens + class-based dark
scripts/
  dev.ts                  # Bun.serve dev loop with HMR + SPA fallback (unknown paths stay 200)
  build.ts                # Bun.build + public/ copy + dist/404.html + per-slug shells
  preview.ts              # Bun.serve of dist/: known routes 200, other paths 404
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
vercel.json               # Vercel static SPA config (rewrites + headers)
```

## Theming

The Header toggle switches between the resolved light and dark themes and persists the choice in `localStorage["theme"]`. First load defaults to `system`, so the OS preference is honored until the user chooses light or dark. An inline anti-flicker script in `src/index.html` runs synchronously before React mounts, so the right theme class lands on `<html>` before first paint — no FOUC.

Design tokens are exposed as CSS variables in `src/styles/globals.css`: `--bg`, `--fg`, `--muted`, `--accent`, `--panel`, `--ring`, `--font-sans`, `--font-serif`. Values map to a zinc base with a Chick-fil-A red accent (`#e51636` / `#ff4f5e`). The `@theme` block exposes each `--color-*` token as a Tailwind utility (`bg-bg`, `text-fg`, `text-accent`, etc.) so the toggle is a single `html.dark` class swap. `--font-sans` and `--font-serif` are `:root` variables, not exposed through `@theme`. Typography uses system font stacks only.

## Testing

- **Unit:** `bun test` — specs colocated with source or under `tests/`. The smoke spec renders `<App />` inside `<MemoryRouter initialEntries={["/"]}>` and asserts the verbatim hero substring + four URLs, including the mailto.
- **Dev E2E:** `bun run test:e2e` against `bun run dev`. Coverage: every route loads, hero copy renders verbatim on `/`, theme toggle cycles + persists. The dev server is not Vercel, so unknown paths there stay HTTP 200.
- **Built E2E:** `bun run test:e2e:built` builds `dist/`, serves it through `bun run preview`, and checks known routes return 200, a known article slug returns 200, an unknown article slug returns 404, and another unknown path returns 404 and renders the not-found page. `scripts/preview.ts` applies the `vercel.json` rewrites, directory indexes, and the 404 status; it does not send the security headers. To run the same suite against a deployment that applies `vercel.json` itself: `E2E_BASE_URL=https://<host> bun run test:e2e:built`. A `*.vercel.app` preview sits behind Deployment Protection and redirects to login until a bypass is configured.
- **Production E2E:** `bun run test:e2e:production` runs the same acceptance checks against `PRODUCTION_URL` or `https://moster.dev`, plus the `vercel.json` security headers — `scripts/preview.ts` does not serve those, so this is the only place they're verified. Deployment Protection sends `*.vercel.app` preview URLs to a login page. Set `VERCEL_SHARE_URL` to a share link (`https://<host>/?_vercel_share=<token>`) and Playwright opens it once, saves the `_vercel_jwt` cookie under gitignored `playwright/.auth/`, and reuses that state for the suite. The token is not logged. Leave the variable unset and the command behaves as before.
- A fresh machine can recreate the full test environment with `bun install && bun run setup:browsers`.

## Deployment

Two systems, one job each:

- **GitHub Actions** runs the `check` job on every pull request and push to `qa` and `master`: `bun install --frozen-lockfile`, `setup:browsers`, `check`, `build`, `bun test`, `bunx playwright test`, `bun run test:e2e:built`. Feature pull requests target `qa`. It never deploys.
- **Vercel Git Integration** deploys. Push to `master` → production; push to a PR branch → preview. Vercel builds from the repo root so the committed `vercel.json` (four literal rewrites + security headers) applies.

GitHub branch protection should require `check` before a pull request merges. Vercel does not read that ruleset: add the `check` workflow under the project's Deployment Checks or a push to the production branch promotes while CI is still running. Confirm the Production Branch is `master`. No deploy credentials exist in the repo or in Actions secrets — the Vercel GitHub App authenticates. Break-glass is `bunx vercel --prod` from a `vercel link`-ed checkout.

## Docs

- [`CLAUDE.md`](./CLAUDE.md) — conventions and hard rules for agent-driven work in this repo.

## Growth path

Designed-in but not built: `/api/contact` as a Vercel Function, `/api/og` image generation, RSS feed at `/feed.xml`, and edge data via Vercel KV/Blob.
