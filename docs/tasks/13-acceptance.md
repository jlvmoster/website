# Task 13 — Acceptance verification

## Goal
Run the §6 v2 acceptance checklist from `requirements.md` end-to-end. v2 is "done" only when every line passes.

## Source
- [`requirements.md` §6 Acceptance criteria](../specs/requirements.md#6-acceptance-criteria-v2-done)

## Prereqs
- Tasks 01–12 complete.

## Checklist

Run each command from a clean state. Tick each box only after the corresponding command (or manual check) passes.

- [ ] `bun install && bun run setup:browsers && bun run build` produces a `dist/` containing `index.html`, hashed JS/CSS assets, and the contents of `public/` (including `public/images/` and `public/cv.pdf`).
- [ ] `bun run dev` serves the site locally with HMR.
- [ ] `bun run preview` serves the built site through `wrangler dev`.
- [ ] `bun run deploy` publishes the site; `moster.dev` resolves over HTTPS and returns the SPA. *Break-glass only — the canonical CD surface is GitHub Actions.*
- [ ] `bun run check` passes (wrangler types regen + biome + `tsc --noEmit`).
- [ ] `bun test` passes; smoke test asserts the verbatim hero substring.
- [ ] Playwright E2E suite passes the minimum coverage (§NFR-2.4.3).
- [ ] All six routes load: `/`, `/about`, `/articles`, `/articles/:slug`, `/projects`, `/uses`.
- [ ] Hard-refresh on any deep link (`/about`, `/articles`, `/projects`, `/uses`) returns 200 via Workers SPA fallback.
- [ ] Hero copy matches §1.2.1.a verbatim on `/`; the three social links in §1.2.1.b each open the correct URL on `/` and `/about`.
- [ ] Theme toggle switches light ↔ dark; `html.dark` flips appropriately and `localStorage["theme"]` persists across reload.
- [ ] Avatar is present in the Header on every route. On `/` the avatar starts at 64px and scales to 36px on scroll.
- [ ] Articles list renders ≥ 1 article card; clicking it loads `/articles/<slug>`.
- [ ] About page renders the portrait image at `/images/portrait.jpg` and the mailto link.
- [ ] Footer renders on every route.
- [ ] On a fresh PR, GitHub Actions runs `check`, `bun test`, and Playwright and reports green. On push to `master`, CD deploys via `cloudflare/wrangler-action@v3`.

## If a box won't tick

1. Re-read the failing requirement and the relevant feature spec under `docs/specs/features/`.
2. Identify which task introduced (or should have introduced) the work and re-open it.
3. Do not paper over a failure by relaxing the assertion — fix the implementation.

## After all boxes pass

- Open a PR against `origin/master`. Branch is already `jlvmoster/<feature-slug>`; first push uses `git push -u origin <branch>`.
- PR title is imperative; body explains the *why*, not the *what*.
- The post-scaffold ops in architecture §7 can ship in follow-up PRs.
