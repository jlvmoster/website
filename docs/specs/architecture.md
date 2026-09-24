# Personal Website — Architecture

Companion to `docs/specs/requirements.md`. Requirements answer *what must be true*; this doc answers *how* and *why* — the rationale behind the chosen stack, the concrete code shapes that satisfy the requirements, and the implementation notes that don't belong in a constraints list.

## 1. Why Vercel

The site previously shipped on Cloudflare Workers + Static Assets. The intentional platform change is to host the same Bun-built static SPA on **Vercel**.

**Fit for a static SPA.** `scripts/build.ts` already emits a complete `dist/` (HTML + hashed assets + `public/` copy). Vercel serves that directory as a static deployment with SPA rewrites — no Worker stub, no Wrangler types, no dual runtimes between Bun-local and Workers V8.

**Growth path stays open.** Requirements §1.2.4 (contact form) and growth-path items (`/api/contact`, `/api/og`, edge storage) map cleanly to Vercel serverless or Edge Functions under `/api/*` when needed. Day-1 remains static-only.

**Tradeoff vs Cloudflare Workers.** We give up Workers-specific bindings (KV/D1/R2 wired through `wrangler.toml`) and the Workers free-tier shape. In exchange we get a simpler deploy surface for a static portfolio, first-class custom-domain + HTTPS on Vercel, and a Node-compatible serverless runtime if/when dynamic routes arrive. Bun remains the local toolchain (per CLAUDE.md); production is static files from `dist/`, not a Bun server.

**Not Next.js / not Pages.** The Bun HTML bundler stays the only build pipeline (§NFR-2.1.2). Vercel is the host only — framework is `null` in `vercel.json`. Cloudflare Pages is not reintroduced.

## 2. Free tier budget

The whole personal site should fit Vercel Hobby + GitHub Actions free tier (requirements §2.2):

- **Vercel Hobby** — static bandwidth and build minutes as published for Hobby; custom domain + automatic HTTPS included.
- **GitHub Actions free tier:** unlimited minutes on public repos; 2,000 Ubuntu minutes/month on private free accounts. The workflow is intentionally small enough to fit.
- **No Cloudflare Workers free-tier ceilings** apply after cutover (those were the previous budget).

These shape a few decisions: keep the site static until a real `/api/*` need appears, and keep CI to a single `check` job. Vercel owns the deploy.

## 3. Deployment surfaces

The same project supports these runtime contexts, in this order of "production-likeness":

| Surface | Command | Runtime | Purpose |
|---|---|---|---|
| Local dev | `bun run dev` | Bun.serve + HMR | Tight feedback loop. Fastest. |
| Pre-deploy check | `bun run preview` | Bun.serve of `dist/` + SPA fallback | Sanity-check the built artifact and deep-link rewrites before pushing. |
| CI | GitHub Actions on every PR + push to `master` | `ubuntu-latest` runner | Runs `bun run check`, `bun test`, Playwright (dev + built). Merge gate. See §8.1. |
| Preview deploy | (auto, on every PR branch push) | Vercel build + edge CDN | Real platform, real `vercel.json`. Manual review only — Deployment Protection blocks automated runs against `*.vercel.app` (see `features/ci-cd.md`). |
| CD | (auto, on push to `master`) | Vercel build + edge CDN | Vercel Git Integration builds from the repo root and promotes to production. See §8.2. |
| Break-glass deploy | `bunx vercel --prod` | Vercel build from a linked checkout | Manual fallback when Git Integration is unavailable; not the default path. |
| Production | (auto, after CD) | Vercel edge CDN | What users see. |

Local `preview` does not need to emulate a remote serverless runtime while the site is static-only. When `/api/*` functions land, add a Vercel-local preview path for those handlers.

## 4. Concrete code shapes

These are the canonical implementations of the requirements that involve config or non-trivial code. Treat them as starting points — if the actual files diverge, update this doc.

### 4.1 `vercel.json` and `scripts/preview.ts`

