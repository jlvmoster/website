# Theming — Implementation Spec

## Goal
Zinc + red palette via CSS variables, class-based dark mode, three-state theme toggle, system-stack typography, Tailwind v4 typography plugin for Prose.

## Requirements covered
- §FR-1.3.1 — Theme toggle (light/dark/system), `localStorage` persistence, anti-flicker.
- §FR-1.3.2 — Six CSS variable tokens (`--bg`, `--fg`, `--muted`, `--accent`, `--font-sans`, `--font-serif`).
- §FR-1.3.3 — System-stack fonts only.
- §FR-1.3.4 — Prose max-width 65ch.
- §FR-1.3.5 — No UI library.
- §FR-1.3.6 — Two additional tokens for the Spotlight panel: `--panel`, `--ring`.
- §FR-1.3.7 — `@plugin "@tailwindcss/typography";` for Prose.

## File layout
- `src/styles/globals.css` — Tailwind v4 import, typography plugin, `@custom-variant dark`, `@theme` block, `:root` tokens (light), `:root.dark` overrides, base body rules, prose width rule.
- `src/index.html` — anti-flicker `<script>` in `<head>`.
- `src/lib/useTheme.ts` — see `theme-toggle.md`.

## Behavior & edge cases
- `globals.css` declares `@custom-variant dark (&:where(.dark, .dark *));` so Tailwind's `dark:` utilities key off `html.dark` (class strategy, not media query). The toggle must be able to override the OS.
- Light tokens on `:root`:
  - `--bg: #fafafa;` (zinc-50)
  - `--fg: #18181b;` (zinc-900)
  - `--muted: #52525b;` (zinc-600)
  - `--accent: #e51636;` (Chick-fil-A red)
  - `--panel: #ffffff;`
  - `--ring: rgb(244 244 245);` (zinc-100)
- Dark tokens on `:root.dark`:
  - `--bg: #09090b;` (zinc-950)
  - `--fg: #e4e4e7;` (zinc-200)
  - `--muted: #a1a1aa;` (zinc-400)
  - `--accent: #ff4f5e;` (red accent, dark)
  - `--panel: #18181b;` (zinc-900)
  - `--ring: rgb(212 212 216 / 0.2);` (zinc-300/20)
- `--font-sans` and `--font-serif` keep verbatim system stacks from v1.
- The `@theme` block maps each token into a Tailwind utility (`--color-bg: var(--bg)`, etc.) so `bg-bg`, `text-fg`, `text-muted`, `text-accent`, `font-sans`, `font-serif` continue to work. Adds two new tokens: `--color-panel`, `--color-ring`.
- The v1 `@media (prefers-color-scheme: dark) { :root { ... } }` block is removed — replaced by the class strategy + anti-flicker script.
- `body { background: var(--bg); color: var(--fg); font-family: var(--font-sans); }`.
- Prose: `article, .prose { max-width: 65ch; line-height: 1.7; }` — guard for plain `<article>` tags outside `<Prose>`. The typography plugin caps prose width too.

## Test plan
- **Unit:** none — pure CSS.
- **E2E** (`tests/e2e/site.e2e.ts`): with empty `localStorage` and browser `colorScheme: "dark"`, `<body>` background matches the dark token. After clicking the theme toggle in light mode, `<html>` gains the `dark` class. After reload, the choice persists.

## Open questions
- Hero h1 font: keep `font-serif` from v1 or switch to sans? (Defaults to sans — see `hero.md`.)
- Accent: Chick-fil-A red is the selected brand accent.
