# Personal Website — Architecture

Companion to `docs/specs/requirements.md`. Requirements answer *what must be true*; this doc answers *how* and *why* — the rationale behind the chosen stack, the concrete code shapes that satisfy the requirements, and the implementation notes that don't belong in a constraints list.

## 1. Why Cloudflare Workers + Static Assets

Two paths could host the v1 site cheaply: Cloudflare Workers (with Static Assets) or Cloudflare Pages. We picked Workers.

**Cloudflare's own guidance.** As of 2026, the Cloudflare docs explicitly steer new projects to Workers + Static Assets and treat Pages as the legacy path. Pages isn't deprecated, but it isn't where new features land.

**Cleaner growth story.** Requirements §1.2.4 (contact form) and the growth-path items (`/api/contact`, `/api/og`, edge KV/D1/R2) all imply we'll add dynamic code eventually. On Workers that means adding a branch to `src/worker.ts` — same project, same `wrangler.toml`, same `wrangler deploy`. On Pages it would mean introducing a separate "Functions" concept with its own conventions. Workers collapses static + dynamic + cron + KV + bindings into one config file.

**Tradeoff vs Vercel.** The thing we give up by choosing Workers over Vercel is the Node-compatible serverless runtime. Dynamic code on Workers runs in the V8 Workers runtime, not Node — so a `Bun.serve` server cannot be deployed as-is. Bun remains the local toolchain (per CLAUDE.md), but server code that ships to prod has to be written against the Workers `fetch` handler API. In exchange we get a single deployment surface, no static-vs-functions split, and a free tier that comfortably covers a personal site.

## 2. Free tier budget

The whole v1 has to fit inside Cloudflare's free tier (requirements §2.2). The relevant ceilings:

- **Unlimited bandwidth and unlimited static-asset requests** — no credit card required.
- **100,000 dynamic Worker requests per day.** Only counts when server-side code runs; static asset responses are free.
- **GitHub Actions free tier:** unlimited minutes on public repos; 2,000 Ubuntu minutes/month on private free accounts. The v1 workflow is intentionally small enough to fit.
- **20,000-file limit per deployment.**
- **Custom domain + automatic HTTPS** included.

