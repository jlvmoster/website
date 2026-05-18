# Tasks — Implementation Playbook

Ordered task list for implementing `docs/specs/` into a working v1 site. Each task is a self-contained step with prereqs, actionable steps, expected outputs, and verification commands.

## How to use

1. Read `docs/specs/requirements.md` and `docs/specs/architecture.md` first — they are the source of truth. The tasks here orchestrate *order* and *gates*; they do not restate spec content.
2. Work tasks in numeric order. Each task lists its prereqs at the top; do not skip ahead.
3. Each task ends with a **Verification** block. The task is not done until those commands pass.
4. Each task also lists **Open questions** that the corresponding feature spec flagged. Surface them to the user *before* implementing. Where a task lists a "Default to X unless …" fallback, treat it as advisory — only apply the default after the user has been asked and either confirms or defers. Never pick a default silently.
5. When a task creates files that appear in `docs/specs/architecture.md` §4 (canonical code shapes), copy from there verbatim; don't paraphrase.

## Order

| # | Task | Source spec(s) |
|---|---|---|
| 01 | [Tooling & TS config](./01-tooling.md) | `features/tooling.md` |
| 02 | [Worker config & types](./02-worker-config.md) | `features/worker.md` |
| 03 | [Theming & global styles](./03-theming.md) | `features/theming.md`, `features/theme-toggle.md` |
| 04 | [App shell & router](./04-app-shell.md) | `features/app-shell.md`, `features/routing.md` |
| 05 | [Layout primitives](./05-layout-primitives.md) | `features/layout-shell.md`, `features/iconography.md` |
| 06 | [Header & Footer](./06-header-footer.md) | `features/header.md`, `features/footer.md` |
| 07 | [Home page](./07-home-page.md) | `features/home-page.md`, `features/hero.md` |
| 08 | [About & Articles](./08-about-articles.md) | `features/about-page.md`, `features/articles-page.md`, `features/content-model.md` |
| 09 | [Projects & Uses](./09-projects-uses.md) | `features/projects-page.md`, `features/uses-page.md` |
| 10 | [Build pipeline & `public/`](./10-build-pipeline.md) | `features/build-pipeline.md` |
| 11 | [Unit smoke + Playwright E2E](./11-testing.md) | `features/testing.md` |
| 12 | [CI/CD bootstrap](./12-ci-cd.md) | `features/ci-cd.md` |
| 13 | [Acceptance verification](./13-acceptance.md) | `requirements.md` §6 |

## Hard rules (v2)

- Never paraphrase the hero copy. "my pleasure" stays verbatim.
- Never reintroduce Pages-based hosting. Workers + Static Assets only.
- Never add Next.js, Vite, MDX, or a third-party UI component library (shadcn, Radix, MUI). `react-router-dom`, `clsx`, and `@tailwindcss/typography` are utilities/plugins and are permitted.
- Worker types live in the gitignored `worker-configuration.d.ts`. Regenerate after `wrangler.toml` changes.
- The avatar/portrait/photos/CV PDF live under `public/` and ride along via `scripts/build.ts`.
- Pre-approved Bash: `bun *`, `bunx *`, `git *`. Other tools may prompt.

## Branch & PR convention

- Work on a branch named `<github-username>/<feature-slug>`.
- Base branch for PRs is `origin/master`. First push: `git push -u origin <branch>`.
- Commit subjects are imperative; bodies explain the *why*.
