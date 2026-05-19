# Task 03 — Theming & global styles

## Goal
Rewrite `src/styles/globals.css` with the zinc + red palette, class-based dark mode, `@plugin "@tailwindcss/typography";`, and the six existing CSS-variable tokens plus the two new `--panel` and `--ring` tokens.

## Source spec
- [`features/theming.md`](../specs/features/theming.md)
- [`features/theme-toggle.md`](../specs/features/theme-toggle.md)
- Requirements: §FR-1.3.1–§FR-1.3.8

## Prereqs
- Task 01 (deps installed including `@tailwindcss/typography`).

## Steps

1. **Confirm token values.** The defaults (zinc-50/950, zinc-900/200, zinc-600/400, Chick-fil-A red, white/zinc-900 panel, zinc-100/zinc-300-20 ring) are resolved unless the user changes them. Only re-ask if Jalo specifies a different accent.

2. **Rewrite `src/styles/globals.css`:**
   ```css
   @import "tailwindcss";
   @plugin "@tailwindcss/typography";
   @custom-variant dark (&:where(.dark, .dark *));

   :root {
     --bg: #fafafa;
     --fg: #18181b;
     --muted: #52525b;
     --accent: #e51636;
     --panel: #ffffff;
     --ring: rgb(244 244 245);
     --font-sans: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto,
       "Helvetica Neue", Arial, sans-serif;
     --font-serif: ui-serif, Georgia, Cambria, "Times New Roman", serif;
   }

   :root.dark {
     --bg: #09090b;
     --fg: #e4e4e7;
     --muted: #a1a1aa;
     --accent: #ff4f5e;
     --panel: #18181b;
     --ring: rgb(212 212 216 / 0.2);
   }

   @theme {
     --color-bg: var(--bg);
     --color-fg: var(--fg);
     --color-muted: var(--muted);
     --color-accent: var(--accent);
     --color-panel: var(--panel);
     --color-ring: var(--ring);
     --font-sans: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto,
       "Helvetica Neue", Arial, sans-serif;
     --font-serif: ui-serif, Georgia, Cambria, "Times New Roman", serif;
   }

   html { scroll-behavior: smooth; scroll-padding-top: 4rem; }
   body { background: var(--bg); color: var(--fg); font-family: var(--font-sans); }
   article, .prose { max-width: 65ch; line-height: 1.7; }
   code, pre, kbd, samp { font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace; }
   ```

3. **Remove the old `@media (prefers-color-scheme: dark) { :root { ... } }` block.** Class-based dark mode replaces it.

4. **Update `src/index.html` `<head>`** with the anti-flicker script (Task 04 step 1) and updated theme-color meta tags using the new palette:
   ```html
   <meta name="theme-color" content="#fafafa" media="(prefers-color-scheme: light)">
   <meta name="theme-color" content="#09090b" media="(prefers-color-scheme: dark)">
   ```

## Outputs
- Rewritten: `src/styles/globals.css`.
- Edited: `src/index.html` (theme-color meta only at this step; anti-flicker script lands in Task 04).

## Verification
- `bunx tsc --noEmit` passes (no TS impact).
- Manual DevTools dark-mode emulation no longer flips colors (it's class-based now). The flip happens after Task 04 (anti-flicker script) and Task 06 (theme toggle).

## Open questions
- Override the red accent? Default: keep Chick-fil-A red.