These shape a few decisions: we don't worry about asset cache headers for v1 (bandwidth is free), and we don't need to optimize file count (we're nowhere near 20K).

## 3. Deployment surfaces

The same project supports four runtime contexts, in this order of "production-likeness":

| Surface | Command | Runtime | Purpose |
|---|---|---|---|
| Local dev | `bun run dev` | Bun.serve + HMR | Tight feedback loop. Fastest. |
| Pre-deploy check | `bun run preview` | `wrangler dev` (Workers V8 runtime locally) | Sanity-check anything Worker-shaped before pushing. |
| CI | GitHub Actions on every PR + push to `master` | `ubuntu-latest` runner | Runs `bun run check`, `bun test`, `bunx playwright test`. Merge gate. See §8.1. |
| CD | GitHub Actions deploy job on push to `master` | `ubuntu-latest` runner + `cloudflare/wrangler-action@v3` | Runs after CI passes, builds `dist/`, then deploys with Wrangler. See §8.2. |
| Break-glass deploy | `bun run deploy` | Local Bun bundler → `wrangler deploy` | Manual fallback when GitHub Actions is unavailable; not the default path. |
| Production | (auto, after CD) | Cloudflare Workers + Static Assets edge | What users see. |

`wrangler dev` matters because Bun.serve and Workers are *not* the same runtime. If a future `/api/og` branch uses a Workers-only API, only `wrangler dev` will catch it locally.

## 4. Concrete code shapes

These are the canonical implementations of the requirements that involve config or non-trivial code. Treat them as starting points — if the actual files diverge, update this doc.

### 4.1 `wrangler.toml` (static-only, day 1)

```toml
name = "personal-site"
main = "src/worker.ts"
compatibility_date = "2026-05-17"

[assets]
directory = "./dist"
binding = "ASSETS"
not_found_handling = "single-page-application"  # serves index.html for unknown paths → SPA routes work

[vars]
# env vars here later

# When you add a Worker fetch handler (forms, API, OG images), uncomment:
# [[routes]]
# pattern = "moster.dev/api/*"
# zone_name = "moster.dev"
```

The `not_found_handling = "single-page-application"` setting is what makes requirements §FR-1.4.3 work — it's a single line in config, no Worker code needed.

### 4.2 `src/worker.ts` (pass-through stub)

```ts
export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    return env.ASSETS.fetch(req);
  },
} satisfies ExportedHandler<Env>;
```

This costs nothing — asset requests are free, and the Worker only runs when the request would otherwise miss the asset binding. The point of having the stub from day 1 (rather than adding it when we need dynamic routes) is that *the deployment shape never has to change*. Adding `/api/contact` later is one new `if` branch, not a deploy reconfiguration.

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

`react-router-dom` was picked because it is the conventional, well-known SPA router (vs. tiny alternatives like `wouter`), declarative, no SSR overhead, and plays cleanly with the Workers `not_found_handling = "single-page-application"` setting — Workers returns `index.html` for any non-asset path, and the client router resolves the URL after mount.

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
- `next/image` → plain `<img src="/images/avatar.jpg">` (`public/` is copied to `dist/` by `scripts/build.ts` and Workers serves `/images/avatar.jpg` from there)

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

Why no Helmet: most security headers in `src/worker.ts` (HSTS, X-Frame-Options, Permissions-Policy, COOP, Referrer-Policy, X-Content-Type-Options) cannot be set via `<meta>` at all — they're HTTP response headers. The CSP that *can* live in `<meta>` would not cover the inline anti-flicker `<script>` in `src/index.html` (which runs before any `<meta>` parses). Helmet only addresses per-route document tags, and React 19 already covers that natively.

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
│   ├── worker.ts           # Workers fetch handler (pass-through today)
│   ├── pages/              # one .tsx per route (Home/About/Articles/Article/Projects/Uses/NotFound)
│   ├── components/         # Header, Footer, LayoutShell, Container, Card, Button, SimpleLayout, Section, Prose, Avatar, ThemeToggle, MobileNavigation, ArticleLayout, icons, home/{Resume,ArticleCard}
│   ├── content/            # articles/{index.ts, <slug>.tsx}, projects.ts, uses.ts, resume.ts
│   ├── lib/                # useTheme.ts, formatDate.ts, clsx.ts
│   └── styles/globals.css  # Tailwind v4 + @plugin typography + zinc/red tokens
├── public/                 # favicon, og-image, robots.txt, images/{avatar,portrait}.jpg, images/logos/, cv.pdf — copied into dist/
├── scripts/
│   ├── dev.ts              # Bun.serve with HMR
│   └── build.ts            # bun build → dist/
├── tests/
├── docs/
│   └── specs/
│       ├── requirements.md
│       ├── architecture.md # this file
│       └── features/       # per-feature implementation specs
├── tsconfig.json
├── biome.json
├── bunfig.toml
├── wrangler.toml
├── package.json
└── README.md
```

This layout is what satisfies requirements §NFR-2.3.1–§NFR-2.3.4. The split between `src/` (import graph) and `public/` (copied as-is) is load-bearing — see §4.3.

## 6. Worker type generation

Requirements §1.6 says `wrangler types` runs as part of `bun run check`. Some context for why:

- The `Env`, `ExportedHandler`, and `Fetcher` types referenced in `src/worker.ts` are **not** in `@cloudflare/workers-types` or any package — they are generated from `wrangler.toml` by `wrangler types`. The output goes to `worker-configuration.d.ts`.
- The generated file reflects the current bindings (`ASSETS`, `[vars]`, any future KV/D1/R2). If `wrangler.toml` changes and `wrangler types` doesn't re-run, the TypeScript types lie.
- Because the file is binding-shape-dependent, it's gitignored. Anyone cloning the repo runs `bunx wrangler types` before their first `tsc`.
- `tsconfig.json` references it via `"types": ["bun", "./worker-configuration.d.ts"]` so the generated declarations are picked up.

The check command order (`wrangler types && biome check && tsc --noEmit`) matters — regenerate first, then lint, then typecheck.

## 7. Post-scaffold operational steps

These aren't in the requirements doc because they're one-time setup performed in dashboards, not code:

1. **Create Cloudflare deploy credentials for GitHub Actions.** Required by §FR-1.7.2. In Cloudflare, create a scoped API token with Workers deploy permissions for this account/project. In GitHub repo settings, add `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` as Actions secrets. Do not commit either value.
2. **Add custom domain `moster.dev`** in the Cloudflare dashboard. SSL/HTTPS is automatic once the zone is attached.
3. **Drop a favicon and OG image into `public/`.** Anything referenced from `<link rel="icon">` or `<meta property="og:image">` lives here and rides along via the `cp public dist` step in `scripts/build.ts`.
4. **Drop avatar + portrait + logos + CV PDF into `public/`.** The Header / Home / About pages reference these via string URLs (`/images/avatar.jpg`, `/images/portrait.jpg`, `/images/logos/<n>.svg`, etc.). `scripts/build.ts`'s `cp("public", "dist", { recursive: true })` step ships them to production.

## 8. CI/CD

Requirements §1.7 uses GitHub Actions for both CI and CD. Pull requests get the same quality gate as before; pushes to `master` run the gate first and only then deploy through Cloudflare's official Wrangler action.

### 8.1 CI on GitHub Actions

One workflow at `.github/workflows/ci.yml` runs on every PR against `master` and every push to `master`:

```yaml
name: ci
on:
  pull_request:
    branches: [master]
  push:
    branches: [master]
  schedule:
    - cron: '0 7 * * *'
permissions:
  contents: read
jobs:
  check:
    if: github.event_name != 'schedule'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
      - uses: actions/setup-node@v6
        with:
          node-version: 22
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

  deploy:
    needs: check
    if: github.event_name == 'push' && github.ref == 'refs/heads/master'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
      - uses: actions/setup-node@v6
        with:
          node-version: 22
      - uses: oven-sh/setup-bun@v2
      - name: Cache Bun packages
        uses: actions/cache@v5
        with:
          path: ~/.bun/install/cache
          key: bun-${{ runner.os }}-${{ hashFiles('bun.lock') }}
      - run: bun install --frozen-lockfile
      - run: bun run build
      - name: Deploy Worker
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}

  lighthouse:
    needs: deploy
    if: always() && (needs.deploy.result == 'success' || github.event_name == 'schedule')
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
      - name: Wait for deploy to propagate
        if: github.event_name == 'push'
        run: sleep 30
      - name: Run Lighthouse CI
        uses: treosh/lighthouse-ci-action@v12
        with:
          configPath: ./lighthouserc.json
          uploadArtifacts: true
          temporaryPublicStorage: true
