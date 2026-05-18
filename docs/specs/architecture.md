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

## 5. Project structure

```
.
├── src/
│   ├── index.html          # Bun HTML entry
│   ├── main.tsx            # createRoot, mounts <App/>
│   ├── App.tsx
│   ├── worker.ts           # Workers fetch handler (pass-through today)
│   ├── components/
│   ├── content/            # (future) markdown/MDX posts
│   ├── lib/
│   └── styles/globals.css  # Tailwind + base
├── public/                 # favicon, og-image, robots.txt — copied into dist/
├── scripts/
│   ├── dev.ts              # Bun.serve with HMR
│   └── build.ts            # bun build → dist/
├── tests/
├── docs/
│   └── specs/
│       ├── requirements.md
│       └── architecture.md # this file
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
      - run: bun test
      - run: bunx playwright test

  deploy:
    needs: check
    if: github.event_name == 'push' && github.ref == 'refs/heads/master'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
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
```

The `check` job order matches the fresh-machine bootstrap in `features/tooling.md`. The cache keys include `hashFiles('bun.lock')`, so dependency or Playwright-version changes naturally create fresh caches. `setup:browsers` still runs after cache restore for the same reason §NFR-2.4.4 calls it out: do not depend on a pre-existing Playwright cache being complete or warm. `--frozen-lockfile` ensures PRs that touch dependencies also commit `bun.lock`.

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
