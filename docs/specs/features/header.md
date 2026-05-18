# Header — Implementation Spec

## Goal
Fixed header on every route showing avatar (scaling on Home), desktop nav pill, mobile popover, and theme toggle.

## Requirements covered
- §FR-1.1.2 — Header is the navigation surface.
- §FR-1.1.5 — Routes are navigated from the NavLinks.
- §FR-1.1.8 — Avatar scales 64→36 on Home, static at 36 elsewhere.
- §FR-1.3.1 — Theme toggle button lives here.
- §FR-1.3.5, §FR-1.3.8 — No UI library; scroll math via CSS custom properties.

## File layout
- `src/components/Header.tsx` — composes Avatar, NavPill, ThemeToggle, MobileNavigation.
- `src/components/Avatar.tsx` — Avatar + AvatarContainer (forwardRef).
- `src/components/ThemeToggle.tsx` — sun/moon button cycling light → dark → system.
- `src/components/MobileNavigation.tsx` — handwritten popover.
- `src/components/icons.tsx` — Sun/Moon/ChevronDown/Close icons used here.
- `src/lib/useTheme.ts` — choice/persist/apply hook.

## Behavior & edge cases
- On `/` (home), the avatar starts at 64×64 in the page flow above the nav pill; on every other route, it sits at 36×36 inside the pill.
- Scroll math runs only on `/`. A `useEffect` reads `useLocation()`; if path is `/`, it attaches a `scroll` listener that writes CSS custom properties on `document.documentElement` (`--avatar-image-transform`, `--avatar-border-transform`, `--header-height`, `--header-mb`, `--content-offset`). The Avatar element reads those via `style="transform: var(--avatar-image-transform)"`. No React re-renders per scroll tick.
- Listeners are passive; cleanup on unmount/route change.
- Desktop (≥`md`) nav pill: `rounded-full bg-white/90 px-3 text-sm font-medium text-zinc-800 ring-1 ring-zinc-900/5 backdrop-blur-sm dark:bg-zinc-800/90 dark:text-zinc-200 dark:ring-white/10`. Contains four NavLinks (About / Articles / Projects / Uses).
- Active route highlight: matching NavLink has `text-teal-500 dark:text-teal-400` and a faint gradient underline (`bg-linear-to-r from-teal-500/0 via-teal-500/40 to-teal-500/0`).
- Mobile (<`md`): a "Menu" pill button replaces the nav pill. Clicking opens a popover panel containing the same four NavLinks and a close button. Close on Esc (`useEffect` keydown), close on backdrop click, close on NavLink click.
- Theme toggle: single button cycling `light → dark → system → light`. Shows SunIcon when current resolved theme is light, MoonIcon when dark. `aria-label` reflects the **next** state.

## Test plan
- **Smoke** (`renderToStaticMarkup(<Header />)` inside `<MemoryRouter initialEntries={["/about"]}>`): asserts three NavLinks render with correct hrefs.
- **E2E**:
  - `/`: scroll 400px; avatar `getBoundingClientRect().width` ≤ 40 (shrunk).
  - Each route: active NavLink has class containing `teal-500` or `teal-400`.
  - Theme toggle: click once on baseline-light; `html` has class `dark`. Reload; class persists. Click twice more; `localStorage.theme` is `system`.
  - Mobile (viewport 360x800): Menu button visible; click opens popover; Esc closes it.

## Open questions
- Active-route underline: gradient (default) vs. solid teal border.
- Mobile breakpoint: `md` (768px) — Spotlight default. Confirm or pick `lg`.
- Theme toggle UX: three-state cycle (default) vs. two-state + separate "follow system" sub-menu.
