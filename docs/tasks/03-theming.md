# Task 03 — Theming & global styles

## Goal
Lay down `src/styles/globals.css` with Tailwind v4, the six CSS variable tokens, dark-mode overrides via `prefers-color-scheme`, and base typography rules. No JS, no toggle, no hosted fonts.

## Source spec
- [`features/theming.md`](../specs/features/theming.md)
- Requirements: §FR-1.3.1–§FR-1.3.5

## Prereqs
- Task 01 (Tailwind v4 + Biome installed).

## Steps

1. **Resolve open questions first.** Ask the user before writing CSS:
   - Concrete hex/oklch values for `--bg`, `--fg`, `--muted`, `--accent` in light and dark.
   - Accent color: greyscale-only neutral, or a hue?
   - Suggested defaults if the user defers: near-white `#fafafa` / near-black `#0a0a0a` backgrounds, foreground at high contrast, muted at ~60% luminance, neutral accent matching the foreground.
2. **Create `src/styles/globals.css`** with:
   - Tailwind v4 entry (`@import "tailwindcss";`).
   - `:root` block declaring all six tokens. Font tokens use the verbatim stacks from §FR-1.3.3.
   - `@media (prefers-color-scheme: dark) { :root { ... } }` overriding the four color tokens.
   - Base rules: `body { background: var(--bg); color: var(--fg); font-family: var(--font-sans); }`.
   - Prose rule: `article, .prose { max-width: 65ch; line-height: 1.7; }` (or tune within 1.6–1.75).
   - Mono stack applied to `code, pre, kbd, samp` directly (no `--font-mono` variable unless a need appears).
3. **Create `tailwind.config.ts`** at repo root that exposes the CSS variables as Tailwind utilities (`bg-bg`, `text-fg`, `text-muted`, `text-accent`, `font-sans`, `font-serif`). Keep it tiny — only the `theme.extend` mapping is required.
4. **Do not add** `data-theme`, class-based dark mode, or any JS theme detection. The whole feature is CSS.

## Outputs
- New: `src/styles/globals.css`, `tailwind.config.ts`.

## Verification
- File loads under Task 04's `index.html` without console warnings (verified when Task 06's dev server runs).
- Manual: emulate dark mode in DevTools; `body` background flips.
- Will be exercised by the Playwright dark-mode assertion in Task 07.

## Open questions to surface
- Concrete color token values for light + dark (see step 1).
- Accent color preference — neutral vs hued.