```

The workflow scopes `GITHUB_TOKEN` to `contents: read`, which is enough for checkout while leaving deploy authentication to Cloudflare secrets. The `check` job order matches the fresh-machine bootstrap in `features/tooling.md`. The cache keys include `hashFiles('bun.lock')`, so dependency or Playwright-version changes naturally create fresh caches. `setup:browsers` still runs after cache restore for the same reason §NFR-2.4.4 calls it out: do not depend on a pre-existing Playwright cache being complete or warm. `--frozen-lockfile` ensures PRs that touch dependencies also commit `bun.lock`.

`actions/setup-node@v6` is provisioned before `oven-sh/setup-bun@v2` because `bun run check` invokes `wrangler types` (Node-based) and `cloudflare/wrangler-action@v3` in the `deploy` job also expects Node available on PATH. `bun run build` runs in `check` to catch bundler breakage before merge; the second `bunx playwright test -c playwright.built.config.ts` exercises the built artifact through `wrangler dev`, so PR gating covers both the dev-server and the built-artifact code paths described in `features/testing.md`.

### 8.2 CD Through GitHub Actions

The `deploy` job runs only on pushes to `master`, after `check` succeeds:

- Installs dependencies with `bun install --frozen-lockfile`.
- Builds the static assets with `bun run build`.
- Deploys with `cloudflare/wrangler-action@v3`, which runs Wrangler against the committed `wrangler.toml`.
- Authenticates using GitHub Actions secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`.

Branch protection should require `check` before merge. The deploy job is not a pull-request gate because it only runs on `master`.

### 8.3 Why this shape

- **One pipeline surface.** CI and CD both live in GitHub Actions, so deployment cannot race ahead of the quality gate.
- **Official deploy action.** Cloudflare documents `cloudflare/wrangler-action@v3` as the GitHub Actions path for Workers deploys.
- **Secrets stay out of source.** The Cloudflare API token and account ID live in GitHub Actions secrets, never in committed files (§FR-1.7.5).
- **`bun run deploy` is unchanged** (§FR-1.5.4 / §FR-1.7.6). It still works as a break-glass path when GitHub Actions is degraded, but it is not the production source of truth.

### 8.4 Tradeoffs accepted for v1

