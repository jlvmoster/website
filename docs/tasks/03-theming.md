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
3. **Expose the tokens as Tailwind utilities via `@theme` in `globals.css`.** Tailwind v4 is CSS-first — there is no `tailwind.config.ts`. Inside `globals.css`, add a `@theme { … }` block that maps each token into the Tailwind theme namespace:
   ```css
   @theme {
     --color-bg: var(--bg);
     --color-fg: var(--fg);
     --color-muted: var(--muted);
     --color-accent: var(--accent);
     --font-sans: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
     --font-serif: ui-serif, Georgia, Cambria, "Times New Roman", serif;
   }
   ```
   Tailwind generates `bg-bg`, `text-fg`, `text-muted`, `text-accent`, `font-sans`, `font-serif` from these entries. The color aliases point at the `:root` CSS variables so the `prefers-color-scheme` swap in step 2 automatically flows through the utilities — no `dark:` variants needed. The font entries use the same literal stacks as the required `:root` tokens to avoid defining `--font-sans` or `--font-serif` in terms of themselves.
4. **Do not add** `data-theme`, class-based dark mode, any JS theme detection, or a `tailwind.config.ts` / `@config` directive — Tailwind v4 is configured entirely via the `@theme` block in `globals.css`. The whole feature is CSS.

## Outputs
- New: `src/styles/globals.css`.

## Verification
- File loads under Task 04's `index.html` without console warnings (verified when Task 06's dev server runs).
- Manual: emulate dark mode in DevTools; `body` background flips.
- Will be exercised by the Playwright dark-mode assertion in Task 07.

## Open questions to surface
- Concrete color token values for light + dark (see step 1).
- Accent color preference — neutral vs hued.
