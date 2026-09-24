# Personal Website — Requirements

This document is the authoritative source of truth for what the implementation must satisfy. Rationale, code shapes, and operational notes live in [`architecture.md`](./architecture.md); this doc keeps only what the implementation must be true of.

## 1. Functional requirements

> **Preserved from v1 — must not be loosened:**
> - §FR-1.2.1.a Hero copy (the "my pleasure" Chick-fil-A tie-in) stays verbatim.
> - §FR-1.3.3 System-stack fonts only — no hosted fonts.
> - §NFR-2.1.2 No Next.js, no Vite, no MDX runtime.
> - §FR-1.4.x Vercel static hosting for the Bun-built SPA (`dist/`).
> - §FR-1.5.x Bun HTML bundler + scripts/build.ts copy step.
> - The Husky `.husky/pre-commit` hook stays.

### 1.1 Site shape & routing
- **FR-1.1.1** The site is a multi-page client-side React SPA. Routes are mounted by a router and rendered without a full page reload.
- **FR-1.1.2** Navigation uses a fixed Header (avatar + nav pill + theme toggle) plus a Footer (NavLinks + copyright). The Header collapses the avatar from 64px → 36px on scroll on the Home page only.
- **FR-1.1.3** Each page is a routed component under `src/pages/`; sections are subcomponents that can be lifted to their own route later without rewriting.
- **FR-1.1.4** Client-side routing uses `react-router-dom`. The router lives in `src/main.tsx`/`src/App.tsx` and routes are statically declared. (Note: the v1 wording of this ID has been flipped — routing is now in.)
- **FR-1.1.5** Routes registered with `react-router-dom`: `/`, `/about`, `/articles`, `/articles/:slug`, `/projects`, `/uses`. A wildcard route renders a minimal NotFoundPage.
- **FR-1.1.6** Deep links to any route serve the SPA shell via Vercel rewrites to `index.html` (§FR-1.4.3) and react-router resolves the route client-side.
- **FR-1.1.7** Navigation between routes does not trigger a full document load. In-app links use `Link` from `react-router-dom`; external links use plain `<a target="_blank" rel="noopener noreferrer">`.
- **FR-1.1.8** The Header is fixed across all routes. Home (`/`) shows a large avatar that scales from 64px to 36px on scroll; other routes show the avatar at 36px from page load.
- **FR-1.1.9** The Footer is present across all routes and contains NavLinks for About / Articles / Projects / Uses plus a copyright line.

### 1.2 Pages & content (v1)
- **FR-1.2.1 Hero** — renders on the Home page only. Shows the user's name, one-line bio, and primary links.
  - **FR-1.2.1.a** Hero copy must appear *verbatim*: *"Hi, I'm Jalo and I'm a Software Engineer at Chick-fil-A. It's my pleasure to invite you into my portfolio."* The phrase "my pleasure" must not be paraphrased or removed.
  - **FR-1.2.1.b** Hero exposes three social links, each opening the correct destination:
    - GitHub → `https://github.com/jlvmoster`
    - Instagram → `https://instagram.com/jlvmoster`
    - LinkedIn → `https://linkedin.com/in/jlvmoster`
- **FR-1.2.2 Articles** — `/articles` lists articles in reverse-chronological order using the Card compound. `/articles/:slug` renders an individual article using SimpleLayout + Prose. If zero articles exist, the list page renders an empty-state line; v2 ships with at least one placeholder article.
- **FR-1.2.3 About** — `/about` renders a two-column layout: portrait image (left on desktop) + prose biography + a social links column. Prose blocks remain capped at ~65ch (§FR-1.3.4).
- **FR-1.2.4 Contact** — A `mailto:jalo@moster.dev` link appears in the About-page social column. The mailto can later be swapped for a `/api/contact` form (§GP-3.2) without restructuring the About layout.
- **FR-1.2.5 Home page** — `/` renders Hero (per §FR-1.2.1.a/b) + a two-column body (left: 4 most-recent article cards; right: Resume timeline with a "Download CV" button). No newsletter signup.
- **FR-1.2.6 Projects page** — `/projects` renders a SimpleLayout title + intro and a three-column grid of project cards. Each project has `{ name, description, link: { href, label }, logo }`. Source list at `src/content/projects.ts`.
- **FR-1.2.7 Uses page** — `/uses` renders a SimpleLayout + multiple `<Section title="…">` blocks. Each Section contains a list of `<Tool>` items with `{ title, href?, description }`. Source list at `src/content/uses.ts`.
- **FR-1.2.8 Articles content model** — Articles are typed TS modules under `src/content/articles/<slug>.tsx`. Each module exports `meta: ArticleMeta` (`{ title, description, date, author? }`) and a default React component. A loader (`getAllArticles()`) in `src/content/articles/index.ts` returns the union sorted by `meta.date` descending. No MDX, no markdown parsing, no `fast-glob` runtime.
- **FR-1.2.9 Per-route document metadata** — Each routed page renders its own `<title>` and `<meta name="description">` via React 19's native document-metadata support (no `react-helmet`, no `react-helmet-async`). The static `<title>` and description in `src/index.html` remain only as a pre-hydration fallback; React 19 deduplicates the head tag on mount.
  - **FR-1.2.9.a** Per-route titles use the pattern `"<Page> — Jalo Moster"`; the Home route may use a longer one-line title.
  - **FR-1.2.9.b** Article detail (`/articles/:slug`) sets the title from `article.title` and the description from `article.description` (per §FR-1.2.8). The "article not found" fallback sets its own title.
  - **FR-1.2.9.c** The 404 route sets its own title and description.