Both are short committed files and are their own canonical form — read them rather than a copy here, which only drifts. What matters about each:

- **`vercel.json`** declares `outputDirectory: "dist"` (mandatory — the framework-less default is `public/`, which exists here but holds only copy-along assets), a catch-all `rewrites` entry to `/index.html`, and the security headers that used to live in `src/worker.ts`. Files present under the output directory are matched before rewrites apply, so hashed assets and `public/` files still win and only client routes fall through to the shell (§FR-1.4.3).
- **The file's location is load-bearing.** Vercel reads `vercel.json` from the root of whatever is deployed. Git Integration deploys the repo root, so it applies. Uploading a built directory instead (`vercel deploy dist`) produces a deployment with no `vercel.json` at its root: every rewrite and header disappears, deep links 404, and nothing in CI notices. See `features/hosting.md`.
- **`scripts/preview.ts`** is a 13-line `Bun.serve` that returns the requested file from `dist/` if it exists and `dist/index.html` otherwise. That single fallback is the entire feature; it mirrors the rewrite but *not* the headers, which is why header coverage lives in `tests/e2e/production.e2e.ts` against the real origin.

### 4.3 `scripts/build.ts` (programmatic build + public/ copy)

```ts
import { cp, rm } from "node:fs/promises";

await rm("dist", { recursive: true, force: true });

const result = await Bun.build({
  entrypoints: ["src/index.html"],
  outdir: "dist",
  minify: true,
  sourcemap: "linked",
});

if (!result.success) {
  for (const log of result.logs) console.error(log);
  process.exit(1);
}

await cp("public", "dist", { recursive: true });
```

The explicit `cp("public", "dist", …)` step is **mandatory**, not a stylistic choice. Bun's HTML bundler only emits files reachable from the HTML / CSS / JS import graph; it does **not** auto-copy a `public/` directory. Anything that has to ship without being imported — `favicon.ico`, `robots.txt`, OG images referenced only by meta tags resolved at runtime — lives in `public/` and gets copied by this step.

### 4.4 Routing & app shell

`react-router-dom` was picked because it is the conventional, well-known SPA router (vs. tiny alternatives like `wouter`), declarative, no SSR overhead, and plays cleanly with Vercel's SPA rewrite to `index.html` — the host returns the SPA shell for any non-asset path, and the client router resolves the URL after mount.

```tsx
// src/main.tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { App } from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
```

```tsx
// src/App.tsx
import { Routes, Route } from "react-router-dom";
import { LayoutShell } from "./components/LayoutShell";
import { HomePage } from "./pages/HomePage";
import { AboutPage } from "./pages/AboutPage";
import { ArticlesPage } from "./pages/ArticlesPage";
import { ArticlePage } from "./pages/ArticlePage";
import { ProjectsPage } from "./pages/ProjectsPage";
import { UsesPage } from "./pages/UsesPage";
import { NotFoundPage } from "./pages/NotFoundPage";

export function App() {
  return (
    <LayoutShell>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/articles" element={<ArticlesPage />} />
        <Route path="/articles/:slug" element={<ArticlePage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/uses" element={<UsesPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </LayoutShell>
  );
}
```

### 4.5 LayoutShell

The Spotlight visual hallmark is a fixed centered background panel that the content scrolls over. The shell is a fixed sibling layer (panel) plus a `relative` content column containing Header / main / Footer.

```tsx
// src/components/LayoutShell.tsx
import type { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";

export function LayoutShell({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="fixed inset-0 flex justify-center sm:px-8">
        <div className="flex w-full max-w-7xl lg:px-8">
          <div className="w-full bg-[var(--panel)] ring-1 ring-[var(--ring)]" />
        </div>
      </div>
      <div className="relative flex w-full flex-col">
        <Header />
        <main className="flex-auto">{children}</main>
        <Footer />
      </div>
    </>
  );
}
```

Body uses `bg-bg` (the page-behind-the-panel color, zinc-50 / zinc-950). The panel reads `--panel` and `--ring` from the token definitions in `globals.css`.

