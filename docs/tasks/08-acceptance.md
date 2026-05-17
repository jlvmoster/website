# Task 08 — Acceptance verification

## Goal
Run the §6 acceptance checklist from `requirements.md` end-to-end. v1 is "done" only when every line passes.

## Source
- [`requirements.md` §6 Acceptance criteria](../specs/requirements.md#6-acceptance-criteria-v1-done)

## Prereqs
- Tasks 01–07 complete.

## Checklist

Run each command from a clean state. Tick each box only after the corresponding command (or manual check) passes.

- [ ] `bun install && bun run setup:browsers && bun run build` produces a `dist/` containing `index.html`, hashed JS/CSS, and the contents of `public/`. Chromium installs successfully.
- [ ] `bun run dev` serves the site locally with HMR (manual: edit a component, browser updates without full reload).
- [ ] `bun run preview` (`wrangler dev`) serves the built site through the Workers runtime without errors.
- [ ] `bun run deploy` publishes; `https://moster.dev` resolves over HTTPS and returns the SPA shell. *Requires the post-scaffold operational steps in architecture §7 (custom domain attached in Cloudflare dashboard).*
- [ ] `bun run check` passes (`wrangler types && biome check && tsc --noEmit`).
- [ ] `bun test` passes; at least one smoke test exists.
- [ ] `bunx playwright test` passes the minimum coverage:
  - Page loads
  - Hero copy renders verbatim (the "my pleasure" substring is present)
  - All three social links resolve to the correct URLs
  - Dark mode applies via `prefers-color-scheme`
- [ ] All four sections render the content specified in §1.2 of `requirements.md`.
- [ ] Hero copy matches §1.2.1.a verbatim. The three social links from §1.2.1.b each open the correct URL.
- [ ] Dark mode applies automatically under `prefers-color-scheme: dark`.
- [ ] An unknown path (e.g., `/foo`) returns the SPA shell, not a 404. *Verify this against `bun run preview` / `wrangler dev` after `bun run build`; the Task 07 E2E only covers the local Bun dev server fallback.*

## If a box won't tick

1. Re-read the failing requirement and the relevant feature spec under `docs/specs/features/`.
2. Identify which task introduced (or should have introduced) the work and re-open it.
3. Do not paper over a failure by relaxing the assertion — fix the implementation.

## After all boxes pass

- Open a PR against `origin/master`. Branch is already `jlvmoster/<feature-slug>`; first push uses `git push -u origin <branch>`.
- PR title is imperative; body explains the *why*, not the *what*.
- The post-scaffold ops in architecture §7 (custom domain attach, OG image, optional GitHub→Workers Builds wire-up) can ship in follow-up PRs.