### 1.3 Styling and theming
- **FR-1.3.1** Light and dark color schemes are user-controllable via a Header theme toggle that switches between the resolved light and dark themes. System mode honors `prefers-color-scheme` by default on first load (no stored value). Preference is persisted in `localStorage` under key `theme`. An inline anti-flicker script in `src/index.html` reads `localStorage` and the media query synchronously before React mounts to avoid an FOUC.
- **FR-1.3.2** Design tokens are exposed as CSS variables: `--bg`, `--fg`, `--muted`, `--accent`, `--font-sans`, `--font-serif`.
  - Token values map to a zinc base with Chick-fil-A red accents: `--bg` = zinc-50 / zinc-950, `--fg` = zinc-900 / zinc-200, `--muted` = zinc-600 / zinc-400, `--accent` = `#e51636` / `#ff4f5e`. Two additional tokens model the Spotlight panel chrome — see §FR-1.3.6.
- **FR-1.3.3** Typography uses system stacks only — no hosted fonts.
  - Sans: `ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`
  - Serif: `ui-serif, Georgia, Cambria, "Times New Roman", serif`
  - Mono: `ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace`
- **FR-1.3.4** Prose blocks are capped at ~65ch with generous line-height.
- **FR-1.3.5** No third-party component library (shadcn, Radix, MUI, etc.) is introduced.
- **FR-1.3.6** Two additional CSS tokens model the Spotlight panel chrome: `--panel` (the fixed centered background card; near-white in light, zinc-900 in dark) and `--ring` (the panel ring color; zinc-100 in light, zinc-300 at 20% opacity in dark).
- **FR-1.3.7** Prose blocks use the `@tailwindcss/typography` plugin (loaded CSS-first via `@plugin "@tailwindcss/typography";` in `globals.css`) wrapped by a `<Prose>` component that applies `prose dark:prose-invert`.
- **FR-1.3.8** The Header's avatar scroll effect is implemented in vanilla JS via a `useEffect` on the Home route that sets CSS custom properties (`--avatar-image-transform`, `--avatar-border-transform`, `--header-height`, `--header-mb`, `--content-offset`) on `document.documentElement` in response to scroll/resize events. React does not re-render on scroll.

### 1.4 Deployment
- **FR-1.4.1** The site deploys to Vercel as a static SPA built from `dist/` (not Cloudflare Workers, not Cloudflare Pages, not Next.js).
- **FR-1.4.2** Hosting configuration lives in `vercel.json` (build command, output directory, SPA rewrites, security headers). There is no Worker entrypoint.
- **FR-1.4.3** SPA fallback is enabled: unknown paths rewrite to `index.html` so client routes resolve after mount.
- **FR-1.4.4** The site is served from the custom domain `moster.dev` with automatic HTTPS (configured in the Vercel project after DNS cutover).
- **FR-1.4.5** Future dynamic routes (contact form, OG images, RSS) use Vercel serverless or Edge Functions under `/api/*`, not a Cloudflare Worker.

### 1.5 Build and dev loop
- **FR-1.5.1** `bun run dev` starts a local server via `Bun.serve` with HMR (`scripts/dev.ts`).
- **FR-1.5.2** `bun run build` invokes `scripts/build.ts`, which calls `Bun.build()` on `src/index.html`, writes to `dist/`, and then copies `public/` → `dist/` (the HTML bundler does not auto-copy `public/`).
- **FR-1.5.3** `bun run preview` serves the built `dist/` locally via `scripts/preview.ts` (`Bun.serve` + SPA fallback), matching production rewrite semantics for deep links.
- **FR-1.5.4** There is no committed deploy script. Vercel owns the production build, so break-glass is `bunx vercel --prod` from a `vercel link`-ed checkout.
- **FR-1.5.5** `bun run check` runs `biome check && tsc --noEmit`.
- **FR-1.5.6** `bun test` runs unit tests.
- **FR-1.5.7** `scripts/build.ts` and `scripts/dev.ts` continue to copy `public/` → `dist/` so `public/images/{avatar,portrait}.jpg`, `public/images/logos/`, and `public/cv.pdf` ride along to production.