### 4.6 Container compound

```tsx
// src/components/Container.tsx
import { forwardRef, type ReactNode, type Ref } from "react";
import { clsx } from "../lib/clsx";

type ContainerProps = { children: ReactNode; className?: string };

export const ContainerOuter = forwardRef<HTMLDivElement, ContainerProps>(
  function ContainerOuter({ children, className }, ref) {
    return (
      <div ref={ref} className={clsx("sm:px-8", className)}>
        <div className="mx-auto w-full max-w-7xl lg:px-8">{children}</div>
      </div>
    );
  },
);

export const ContainerInner = forwardRef<HTMLDivElement, ContainerProps>(
  function ContainerInner({ children, className }, ref) {
    return (
      <div ref={ref} className={clsx("relative px-4 sm:px-8 lg:px-12", className)}>
        <div className="mx-auto max-w-2xl lg:max-w-5xl">{children}</div>
      </div>
    );
  },
);

export const Container = forwardRef<HTMLDivElement, ContainerProps>(
  function Container({ children, className }, ref) {
    return (
      <ContainerOuter ref={ref} className={className}>
        <ContainerInner>{children}</ContainerInner>
      </ContainerOuter>
    );
  },
);
```

`forwardRef` is load-bearing — the Header's avatar scroll math reads container offsets via a ref.

### 4.7 Header with avatar scroll

The Spotlight Header is a single component with three behaviors that toggle based on `useLocation()`:

1. **Home route (`/`)**: a large 64×64 avatar sits in the page flow above the nav pill. As the user scrolls, the avatar shrinks to 36×36 and slides into the pill. The shrink is driven by CSS custom properties (`--avatar-image-transform`, `--avatar-border-transform`, `--header-height`, `--header-mb`, `--content-offset`) set on `document.documentElement` by a `useEffect` scroll listener. React does **not** re-render on scroll.
2. **Other routes**: the avatar renders at 36×36 inside the nav pill from page mount.
3. **All routes**: desktop (≥`md`) shows a nav pill with NavLinks (About / Articles / Projects / Uses) on the right, with a theme toggle. Mobile (<`md`) shows a "Menu" button that opens a handwritten popover (no `@headlessui/react`).

The scroll math is transliterated verbatim from Spotlight `src/components/Header.tsx`. The Next-specific APIs are swapped:

- `usePathname()` → `useLocation()` from `react-router-dom`
- `next/link`'s `Link` → `react-router-dom`'s `Link`
- `next/image` → plain `<img src="/images/avatar.jpg">` (`public/` is copied to `dist/` by `scripts/build.ts` and Vercel serves `/images/avatar.jpg` from there)

Mobile popover (handwritten, not HeadlessUI) outline:
- A button toggles an `open: boolean` state.
- Backdrop: `fixed inset-0 z-50 bg-zinc-800/40 backdrop-blur-xs` with click-to-close.
- Panel: `fixed inset-x-4 top-8 z-50` rounded card with a close button.
- Close on Esc (handled by a `useEffect` keydown listener), close on backdrop click, close on NavLink click.

The "no component libraries" rule (§FR-1.3.5) is honored by writing the popover by hand — ~80 lines.

### 4.8 Theme toggle

Three-state user choice — `light` / `dark` / `system` — persisted in `localStorage["theme"]`. System mode honors `prefers-color-scheme` and subscribes to its `change` event so the page tracks the OS when the user is in system mode.

Class strategy (not media query) because the toggle has to override the OS. `globals.css` declares `@custom-variant dark (&:where(.dark, .dark *));` (Tailwind v4 idiom; lifted from Spotlight `tailwind.css`) so `dark:` utilities key off `html.dark`.

