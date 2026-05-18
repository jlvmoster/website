---
name: changelog-generator
description: Use when the user asks for a changelog, release notes, "what's new", "what shipped", site updates, a weekly or monthly digest, or any curated reader-facing list of recent moster.dev changes — even if they don't say "changelog". Skip only when the user explicitly wants raw `git log` output.
---

# Changelog Generator

Turn git commit history on moster.dev into a clean, reader-friendly changelog. The audience is humans visiting the site or reading an update post — not other developers.

## Workflow

1. **Pick a range.** Default to most recent semver tag (`git describe --tags --abbrev=0`) → `HEAD`. Fall back to past 7 days (`git log --since=7.days`) when no tag exists. Ask the user if the range is ambiguous — one question is cheaper than rewriting.
2. **Read commits.** `git log <range> --pretty=format:"%H%x09%s%x09%b%x1e" --no-merges`. Skip merge commits.
3. **Categorize.** Map each commit to **New**, **Improvements**, **Fixes**, **Breaking**, or **Internal** (filtered out). See the table below.
4. **Rewrite for readers.** Convert `feat(blog): add MDX support` → `Posts now support rich formatting via MDX.` Short, declarative, present-tense, benefit-oriented.
5. **Render Markdown** using the template below.
6. **Show before saving.** Ask before writing to disk. When saving, prepend to existing `CHANGELOG.md` rather than overwriting.

## Categorization

Inspect both the commit prefix and the body. Multiple signals can apply — pick the highest-priority bucket.

| Bucket | Triggers | Examples |
|---|---|---|
| **Breaking** | `BREAKING CHANGE:` in body, `feat!:` / `fix!:` prefix, removed/renamed user-visible behavior | "Drop legacy `/blog` redirect", "Rename `/about` → `/me`" |
| **New** | `feat:`, `feat(scope):` | New page, new section, new visible feature |
| **Improvements** | `perf:`, visual `style:`, `a11y:`, copy/typography tweaks, design polish | Faster image loading, better dark mode contrast, refreshed hero |
| **Fixes** | `fix:`, `fix(scope):` | Bug fixes the reader could have hit |
| **Internal** *(excluded)* | `chore:`, `refactor:`, `test:`, `docs:`, `build:`, `ci:`, dependency bumps, `[skip changelog]` in subject | Tooling, lockfile updates, README edits |

**Edge cases:**
- A `chore:` that's actually user-visible (e.g., "chore: rewrite hero copy") belongs in **Improvements** — judge by impact, not prefix.
- Ambiguous commits go in the bucket the reader cares about more (a fix that adds a new affordance → **New**).
- Drop entries too small to matter to readers (a typo fix in a deleted draft).

## Output template

moster.dev is a minimal-aesthetic site. **Default to no emojis** — plain headings only. Add emoji only if the user requests it. Each entry is one or two sentences; lead with the benefit, follow with the detail.

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
- **Reader's perspective.** What the site does, not what you did. "Dark mode now follows your OS setting." beats "Implemented prefers-color-scheme."
- **No code or file references** in entry text. `src/components/Hero.tsx` doesn't belong in a changelog.
- **No commit hashes** unless explicitly requested.
- **Preserve "my pleasure".** Never paraphrase the canonical hero line (see CLAUDE.md).
- **One thought per bullet.** Split a commit that did two things.

## Examples

| Input commit | Bucket | Reader entry |
|---|---|---|
| `feat(blog): add MDX support with frontmatter parsing and code block syntax highlighting` | New | **Rich post formatting.** Posts now support code blocks, callouts, and inline formatting. |
| `perf: lazy-load hero image and inline critical CSS` | Improvements | The home page paints noticeably faster on the first visit. |
| `fix: prevent dark-mode flash on initial paint` | Fixes | Dark mode no longer flashes white when the page first loads. |
| `chore(deps): bun update typescript to 5.9.4` | Internal *(excluded)* | — |

## Common mistakes

- **Restating commit messages verbatim.** "Added MDX support" isn't reader-facing. Rewrite to describe what the reader now experiences.
- **Including hashes or file paths.** Belong in `git log`, not a changelog.
- **Padding empty changelogs.** If there are no user-facing changes, say so in one line.
- **Overwriting `CHANGELOG.md`.** Always prepend; older sections stay intact.
- **Running from the wrong worktree.** Confirm with `git rev-parse --show-toplevel`. In Conductor, this is a city-named worktree under the shared `website` project; the city differs across sessions.

## Tips

- For a "weekly update post", title with `# Week of <Monday's date>` instead of a version.
- Re-read drafts aloud before publishing. If a sentence sounds like a release engineer wrote it, rewrite it.