- **GitHub now holds deploy credentials.** This is the direct tradeoff for keeping CI/CD in one GitHub Actions workflow. The token must be scoped narrowly in Cloudflare and stored only as a GitHub Actions secret.
- **Cache package artifacts, not `node_modules`.** CI caches Bun's package cache and Playwright's browser archive using exact `bun.lock` keys. Playwright notes that browser-cache restore can be comparable to download time, so this is a measured tradeoff rather than a correctness dependency. The workflow still runs `bun install --frozen-lockfile` and `bun run setup:browsers`, which keeps it reproducible on cache misses and avoids relying on a committed or restored `node_modules` tree.

### 8.5 Post-deploy Lighthouse CI

Requirements §1.8 adds a third job, `lighthouse`, to the same `ci.yml`. It runs `@lhci/cli` via [`treosh/lighthouse-ci-action@v12`](https://github.com/treosh/lighthouse-ci-action) against `https://moster.dev` after every production deploy and on a daily `schedule:` cron, asserting Core Web Vitals budgets defined in `lighthouserc.json` at the repo root. The per-feature implementation spec is at [features/lighthouse-ci.md](features/lighthouse-ci.md).

**Why this shape:**

- **Post-deploy, not PR-gating.** Lighthouse runs on a shared GitHub runner are noisy; per-PR enforcement would block merges on jitter rather than real regressions. Running against the *deployed* site, against absolute Core Web Vitals cutoffs, with N=3 runs and `aggregationMethod: "median"`, gives a trustworthy signal at the cost of detecting regressions slightly after they ship. Recovery is a roll-back, not a merge block.
- **One workflow, three jobs.** `check` and `deploy` are unchanged; `lighthouse` chains off `deploy` via `needs:`. The `if: always() && (needs.deploy.result == 'success' || github.event_name == 'schedule')` guard makes the job fire on both `push` (after a successful deploy) and `schedule` (where `deploy` is skipped). The `check` job adds `if: github.event_name != 'schedule'` so the cron run does not re-run the full test suite.
- **`treosh/lighthouse-ci-action` over rolling our own.** The official `GoogleChrome/lighthouse-ci` repo points readers at this community action; it's a thin wrapper around `@lhci/cli` with GH-native artifact and public-storage upload paths.
- **No LHCI Server.** Historical diffs and a status-check integration require self-hosting Postgres + a server. For a personal site, the `temporary-public-storage` link in the workflow log plus the uploaded HTML artifact are enough; this stays consistent with §NFR-2.2.2 (no paid third-party services for v1).

**Cost.** One ubuntu-latest runner × ~5 min × (push frequency + nightly) is well under the GitHub Actions free tier ceiling per §NFR-2.2.3.

## 9. Sources

- [Static Assets · Cloudflare Workers docs](https://developers.cloudflare.com/workers/static-assets/)
- [Migrate from Pages to Workers · Cloudflare Workers docs](https://developers.cloudflare.com/workers/static-assets/migration-guides/migrate-from-pages/)
- [GitHub Actions · Cloudflare Workers docs](https://developers.cloudflare.com/workers/ci-cd/external-cicd/github-actions/)
- [cloudflare/wrangler-action](https://github.com/cloudflare/wrangler-action)
- [Cache dependencies and build outputs in GitHub Actions](https://github.com/actions/cache)
- [Playwright CI docs — caching browsers](https://playwright.dev/docs/ci#caching-browsers)
- [TypeScript on Workers · Cloudflare Workers docs](https://developers.cloudflare.com/workers/languages/typescript/) — `wrangler types` and `worker-configuration.d.ts`
- [HTML bundler · Bun docs](https://bun.com/docs/bundler/html) — clarifies that `public/` is not auto-copied
- [Workers & Pages Pricing · Cloudflare](https://www.cloudflare.com/plans/developer-platform/)
- [GitHub Actions billing & free-tier minutes · GitHub Docs](https://docs.github.com/en/billing/concepts/product-billing/github-actions)
- [oven-sh/setup-bun action](https://github.com/oven-sh/setup-bun)
- [Lighthouse CI · GoogleChrome](https://github.com/GoogleChrome/lighthouse-ci) — `@lhci/cli`, assertions, presets
- [treosh/lighthouse-ci-action](https://github.com/treosh/lighthouse-ci-action) — GitHub Actions wrapper used in `ci.yml`
- [Core Web Vitals thresholds · web.dev](https://web.dev/articles/vitals) — LCP/CLS/INP "good" cutoffs anchoring §NFR-2.5