```tsx
// src/lib/useTheme.ts (canonical shape)
import { useEffect, useState } from "react";

export type ThemeChoice = "light" | "dark" | "system";

function readChoice(): ThemeChoice {
  try {
    const v = localStorage.getItem("theme");
    return v === "light" || v === "dark" || v === "system" ? v : "system";
  } catch {
    return "system";
  }
}

function applyChoice(choice: ThemeChoice) {
  const prefersDark =
    window.matchMedia("(prefers-color-scheme: dark)").matches;
  const isDark = choice === "dark" || (choice === "system" && prefersDark);
  document.documentElement.classList.toggle("dark", isDark);
}

export function useTheme() {
  const [choice, setChoice] = useState<ThemeChoice>(readChoice);
  useEffect(() => {
    try { localStorage.setItem("theme", choice); } catch {}
    applyChoice(choice);
  }, [choice]);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => { if (choice === "system") applyChoice("system"); };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [choice]);
  return [choice, setChoice] as const;
}
```

Anti-flicker: an inline `<script>` in `src/index.html` runs synchronously before React mounts. Three lines, no deps:

```html
<script>
  (function () {
    try {
      var c = localStorage.getItem("theme") || "system";
      var d = c === "dark" || (c === "system" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);
      document.documentElement.classList.toggle("dark", d);
    } catch (e) {}
  })();
</script>
```

### 4.9 Article content model

Articles are typed TS modules. Each post is `src/content/articles/<slug>.tsx` exporting `meta` (typed) and a default React component (the body). No MDX, no markdown parsing, no runtime globbing.

```ts
// src/content/articles/index.ts
import type { ComponentType } from "react";

export type ArticleMeta = {
  title: string;
  description: string;
  date: string; // "YYYY-MM-DD"
  author?: string;
};

export type ArticleWithSlug = ArticleMeta & {
  slug: string;
  Component: ComponentType;
};

import * as helloWorld from "./hello-world";

const modules: Record<string, { meta: ArticleMeta; default: ComponentType }> = {
  "hello-world": helloWorld,
};

export function getAllArticles(): ArticleWithSlug[] {
  return Object.entries(modules)
    .map(([slug, m]) => ({ slug, Component: m.default, ...m.meta }))
    .sort((a, b) => +new Date(b.date) - +new Date(a.date));
}

export function getArticleBySlug(slug: string): ArticleWithSlug | undefined {
  return getAllArticles().find((a) => a.slug === slug);
}
```

Modules are hand-registered because Bun's HTML bundler statically resolves the import graph at build time — runtime `import.meta.glob` is not available. Adding an article is two edits: drop a new TSX file and add the import + the record key. Worth the friction; the cadence is low.

### 4.10 Primitives (Card, Button, SimpleLayout, Section, Prose)

`Card` is a compound component with `.Title`, `.Description`, `.Eyebrow`, `.Cta`, and `.Link` static properties. The pattern is lifted from Spotlight `src/components/Card.tsx`. `next/link` is swapped for `react-router-dom`'s `Link`; for external URLs (`href.startsWith("http")`) the Card.Link renders a plain `<a target="_blank" rel="noopener noreferrer">`.

`Button` has primary/secondary variants and renders `<button>` when no `href` is provided. For in-app route hrefs (`/about`, `/articles/...`) it renders `react-router-dom`'s `<Link>`; for external URLs, static assets such as `/cv.pdf`, or `download` links, it renders a plain `<a>`.

`SimpleLayout` wraps About / Articles / Projects / Uses pages with a title + intro header + body in a `Container`.

`Section` (used by the Uses page) renders a left-bordered title with a right-column grid of children. Uses `useId()` for `aria-labelledby`.

`Prose` is a thin wrapper applying `prose dark:prose-invert` so article bodies pick up the `@tailwindcss/typography` plugin styles.

A small `clsx` helper at `src/lib/clsx.ts` is used by all primitives. Either pull `clsx@^2` from npm (~500 bytes) or inline a six-liner:

```ts
// src/lib/clsx.ts
export function clsx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}
```

### 4.11 Iconography