### 1.6 Platform types
- **FR-1.6.1** No platform-generated Worker/runtime type stubs are required. TypeScript uses Bun + DOM lib types only (`tsconfig.json` `"types": ["bun"]`).

### 1.7 CI/CD
- **FR-1.7.1** Every pull request against `master` and every push to `master` triggers an automated CI run that executes `bun install --frozen-lockfile`, `bun run setup:browsers`, `bun run check`, `bun run build`, `bun test`, `bunx playwright test`, and `bunx playwright test -c playwright.built.config.ts`. A PR cannot merge until CI is green.
- **FR-1.7.2** Pushes to `master` deploy to production automatically. Production releases must not require an interactive deploy from a developer's machine.
- **FR-1.7.3** There is exactly one production deploy path: Vercel Git Integration (the Vercel GitHub App), which builds from the repo root so `vercel.json` applies. GitHub Actions runs CI only — the workflow has no deploy job.
- **FR-1.7.4** Workflow definitions live under `.github/workflows/` and are committed.
- **FR-1.7.5** No deploy credentials exist in the repository or in GitHub Actions secrets. Git Integration authenticates through the Vercel GitHub App.
- **FR-1.7.6** Manual `bunx vercel --prod` (§FR-1.5.4) remains available as break-glass but is not the production source of truth.
- **FR-1.7.7** The `check` job is a required status check on `master` (GitHub branch protection). Because CD is owned by the host, that gate — not workflow job ordering — is what keeps un-tested commits out of production.

### 1.8 Performance monitoring
- **FR-1.8.1** Automated Lighthouse CI is not part of the pipeline. There is no post-deploy or scheduled Lighthouse job, no `lighthouserc.json`, and no upload to an LHCI Server.

## 2. Non-functional requirements

### 2.1 Tooling constraints
- **NFR-2.1.1** All local tooling is Bun: package manager, dev server, bundler, test runner.
- **NFR-2.1.2** No Vite, webpack, esbuild, or Next.js — the Bun HTML bundler is the only build pipeline.
- **NFR-2.1.3** Linting and formatting use Biome (single tool).
- **NFR-2.1.4** TypeScript is in strict mode with `react-jsx` and bundler resolution.

### 2.2 Hosting and cost
- **NFR-2.2.1** Hosting must stay within Vercel's Hobby (free) tier for a personal static site where possible (bandwidth and build minutes as published by Vercel). No Cloudflare Workers free-tier ceilings apply after cutover.
- **NFR-2.2.2** No paid third-party services are introduced for v1 beyond what Hobby covers.
- **NFR-2.2.3** CI/CD stays within GitHub Actions' free tier where possible (unlimited minutes on public repos; 2,000 Ubuntu minutes/month on private free). Production hosting is on Vercel Hobby.

### 2.3 Project layout
- **NFR-2.3.1** Source lives under `src/` with subdirectories `components/`, `content/`, `lib/`, `styles/`, plus the entry files `index.html`, `main.tsx`, and `App.tsx`.
- **NFR-2.3.2** Static assets that are not part of the bundler import graph live under `public/`.
- **NFR-2.3.3** Build/dev entry scripts live under `scripts/` (`dev.ts`, `build.ts`, `preview.ts`).
- **NFR-2.3.4** `dist/` and `.vercel/` are gitignored.

### 2.4 Quality gates
- **NFR-2.4.1** At least one smoke test exists under `tests/` (per the build checklist).
- **NFR-2.4.2** Browser smoke E2E specs live under `tests/e2e/` and run with `bunx playwright test` against `bun run dev`.
- **NFR-2.4.3** E2E coverage minimum: every route loads (page-load + hard-refresh deep link), hero copy renders verbatim on `/`, all three social links resolve on `/` and `/about`, theme toggle cycles and persists across reload, portrait image renders on `/about`, footer renders on every route, SPA fallback handles unknown paths.
- **NFR-2.4.4** A fresh machine or CI worker can fully recreate the test environment with `bun install && bun run setup:browsers`; E2E must not depend on a pre-existing Playwright browser cache.

