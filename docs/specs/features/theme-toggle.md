# Theme Toggle — Implementation Spec

## Goal
Three-state toggle (light / dark / system), persisted, that respects OS preference in system mode.

## Requirements covered
- §FR-1.3.1 — Toggle with `localStorage` persistence and anti-flicker.
- §FR-1.3.5 — No UI library; implementation is by hand.

## File layout
- `src/components/ThemeToggle.tsx` — the button (rendered inside Header).
- `src/lib/useTheme.ts` — hook + helpers.
- `src/index.html` — inline anti-flicker `<script>` in `<head>`.

## Behavior & edge cases
- Default on first load (no `localStorage["theme"]`): `system`. The OS dark preference resolves on mount.
- Toggle order: `light → dark → system → light`. `aria-label` reflects the **next** state ("Switch to dark", "Switch to system", "Switch to light").
- `localStorage["theme"]` stores the choice. Absence ⇒ `system`.
- Anti-flicker `<script>` (in `src/index.html` `<head>`, before the React script):

  ```html
  <script>
    (function () {
      try {
        var c = localStorage.getItem("theme") || "system";
        var d = c === "dark" || (c === "system" &&
          window.matchMedia("(prefers-color-scheme: dark)").matches);
        document.documentElement.classList.toggle("dark", d);
      } catch (e) {}
    })();
  </script>
  ```

- The hook subscribes to `(prefers-color-scheme: dark)` `change` events so when the user is in `system` mode the page tracks OS changes.
- `globals.css` declares `@custom-variant dark (&:where(.dark, .dark *));` — Tailwind's `dark:` utilities key off `html.dark`.
- Button icon: SunIcon when resolved theme is light, MoonIcon when dark.

## Test plan
- **E2E**:
  - With empty `localStorage` and browser `colorScheme: "dark"`, `html.dark` is set before any user interaction.
  - With baseline-light: click toggle → `html.dark` is set → reload → `html.dark` persists.
  - Click two more times: `localStorage.theme === "system"`.

## Open questions
- Three icons (sun / moon / monitor) vs. two icons (sun in light, moon in dark) with `aria-label` disclosing system state. Default: two icons + aria-label.
