---
name: changelog-generator
description: Use when the user asks for a changelog, release notes, "what's new", "what shipped", a weekly or monthly digest, or any curated reader-facing list of recent project changes — even if they don't say "changelog". Skip only when the user explicitly wants raw `git log` output.
---

# Changelog Generator

Turn git commit history into a clean, reader-friendly changelog. The audience is humans reading release notes or an update post — not other developers.

## Workflow

1. **Pick a range.** Default to most recent semver-shaped tag (`git describe --tags --abbrev=0 --match 'v[0-9]*.[0-9]*.[0-9]*' --match '[0-9]*.[0-9]*.[0-9]*'`) → `HEAD`. Fall back to past 7 days (`git log --since=7.days`) when no semver tag exists. Ask the user if the range is ambiguous — one question is cheaper than rewriting.
2. **Read commits.** `git log <range> --pretty=format:"%H%x09%s%x09%b%x1e" --no-merges`. Skip merge commits.
3. **Categorize.** Map each commit to **New**, **Improvements**, **Fixes**, **Breaking**, or **Internal** (filtered out). See the table below. **If every commit lands in Internal, stop here** and return `No user-facing changes in this range.` as your entire output — don't promote a refactor or chore to fill the gap.
4. **Rewrite for readers.** Convert `feat(blog): add MDX support` → `Posts now support rich formatting.` Short, declarative, present-tense, benefit-oriented.
5. **Render Markdown** using the template below.
6. **Show before saving.** Ask before writing to disk. When saving, prepend to existing `CHANGELOG.md` rather than overwriting.

## Categorization

Inspect both the commit prefix and the body. Multiple signals can apply — pick the highest-priority bucket.

| Bucket | Triggers | Examples |
|---|---|---|
| **Breaking** | `BREAKING CHANGE:` in body, Conventional Commit `!` marker before the colon (`feat!:`, `feat(scope)!:`, `fix!:`, `fix(scope)!:`), removed/renamed user-visible behavior | "Drop legacy `/blog` redirect", "Rename `/about` → `/me`" |
| **New** | `feat:`, `feat(scope):` | New page, new section, new visible feature |
| **Improvements** | `perf:`, visual `style:`, `a11y:`, copy/typography tweaks, design polish | Faster image loading, better dark mode contrast, refreshed hero |
| **Fixes** | `fix:`, `fix(scope):` | Bug fixes the reader could have hit |
| **Internal** *(excluded)* | `chore:`, `refactor:`, `test:`, `docs:`, `build:`, `ci:`, dependency bumps, `[skip changelog]` in subject | Tooling, lockfile updates, README edits |

**Edge cases:**
- A `chore:` that's actually user-visible (e.g., "chore: rewrite hero copy") belongs in **Improvements** — judge by impact, not prefix.
- **Only upgrade when there's an observable change.** A refactor that moves code around (e.g., "refactor: pull theme variables into globals.css", "refactor: extract Nav component") stays **Internal**, even if the topic *sounds* user-facing. If you can't describe what a non-developer would see or feel differently, it's Internal.
- Ambiguous commits go in the bucket the reader cares about more (a fix that adds a new affordance → **New**).
- Drop entries too small to matter to readers (a typo fix in a deleted draft).
- If the project doesn't use conventional commit prefixes, fall back to judging each commit's user-facing impact from its subject and body.

## Output template

**Default to no emojis** — plain headings only. Add emoji only if the user requests it or the project's existing changelog already uses them. Each entry is one or two sentences; lead with the benefit, follow with the detail.

```markdown
# Updates — <date or version>

## New
- **<Short title>.** <One-sentence reader-facing description.>

## Improvements
- <Sentence describing the change and why it matters.>

## Fixes
- <Sentence describing what no longer goes wrong.>

## Breaking
- <Sentence describing the change and what readers need to do.>
```

Drop empty sections. If the entire range produces no user-facing changes, return one line: `No user-facing changes in this range.` — don't pad it.

## Style rules

- **Present tense, active voice.** "Posts load 2x faster." not "We've improved post loading speed."
- **Reader's perspective.** What the product does, not what you did. "Dark mode now follows your OS setting." beats "Implemented prefers-color-scheme."
- **No technical jargon.** Avoid framework names and implementation terms (MDX, React, frontmatter, SSR, hydration, prefers-color-scheme). Describe what the reader experiences, not the tech behind it. "Posts now support code blocks and callouts." beats "Posts now support MDX with frontmatter."
- **No code or file references** in entry text. `src/components/Hero.tsx` doesn't belong in a changelog.
- **No commit hashes** unless explicitly requested.
- **Respect canonical copy.** If the project's `CLAUDE.md`, style guide, or existing changelog preserves specific phrasing (taglines, hero copy, brand voice), don't paraphrase it.
- **One thought per bullet.** Split a commit that did two things.

## Examples

| Input commit | Bucket | Reader entry |
|---|---|---|
| `feat(blog): add MDX support with frontmatter parsing and code block syntax highlighting` | New | **Rich post formatting.** Posts now support code blocks, callouts, and inline formatting. |
| `perf: lazy-load hero image and inline critical CSS` | Improvements | The home page paints noticeably faster on the first visit. |
| `fix: prevent dark-mode flash on initial paint` | Fixes | Dark mode no longer flashes white when the page first loads. |
| `chore(deps): bump typescript to 5.9.4` | Internal *(excluded)* | — |

## Common mistakes

- **Restating commit messages verbatim.** "Added MDX support" isn't reader-facing. Rewrite to describe what the reader now experiences.
- **Leaking technical jargon.** Words like "MDX", "frontmatter", "SSR", or "prefers-color-scheme" mean nothing to a reader. Translate them ("rich post formatting", "follows your OS setting").
- **Including hashes or file paths.** Belong in `git log`, not a changelog.
- **Padding empty changelogs by promoting a refactor.** If every commit is internal (chore/refactor/build/ci/docs/test), don't reach for the closest user-adjacent one and dress it up. Return `No user-facing changes in this range.` and move on. A refactor with no observable behavior change is Internal, even if the words sound user-facing.
- **Overwriting `CHANGELOG.md`.** Always prepend; older sections stay intact.
- **Running from the wrong worktree.** Confirm with `git rev-parse --show-toplevel` before generating. If you're in a parallel or sandbox workspace, your commit range may not match the canonical branch.

## Tips

- For a "weekly update post", title with `# Week of <Monday's date>` instead of a version.
- Re-read drafts aloud before publishing. If a sentence sounds like a release engineer wrote it, rewrite it.