### 2.5 Performance budgets
These are design targets, not CI-asserted gates (automated Lighthouse CI was retired with the LHCI server).
- **NFR-2.5.1** Largest Contentful Paint (LCP) ≤ 2500 ms on representative routes — Core Web Vitals "good" threshold.
- **NFR-2.5.2** Cumulative Layout Shift (CLS) ≤ 0.1 on representative routes — Core Web Vitals "good" threshold.
- **NFR-2.5.3** Total Blocking Time (TBT) ≤ 200 ms (lab-only signal; the production constraint is INP).
- **NFR-2.5.4** Lighthouse `categories:performance` score ≥ 0.9 on representative routes.

## 3. Growth path (designed-in, not built)

These are not v1 requirements; the architecture must leave room for them without restructuring.
- **GP-3.1** Blog with MDX — deferred (currently using typed TSX modules per §FR-1.2.8 instead of MDX).
- **GP-3.2** Contact form / newsletter: `/api/contact` as a Vercel serverless or Edge Function using Resend or Loops.
- **GP-3.3** OG image generation: `/api/og` as a Vercel Edge Function.
- **GP-3.4** CMS: Tina or markdown-via-PR. Deferred.
- **GP-3.5** Analytics: Vercel Analytics (or equivalent) snippet.
- **GP-3.6** Edge data: Vercel KV / Blob (or similar) when dynamic features need persistence.
- **GP-3.7** RSS feed: `/feed.xml` generated at build time or via a small `/api/feed` function reading the same article loader.
- **GP-3.8** Per-route metadata — *implemented in v2 via React 19 native `<title>` / `<meta>` (see §FR-1.2.9). No external library was added.*

## 4. Out of scope (v1)

Auth, database, comments, search, i18n, custom font hosting, MDX runtime, image optimization pipeline, newsletter signup, blog comments, third-party article fetching, Speaking page. Each must have a clean future-extension point but is explicitly not delivered in v2.

## 5. Resolved inputs

| Decision | Value |
|---|---|
| Domain | `moster.dev` |
| GitHub handle | `jlvmoster` |
| Instagram handle | `jlvmoster` |
| LinkedIn handle | `jlvmoster` |
| Contact email | `jalo@moster.dev` |
| Hero copy | "Hi, I'm Jalo and I'm a Software Engineer at Chick-fil-A. It's my pleasure to invite you into my portfolio." |
| Typography | System stack only |
| Hosting | Vercel (static SPA from Bun `dist/`) |
| Theme toggle | Spotlight-style light/dark switch; persisted in `localStorage["theme"]`; default `system` |
| CI / CD | GitHub Actions for CI; Vercel Git Integration for CD |
| Avatar image | `public/images/avatar.jpg` |
| Portrait image | `public/images/portrait.jpg` |
| Color palette | Zinc + Chick-fil-A red accent |

## 6. Acceptance criteria (v2 done)

The v2 release is complete when *all* of the following hold:
- [ ] `bun install && bun run setup:browsers && bun run build` produces a `dist/` containing `index.html`, hashed JS/CSS assets, and the contents of `public/` (including `public/images/` and `public/cv.pdf`).
- [ ] `bun run dev` serves the site locally with HMR.
- [ ] `bun run preview` serves the built site from `dist/` with SPA fallback.
- [ ] Vercel builds and promotes `master` automatically; `moster.dev` resolves over HTTPS and returns the SPA (after DNS cutover).
- [ ] `bun run test:e2e:production` passes, including the `vercel.json` security headers — the only proof that the hosting config is live.
- [ ] `bun run check` passes (biome + `tsc --noEmit`).
- [ ] `bun test` passes; smoke test asserts the verbatim hero substring.
- [ ] Playwright E2E suite passes the minimum coverage (§NFR-2.4.3).
- [ ] All six routes load: `/`, `/about`, `/articles`, `/articles/:slug`, `/projects`, `/uses`.
- [ ] Hard-refresh on any deep link (`/about`, `/articles`, `/projects`, `/uses`) returns 200 via Vercel SPA rewrite.
- [ ] Hero copy matches §1.2.1.a verbatim on `/`; the three social links in §1.2.1.b each open the correct URL on `/` and `/about`.
- [ ] Theme toggle switches light ↔ dark; `html.dark` flips appropriately and `localStorage["theme"]` persists across reload.
- [ ] Avatar is present in the Header on every route. On `/` the avatar starts at 64px and scales to 36px on scroll.
- [ ] Articles list renders ≥ 1 article card; clicking it loads `/articles/<slug>`.
- [ ] About page renders the portrait image at `/images/portrait.jpg` and the mailto link.
- [ ] Footer renders on every route.
- [ ] Each route swaps `document.title` to its own value per §FR-1.2.9 (e.g., visiting `/about` updates the tab title to "About — Jalo Moster").
- [ ] On a fresh PR, GitHub Actions runs `check`, `bun test`, and Playwright and reports green. `check` is a required status check on `master`, and a push to `master` produces a Vercel production deploy.
