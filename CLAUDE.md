
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

Use HTML imports with `Bun.serve()`. Don't use `vite`. HTML imports fully support React, CSS, Tailwind.

Server:

```ts#index.ts
import index from "./index.html"

Bun.serve({
  routes: {
    "/": index,
    "/api/users/:id": {
      GET: (req) => {
        return new Response(JSON.stringify({ id: req.params.id }));
      },
    },
  },
  // optional websocket support
  websocket: {
    open: (ws) => {
      ws.send("Hello, world!");
    },
    message: (ws, message) => {
      ws.send(message);
    },
    close: (ws) => {
      // handle close
    }
  },
  development: {
    hmr: true,
    console: true,
  }
})
```

HTML files can import .tsx, .jsx or .js files directly and Bun's bundler will transpile & bundle automatically. `<link>` tags can point to stylesheets and Bun's CSS bundler will bundle.

```html#index.html
<html>
  <body>
    <h1>Hello, world!</h1>
    <script type="module" src="./frontend.tsx"></script>
  </body>
</html>
```

With the following `frontend.tsx`:

```tsx#frontend.tsx
import React from "react";
import { createRoot } from "react-dom/client";

// import .css files directly and it works
import './index.css';

const root = createRoot(document.body);

export default function Frontend() {
  return <h1>Hello, world!</h1>;
}

root.render(<Frontend />);
```

Then, run index.ts

```sh
bun --hot ./index.ts
```

For more information, read the Bun API docs in `node_modules/bun-types/docs/**.mdx`.

---

# Project: moster.dev

This repo is Jalo's personal website. **The authoritative product/architecture spec is `docs/spec.md` — read it before any non-trivial change.** It covers the deployment model, file layout, content sections, growth path, and the resolved decisions (domain, socials, hero copy, typography).

Current state: `bun init --empty` skeleton + `@playwright/test` installed. No `src/` yet — the scaffold step from the spec's build checklist hasn't run.

## Conductor workspace layout
- This project is usually edited through Conductor, which creates separate git worktrees under a shared project directory. The shared project directory is named `website`; individual worktrees are city-named directories such as `dublin`, and future sessions may use a different city.
- Treat the current working directory / `git rev-parse --show-toplevel` as the active worktree root for commands, diffs, tests, and file edits. Do not assume the current city directory is the canonical repo root across sessions.
- When documenting workflows, writing repo-local skills, or giving run instructions, prefer relative paths from the active worktree root. Avoid hard-coded absolute paths like `/Users/jalo/Dev/Conductor/workspaces/website/<city>`; if an absolute example is unavoidable, describe it as a Conductor worktree example, not a stable path.

## Frontend conventions
- Stack: Bun + React 19 + Tailwind v4 SPA, single page, deployed to Cloudflare Workers Static Assets via Wrangler.
- Tailwind v4 with CSS variables defined in `src/styles/globals.css`: `--bg`, `--fg`, `--muted`, `--accent`, `--font-sans`, `--font-serif`.
- System font stack only — no hosted fonts. Sans/serif/mono families are listed in `docs/spec.md`.
- Light + dark via `prefers-color-scheme`; no toggle.
- Prose max-width ~65ch; generous line-height.
- No component libraries (no shadcn, Radix, MUI, etc.). Handwritten components in `src/components/`.
- **Hero copy is canonical and must be preserved verbatim:** *"Hi, I'm Jalo and I'm a Software Engineer at Chick-fil-A. It's my pleasure to invite you into my portfolio."* Do not paraphrase "my pleasure" away — it's a deliberate Chick-fil-A tie-in.
- When building or restyling UI, invoke the `frontend-design` skill before generating code. It produces distinctive, non-generic components that fit the minimal aesthetic.

## Testing
- **Unit / integration:** `bun test`. Files: `*.test.ts` colocated with source or under `tests/`.
- **Browser smoke (E2E):** `@playwright/test` is installed and Chromium is cached at `~/Library/Caches/ms-playwright/`. Place specs in `tests/e2e/*.spec.ts`, run with `bunx playwright test`. Run them against `bun run dev`.
  - Keep specs thin: page loads, hero copy renders, all three social links resolve, dark mode applies via `prefers-color-scheme`. Don't snapshot the whole DOM.
  - A `playwright.config.ts` will be added during scaffold; until then, `@playwright/test` is dormant.
- **Interactive verification during a task:** use the `mcp__plugin_playwright_playwright__*` MCP tools to drive a browser ad-hoc rather than writing throwaway specs. Per the global rule, UI changes must be exercised in a browser before being reported as complete.

## Agents and skills
Plugins enabled in `.claude/settings.json`: `frontend-design`, `playwright`, `typescript-lsp`, `claude-md-management`, `skill-creator`, `superpowers`.

Built-in subagents to lean on:
- **`Explore`** — locating code under `src/` or facts in `docs/spec.md`.
- **`Plan`** — before non-trivial work (new section, adding routing, introducing MDX, switching a route from static to a Worker fetch handler).

Repo-local skills in `.claude/skills/`:
- **`changelog-generator`** — turns git commits in a chosen range into a reader-facing changelog (categories: New, Improvements, Fixes, Breaking; filters internal/tooling commits; defaults to no emojis to match the site's minimal aesthetic). Triggers on "changelog", "release notes", "what's new", "site updates", weekly/monthly digest asks, etc.

Skills worth authoring **only when the workflow recurs** (don't pre-build):
- `new-post` — scaffold an MDX file under `src/content/` with frontmatter, once the blog ships.
- `deploy-check` — chain `bunx wrangler types && bun run check && bun run build && bunx wrangler deploy --dry-run` as a one-shot pre-push gate.
- `spec-sync` — flag a diff between `docs/spec.md` and the implemented state if the spec starts drifting.

## Hard rules specific to this repo
- Never paraphrase the hero copy. "my pleasure" stays.
- Never reintroduce Pages-based hosting; the spec deliberately chose Workers + Static Assets.
- Never add a component library or framework (Next.js, Vite, etc.). The spec deliberately picked Bun's HTML bundler.
- Worker types (`Env`, `ExportedHandler`, `Fetcher`) come from generated `worker-configuration.d.ts` — run `bunx wrangler types` after changes to `wrangler.toml`. The file is gitignored.
