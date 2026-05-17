---
name: changelog-generator
description: Generate user-facing changelogs from git commits for moster.dev — scans history, groups changes by intent (features, improvements, fixes, breaking changes), rewrites technical commit messages into clear reader-friendly entries, and outputs polished Markdown. Use this skill whenever the user asks for a changelog, release notes, "what's new", "what shipped", site updates, a weekly/monthly digest, or wants to publish a list of recent changes — even if they don't say the word "changelog".
---

# Changelog Generator

Turn git commit history on moster.dev into a clean, reader-friendly changelog. The audience is humans visiting the site or reading an update post — not other developers.

## When this triggers
Use this skill for any phrasing along the lines of:
- "make a changelog" / "generate release notes" / "draft an update post"
- "summarize what shipped last week" / "what's new since v1.2"
- "write a 'what changed' section" / "weekly update" / "site updates"
- Anything that asks for a curated, human-readable list of recent changes

Skip this skill only if the user clearly wants raw `git log` output instead of a curated summary.

## What it does
1. **Pick a range.** Default is the most recent semver tag (`git describe --tags --abbrev=0`) → `HEAD`. Falls back to "last 7 days" (`git log --since=7.days`) when no tag exists. The user can override with a date range, version, or commit range.
2. **Read the commits.** Run `git log <range> --pretty=format:"%H%x09%s%x09%b%x1e" --no-merges` and parse the resulting records. Skip merge commits.
3. **Categorize.** Map each commit to one of: **New**, **Improvements**, **Fixes**, **Breaking**, or **Internal** (filtered out by default). See "Categorization" below.
4. **Rewrite for readers.** Convert `feat(blog): add MDX support` → `Posts now support rich formatting via MDX.` Keep entries short, declarative, present-tense, and benefit-oriented.
5. **Render Markdown.** Use the template below. Save to the path the user specified, or `CHANGELOG.md` at repo root by default. If the user just wants to copy/paste, print to stdout instead of writing.

## Categorization
Match each commit by inspecting both the prefix and the message body. Multiple signals can apply — pick the highest-priority bucket per commit.

| Bucket | Triggers | Examples |
|---|---|---|
| **Breaking** | `BREAKING CHANGE:` in body, `feat!:` / `fix!:` prefix, message mentions removed/renamed user-visible behavior | "Drop legacy `/blog` redirect", "Rename `/about` → `/me`" |
| **New** | `feat:`, `feat(scope):` | New page, new section, new visible feature |
| **Improvements** | `perf:`, `style:` (visual style only), `a11y:`, copy/typography tweaks, design polish | Faster image loading, better dark mode contrast, refreshed hero |
| **Fixes** | `fix:`, `fix(scope):` | Bug fixes the reader could have hit |
| **Internal** *(excluded)* | `chore:`, `refactor:`, `test:`, `docs:`, `build:`, `ci:`, dependency bumps (`bun add`, `bun update`), commit subject starts with `[skip changelog]` | Tooling, lockfile updates, README edits |

Edge cases:
- A `chore:` that's actually user-visible (e.g., "chore: rewrite hero copy") belongs in **Improvements** — judge by impact, not by prefix.
- If a commit is ambiguous, prefer the bucket the reader cares about more (a fix that introduces a new affordance → **New**).
- Drop entries that turn out to be too small to be interesting in user terms (e.g., a typo fix in a deleted draft).

## Output template
moster.dev is a minimal-aesthetic site. **Default to no emojis** — use plain headings. Only add emoji headers if the user asks for them or asks for the "punchier" style from the source template. Each entry is one or two sentences; lead with the benefit, follow with the detail.

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

Drop any section that has zero entries. If the entire range produces no user-facing changes, return a single line: `No user-facing changes in this range.` — don't pad it.

## Workflow
1. Confirm the range with the user if it's unclear ("since last tag" vs. "past week" vs. a specific date/commit). Don't guess if the user said something vague — one question is cheaper than rewriting.
2. Run the `git log` command. If the repo has no tags and the user didn't specify a range, default to the past 7 days.
3. Pull the commits into memory, classify each one, draft the rewrite for the user-facing buckets, and discard `Internal`.
4. Render the Markdown, then show the result. Ask before writing to disk — overwriting `CHANGELOG.md` is destructive.
5. When saving, prepend the new section to an existing `CHANGELOG.md` rather than overwriting it. Keep older sections intact.

## Style rules for rewrites
- **Present tense, active voice.** "Posts load 2x faster." not "We've improved post loading speed."
- **Reader's perspective.** Talk about what the site does, not what you did. "Dark mode now follows your OS setting." beats "Implemented prefers-color-scheme."
- **No code/file references in the entry text.** `src/components/Hero.tsx` doesn't belong in a reader-facing changelog.
- **No commit hashes** unless the user explicitly asks. Hashes belong in `git log`, not in a changelog.
- **Preserve "my pleasure".** If you find yourself describing changes to the hero copy, never paraphrase the canonical hero line away (see `CLAUDE.md`).
- **One thought per bullet.** If a commit did two things, split it.

## Examples

**Input commit:**
```
feat(blog): add MDX support with frontmatter parsing and code block syntax highlighting
```
**Reader entry (New):**
- **Rich post formatting.** Posts now support code blocks, callouts, and inline formatting.

---

**Input commit:**
```
perf: lazy-load hero image and inline critical CSS
```
**Reader entry (Improvements):**
- The home page paints noticeably faster on the first visit.

---

**Input commit:**
```
fix: prevent dark-mode flash on initial paint
```
**Reader entry (Fixes):**
- Dark mode no longer flashes white when the page first loads.

---

**Input commit (filtered):**
```
chore(deps): bun update typescript to 5.9.4
```
**Action:** Excluded — internal tooling, no reader-visible change.

## Tips
- Run from the active worktree root (`git rev-parse --show-toplevel`) so `git log` sees the right history. In Conductor, this is usually a city-named worktree under the shared `website` project directory, and the city name may differ between sessions.
- For a "weekly update post" framing, set the title to `# Week of <Monday's date>` instead of a version.
- If `docs/spec.md` is relevant (e.g., a change touches the resolved-inputs table), mention the spec section in the rewrite — but only when it adds context for the reader.
- Before publishing, re-read the draft aloud. If a sentence sounds like a release engineer wrote it, rewrite it.
