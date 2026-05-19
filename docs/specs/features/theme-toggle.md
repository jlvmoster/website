# Theme Toggle — Implementation Spec

## Goal
Spotlight-style two-state toggle that switches between the resolved light and dark themes, persists the explicit choice, and respects OS preference by default.

## Requirements covered
- §FR-1.3.1 — Toggle with `localStorage` persistence and anti-flicker.
- §FR-1.3.5 — No UI library; implementation is by hand.

## File layout
- `src/components/ThemeToggle.tsx` — the button (rendered inside Header).
- `src/lib/useTheme.ts` — hook + helpers.
- `src/index.html` — inline anti-flicker `<script>` in `<head>`.

## Behavior & edge cases
- Default on first load (no `localStorage["theme"]`): `system`. The OS dark preference resolves on mount.
- Toggle behavior: click switches to the opposite resolved theme (`light ↔ dark`). `aria-label` reflects that next explicit state ("Switch to dark theme" or "Switch to light theme").
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
- Button icon: both SunIcon and MoonIcon are always rendered, matching the Spotlight template; `dark:` CSS visibility controls which icon appears.

## Test plan
- **E2E**:
  - With empty `localStorage` and browser `colorScheme: "dark"`, `html.dark` is set before any user interaction.
  - With baseline-light: click toggle → `html.dark` is set → reload → `html.dark` persists.
  - With baseline-dark: click toggle → `html.dark` is removed and `localStorage.theme === "light"`.

## Open questions
- Whether to add a separate "follow system" control later. Default: Spotlight-style two-state button.
