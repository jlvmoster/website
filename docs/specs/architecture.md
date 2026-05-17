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
- **Workers Builds (Git integration), free tier:** 3,000 build minutes/month, 1 concurrent build, 20-minute timeout per build, 2 vCPU / 8 GB RAM / 20 GB disk per builder. Local `wrangler deploy` doesn't count against this.
- **20,000-file limit per deployment.**
- **Custom domain + automatic HTTPS** included.

These shape a few decisions: we don't worry about asset cache headers for v1 (bandwidth is free), and we don't need to optimize file count (we're nowhere near 20K).

## 3. Deployment surfaces

The same project supports four runtime contexts, in this order of "production-likeness":

| Surface | Command | Runtime | Purpose |
|---|---|---|---|
| Local dev | `bun run dev` | Bun.serve + HMR | Tight feedback loop. Fastest. |
| Pre-deploy check | `bun run preview` | `wrangler dev` (Workers V8 runtime locally) | Sanity-check anything Worker-shaped before pushing. |
| CI build | `bun run build` (then `wrangler deploy`) | Bun bundler → Cloudflare upload | Production artifact. |
| Production | (auto, after deploy) | Cloudflare Workers + Static Assets edge | What users see. |

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
├── tailwind.config.ts
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

1. **Connect GitHub repo → Cloudflare Workers Builds** (optional). Alternative is to keep deploying from local CLI with `wrangler deploy`. Either way satisfies §FR-1.4.4 / §FR-1.5.4.
2. **Add custom domain `moster.dev`** in the Cloudflare dashboard. SSL/HTTPS is automatic once the zone is attached.
3. **Drop a favicon and OG image into `public/`.** Anything referenced from `<link rel="icon">` or `<meta property="og:image">` lives here and rides along via the `cp public dist` step in `scripts/build.ts`.

## 8. Sources

- [Static Assets · Cloudflare Workers docs](https://developers.cloudflare.com/workers/static-assets/)
- [Migrate from Pages to Workers · Cloudflare Workers docs](https://developers.cloudflare.com/workers/static-assets/migration-guides/migrate-from-pages/)
- [Workers Builds — limits and pricing · Cloudflare Workers docs](https://developers.cloudflare.com/workers/ci-cd/builds/limits-and-pricing/)
- [TypeScript on Workers · Cloudflare Workers docs](https://developers.cloudflare.com/workers/languages/typescript/) — `wrangler types` and `worker-configuration.d.ts`
- [HTML bundler · Bun docs](https://bun.com/docs/bundler/html) — clarifies that `public/` is not auto-copied
- [Workers & Pages Pricing · Cloudflare](https://www.cloudflare.com/plans/developer-platform/)
