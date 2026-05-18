# moster.dev

Jalo Moster's personal website — a single-page React SPA deployed to Cloudflare Workers with Static Assets.

**Status:** v1 complete. Hero, Writing (empty state), About, and Contact sections live; light/dark theming via `prefers-color-scheme`; smoke + Playwright E2E coverage; CI and production deploys on push to `master`.

## Stack

- **Runtime / tooling:** [Bun](https://bun.com) — package manager, dev server, HTML bundler, test runner.
- **UI:** React 19, Tailwind v4 (via `bun-plugin-tailwind`), system font stacks only.
- **Hosting:** Cloudflare Workers + Static Assets (not Pages) on `moster.dev`.
- **Lint / format:** Biome. **Types:** TypeScript strict mode + generated Worker types.
- **Testing:** `bun test` for units, `@playwright/test` for browser E2E.
- **CI/CD:** GitHub Actions — `check` on every PR/push, `deploy` on push to `master` via `cloudflare/wrangler-action@v3`.

No Vite, webpack, esbuild, Next.js, or component libraries — the Bun HTML bundler is the entire build pipeline.

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
| `bunx playwright test` | Browser E2E specs under `tests/e2e/`. |
| `bun run setup:browsers` | `playwright install chromium`. |

## Project layout

```
src/
  index.html            # bundler entry — <script src="./main.tsx">
  main.tsx              # React root
  App.tsx               # composes Nav + sections
  components/           # Nav, Hero, Writing, About, Contact
  styles/globals.css    # Tailwind v4 + CSS variables (--bg, --fg, --muted, --accent, ...)
  worker.ts             # pass-through fetch → env.ASSETS.fetch(req)
scripts/
  dev.ts                # Bun.serve dev loop with HMR
  build.ts              # Bun.build + public/ copy
tests/
  smoke.test.ts         # bun test
  e2e/site.e2e.ts       # Playwright
public/                 # static assets outside the bundler graph (favicon, robots.txt)
docs/
  specs/                # requirements, architecture, per-feature specs
  tasks/                # numbered implementation playbook (01–09)
wrangler.toml           # Workers + Static Assets config
worker-configuration.d.ts  # generated, gitignored
```

## Theming

Light and dark schemes are driven by `prefers-color-scheme` — no toggle. Design tokens are exposed as CSS variables in `src/styles/globals.css`: `--bg`, `--fg`, `--muted`, `--accent`, `--font-sans`, `--font-serif`. Typography uses system font stacks only (no hosted fonts).

## Testing

- **Unit:** `bun test` — specs colocated with source or under `tests/`.
- **E2E:** `bunx playwright test` against `bun run dev`. Coverage: page loads, hero copy renders verbatim, all three social links resolve, dark mode applies via `prefers-color-scheme`.
- A fresh machine can recreate the full test environment with `bun install && bun run setup:browsers`.

## Deployment

Production deploys run automatically on push to `master`:

1. `check` job: `bun install --frozen-lockfile`, `setup:browsers`, `check`, `build`, `bun test`, `bunx playwright test`.
2. `deploy` job (depends on `check`): builds and ships `dist/` via `cloudflare/wrangler-action@v3`.

Cloudflare credentials live as GitHub Actions secrets (`CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`) and are never committed. `bun run deploy` from a developer machine is supported as a break-glass path but is not the source of truth.

## Docs

- [`docs/specs/requirements.md`](./docs/specs/requirements.md) — authoritative requirements (every requirement has an ID like `§FR-1.2.1.a`).
- [`docs/specs/architecture.md`](./docs/specs/architecture.md) — rationale and canonical code shapes.
- [`docs/specs/features/*.md`](./docs/specs/features/) — per-feature implementation specs.
- [`docs/tasks/README.md`](./docs/tasks/README.md) — nine-step implementation playbook.
- [`CLAUDE.md`](./CLAUDE.md) — conventions and hard rules for agent-driven work in this repo.

## Growth path

Designed-in but not built in v1: MDX blog under `src/content/` with a route per file, `/api/contact` form handler in `src/worker.ts`, `/api/og` image generation via `workers-og`, Cloudflare Web Analytics, and edge data via Workers KV/D1/R2. See [`docs/specs/requirements.md` §3](./docs/specs/requirements.md).
