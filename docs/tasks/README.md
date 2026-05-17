# Tasks — Implementation Playbook

Ordered task list for implementing `docs/specs/` into a working v1 site. Each task is a self-contained step with prereqs, actionable steps, expected outputs, and verification commands.

## How to use

1. Read `docs/specs/requirements.md` and `docs/specs/architecture.md` first — they are the source of truth. The tasks here orchestrate *order* and *gates*; they do not restate spec content.
2. Work tasks in numeric order. Each task lists its prereqs at the top; do not skip ahead.
3. Each task ends with a **Verification** block. The task is not done until those commands pass.
4. Each task also lists **Open questions** that the corresponding feature spec flagged. Surface them to the user *before* implementing — don't silently pick a default.
5. When a task creates files that appear in `docs/specs/architecture.md` §4 (canonical code shapes), copy from there verbatim; don't paraphrase.

## Order

| # | Task | Source spec(s) |
|---|---|---|
| 01 | [Tooling & TS config](./01-tooling.md) | `features/tooling.md` |
| 02 | [Worker config & types](./02-worker-config.md) | `features/worker.md` |
| 03 | [Theming & global styles](./03-theming.md) | `features/theming.md` |
| 04 | [App shell](./04-app-shell.md) | `features/app-shell.md` |
| 05 | [Nav & section components](./05-nav-and-sections.md) | `features/nav.md`, `features/hero.md`, `features/writing.md`, `features/about.md`, `features/contact.md` |
| 06 | [Build pipeline & `public/`](./06-build-pipeline.md) | `features/build-pipeline.md` |
| 07 | [Unit smoke + Playwright E2E](./07-testing.md) | `features/testing.md` |
| 08 | [CI/CD bootstrap](./08-ci-cd.md) | `features/ci-cd.md` |
| 09 | [Acceptance verification](./09-acceptance.md) | `requirements.md` §6 |

## Hard rules (lifted from `CLAUDE.md`)

- Never paraphrase the hero copy. "my pleasure" stays verbatim.
- Never reintroduce Pages-based hosting. Workers + Static Assets only.
- Never add a component library (shadcn, Radix, MUI) or a framework (Next.js, Vite).
- Worker types live in the gitignored `worker-configuration.d.ts`. Regenerate after `wrangler.toml` changes.
- Pre-approved Bash: `bun *`, `bunx *`, `git *`. Other tools may prompt.

## Branch & PR convention

- Work on a branch named `<github-username>/<feature-slug>`.
- Base branch for PRs is `origin/master`. First push: `git push -u origin <branch>`.
- Commit subjects are imperative; bodies explain the *why*.