Single icon catalog at `src/components/icons.tsx` — no `@heroicons/react`, no `lucide-react`. Each icon is a named export taking `React.ComponentPropsWithoutRef<"svg">`. The catalog: `GitHubIcon`, `InstagramIcon`, `LinkedInIcon`, `XIcon`, `MailIcon`, `BriefcaseIcon`, `ArrowDownIcon`, `ArrowLeftIcon`, `SunIcon`, `MoonIcon`, `ChevronRightIcon`, `ChevronDownIcon`, `CloseIcon`, `LinkIcon`. SVG paths are copied verbatim from Spotlight `src/components/SocialIcons.tsx` and the inline `Icon` components in Spotlight's Header / Card / ArticleLayout / Projects pages.

### 4.12 Per-route document metadata

Per-route `<title>` and `<meta name="description">` are rendered directly inside the page components using React 19's native document-metadata support — *not* `react-helmet` / `react-helmet-async`. React 19 hoists `<title>`, `<meta>`, and `<link>` tags rendered in the tree into `<head>`. `<title>` is deduplicated by React 19 (only one is ever in `<head>`), so the static fallback in `src/index.html` is safely replaced on mount. `<meta>` tags are *appended* rather than deduplicated against pre-existing HTML — to avoid shipping two `<meta name="description">` per page, the static one was removed from `src/index.html`; the per-route React-rendered description is the only one.

Why no Helmet: most security headers declared in `vercel.json` (HSTS, X-Frame-Options, Permissions-Policy, COOP, Referrer-Policy, X-Content-Type-Options) cannot be set via `<meta>` at all — they're HTTP response headers. The CSP that *can* live in `<meta>` would not cover the inline anti-flicker `<script>` in `src/index.html` (which runs before any `<meta>` parses). Helmet only addresses per-route document tags, and React 19 already covers that natively.

```tsx
// src/pages/AboutPage.tsx (shape)
export function AboutPage() {
  return (
    <Container className="mt-16 sm:mt-32">
      <title>About — Jalo Moster</title>
      <meta name="description" content="…" />
      {/* page body */}
    </Container>
  );
}
```

The fallback `<title>Jalo Moster</title>` in `src/index.html` remains as a pre-hydration value (visible during the loading flash). React 19 replaces it on mount. No fallback `<meta name="description">` is shipped in `src/index.html` — React 19 always renders the per-route one, and shipping a static one alongside would yield two description tags per page (React 19 does not dedupe `<meta>` against pre-existing HTML).

Article detail (`/articles/:slug`) derives title and description from `article.title` / `article.description` (per §FR-1.2.8). Title pattern is `"<Page> — Jalo Moster"`; Home uses a longer one-line title.

Detailed spec: `docs/specs/features/document-metadata.md`.

## 5. Project structure

```
.
├── src/
│   ├── index.html          # Bun HTML entry; anti-flicker theme script in <head>
│   ├── main.tsx            # createRoot + BrowserRouter wrap
│   ├── App.tsx             # LayoutShell + Routes table
│   ├── pages/              # one .tsx per route (Home/About/Articles/Article/Projects/Uses/NotFound)
│   ├── components/         # Header, Footer, LayoutShell, Container, Card, Button, SimpleLayout, Section, Prose, Avatar, ThemeToggle, MobileNavigation, ArticleLayout, icons, home/{Resume,ArticleCard}
│   ├── content/            # articles/{index.ts, <slug>.tsx}, projects.ts, uses.ts, resume.ts
│   ├── lib/                # useTheme.ts, formatDate.ts, clsx.ts
│   └── styles/globals.css  # Tailwind v4 + @plugin typography + zinc/red tokens
├── public/                 # favicon, og-image, robots.txt, images/{avatar,portrait}.jpg, images/logos/, cv.pdf — copied into dist/
├── scripts/
│   ├── dev.ts              # Bun.serve with HMR
│   ├── build.ts            # bun build → dist/
│   └── preview.ts          # Bun.serve of dist/ with SPA fallback
├── tests/
├── docs/
│   └── specs/
│       ├── requirements.md
│       ├── architecture.md # this file
│       └── features/       # per-feature implementation specs
├── vercel.json             # Vercel static SPA config (rewrites + headers)
├── tsconfig.json
├── biome.json
├── bunfig.toml
├── package.json
└── README.md
```

