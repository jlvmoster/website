# Theming — Implementation Spec

## Goal
Light + dark themes via `prefers-color-scheme`, design tokens as CSS variables, system-stack typography. No toggle, no hosted fonts, no component library.

## Requirements covered
- §FR-1.3.1 — `prefers-color-scheme`, no toggle.
- §FR-1.3.2 — CSS variables: `--bg`, `--fg`, `--muted`, `--accent`, `--font-sans`, `--font-serif`.
- §FR-1.3.3 — System font stacks only.
- §FR-1.3.4 — Prose max-width ~65ch, generous line-height.
- §FR-1.3.5 — No third-party UI library.

## File layout
- `src/styles/globals.css` — Tailwind v4 import, `:root` token definitions, dark overrides, base typography rules.
- `tailwind.config.ts` — extends theme to expose the CSS variables as Tailwind utilities (e.g., `bg-bg`, `text-fg`).

## Behavior & edge cases
- Tokens declared on `:root`:
  - `--font-sans: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;`
  - `--font-serif: ui-serif, Georgia, Cambria, "Times New Roman", serif;`
  - Color tokens (`--bg`, `--fg`, `--muted`, `--accent`) — light values.
- Dark overrides in `@media (prefers-color-scheme: dark)` on `:root`, redefining the four color tokens.
- `body` uses `background-color: var(--bg)`, `color: var(--fg)`, `font-family: var(--font-sans)`.
- Prose container (`.prose` or `article, p` baseline) has `max-width: 65ch` and a generous `line-height` (1.6–1.75).
- Mono stack (`ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace`) applied to `code, pre, kbd, samp` — not exposed as a `--font-mono` variable unless needed.
- No `data-theme` attribute, no class-based dark mode, no JS for theme detection.

## Test plan
- **Unit:** snapshot of computed `background-color` / `color` for a sample component under light and dark color schemes (using JSDOM's `matchMedia` mock).
- **E2E:** Playwright emulates `colorScheme: "dark"` and asserts the page background differs from the light-scheme baseline.

## Open questions
- Concrete color values for each of the four color tokens in light and dark. Suggestion: near-white / near-black backgrounds, slightly muted foreground, single accent.
- Accent color — does Jalo have a preference, or stay greyscale + one neutral accent for v1?