This layout is what satisfies requirements §NFR-2.3.1–§NFR-2.3.4. The split between `src/` (import graph) and `public/` (copied as-is) is load-bearing — see §4.3.

## 6. Typechecking (no platform stubs)

Requirements §1.6 no longer require Cloudflare Worker type generation. `bun run check` is `biome check && tsc --noEmit`. `tsconfig.json` uses `"types": ["bun"]` plus DOM libs — nothing generated from hosting config.

## 7. Post-scaffold / cutover operational steps

These aren't in the requirements doc because they're one-time setup performed in dashboards, not code:

1. **Create a Vercel project** (Hobby) with framework `Other` / `null` and install the [Vercel GitHub App](https://github.com/apps/vercel) on `jlvmoster/website`. Git Integration is the production deploy path (§FR-1.7.3), so the link is required, not optional. Build settings come from the committed `vercel.json`, which overrides the dashboard — leave the dashboard fields empty rather than keeping a second copy that silently does nothing.
2. **Require `check` in two dashboards** (§FR-1.7.7). GitHub branch protection on `master` blocks a red pull request. Vercel → Project Settings → Deployment Checks → GitHub → the `check` workflow holds the production alias, because Vercel builds as soon as the production branch updates and does not read the GitHub ruleset. No deploy tokens.
3. **Confirm the project's Production Branch is `master`.** Now that Git Integration owns production, that setting is what decides which branch reaches users; every other branch must resolve to a preview. Check it explicitly on a freshly linked project: Vercel promotes the *first* deployment it ever builds to production regardless of branch, which makes the dashboard briefly look as though any branch deploys to production.
4. **Add custom domain `moster.dev`** in the Vercel project. Point DNS (typically apex + `www`) at Vercel per the dashboard instructions; remove the old Cloudflare Workers custom-domain binding when ready. The custom domain also matters for testing: Deployment Protection is set to `all_except_custom_domains`, so `bun run test:e2e:production` only works against `moster.dev`.
5. **`worker-configuration.d.ts` stays gitignored.** Nothing generates it. A leftover copy from the Workers era fails Biome's `noExplicitAny` if the ignore is removed.
6. **Drop a favicon and OG image into `public/`.** Anything referenced from `<link rel="icon">` or `<meta property="og:image">` lives here and rides along via the `cp public dist` step in `scripts/build.ts`.
7. **Drop avatar + portrait + logos + CV PDF into `public/`.** The Header / Home / About pages reference these via string URLs (`/images/avatar.jpg`, `/images/portrait.jpg`, `/images/logos/<n>.svg`, etc.).

## 8. CI/CD

Requirements §1.7 splits the two: GitHub Actions owns CI, Vercel Git Integration owns CD. Each system does the one thing it is already good at, and neither duplicates the other.

### 8.1 CI on GitHub Actions

One workflow at `.github/workflows/ci.yml` runs on every PR against `master` and every push to `master`:

```yaml
name: ci
on:
  pull_request:
    branches: [master]
  push:
    branches: [master]
permissions:
  contents: read
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
      - uses: oven-sh/setup-bun@v2
      - name: Cache Bun packages
        uses: actions/cache@v5
        with:
          path: ~/.bun/install/cache
          key: bun-${{ runner.os }}-${{ hashFiles('bun.lock') }}
      - name: Cache Playwright browsers
        uses: actions/cache@v5
        with:
          path: ~/.cache/ms-playwright
          key: playwright-${{ runner.os }}-${{ hashFiles('bun.lock') }}
      - run: bun install --frozen-lockfile
      - run: bun run setup:browsers
      - run: bun run check
      - run: bun run build
      - run: bun test
      - run: bunx playwright test
      - run: bunx playwright test -c playwright.built.config.ts
```

That is the whole workflow — one job, no deploy step. `GITHUB_TOKEN` is scoped to `contents: read`, which is all a checkout needs now that nothing ships from here. `actions/setup-node` is gone with Wrangler. `bun run build` runs inside `check` to catch bundler breakage before merge, and `playwright.built.config.ts` exercises the built `dist/` through `bun run preview`.

### 8.2 CD Through Vercel Git Integration

Production deploys are not in this repo. The Vercel GitHub App watches `jlvmoster/website`:

- Push to `master` → Vercel installs, runs `bun run build`, and promotes the result to production.
- Push to any other branch with an open PR → preview deployment, with the same `vercel.json` applied.
- Vercel builds from the **repo root**, which is the point: `vercel.json` is at the root, so rewrites and security headers are part of every deployment (§4.1).
- Authentication is the GitHub App. No tokens, org ids, or project ids exist in the repo or in Actions secrets (§FR-1.7.5).

GitHub branch protection stops a red pull request from merging. Vercel does not read that ruleset: it builds the production branch immediately. A Deployment Check on the `check` workflow holds the production alias until CI is green (§FR-1.7.7).

### 8.3 Why this shape

- **One production deploy path.** Two paths cannot race if there is only one. An Actions deploy job alongside Git Integration means every push to `master` kicks off two production builds whose completion order decides what users get.
- **The host builds what it serves.** Vercel reads `vercel.json` from the deployment root, so letting Vercel build from the repo root is what makes the config apply at all. Uploading a prebuilt `dist/` instead drops rewrites and headers silently (§4.1).
- **Nothing to leak and nothing to rotate.** The GitHub App replaces three long-lived Actions secrets.
- **Smaller tree.** Not depending on the Vercel CLI keeps ~170 packages out of the lockfile; `bunx vercel` still covers break-glass (§FR-1.5.4 / §FR-1.7.6).

### 8.4 Tradeoffs accepted

- **The gate is two dashboard settings, not job ordering.** With `needs: check`, an un-tested `master` push skipped the deploy. Vercel starts building immediately, and GitHub branch protection does not pause it. The Vercel Deployment Check is what holds promotion. Both settings live outside the repo. `features/ci-cd.md`'s test plan checks them.
- **Build logs live in two places.** CI output in Actions, build/deploy output in the Vercel dashboard.
- **Cache package artifacts, not `node_modules`.** Same Bun + Playwright cache shape as before.

### 8.5 Lighthouse CI (retired)

Automated post-deploy Lighthouse CI is not part of the pipeline (§FR-1.8.1). Core Web Vitals numbers in §NFR-2.5 remain design targets, not CI-asserted gates.

## 9. Sources

- [Rewrites · Vercel docs](https://vercel.com/docs/rewrites) — SPA fallback via `vercel.json`
- [vercel.json project configuration](https://vercel.com/docs/project-configuration/vercel-json)
- [Vercel for GitHub](https://vercel.com/docs/git/vercel-for-github) — the production deploy path
- [Deploying from CLI · Vercel docs](https://vercel.com/docs/cli/deploying-from-cli) — break-glass only; note `vercel deploy [path]` treats the path as the project root
- [Cache dependencies and build outputs in GitHub Actions](https://github.com/actions/cache)
- [Playwright CI docs — caching browsers](https://playwright.dev/docs/ci#caching-browsers)
- [HTML bundler · Bun docs](https://bun.com/docs/bundler/html) — clarifies that `public/` is not auto-copied
- [GitHub Actions billing & free-tier minutes · GitHub Docs](https://docs.github.com/en/billing/concepts/product-billing/github-actions)
- [oven-sh/setup-bun action](https://github.com/oven-sh/setup-bun)
- [Core Web Vitals thresholds · web.dev](https://web.dev/articles/vitals) — LCP/CLS/INP "good" cutoffs anchoring §NFR-2.5
