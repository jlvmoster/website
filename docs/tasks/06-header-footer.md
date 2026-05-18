# Task 06 — Header & Footer

## Goal
Implement the fixed Header (avatar scroll on Home, desktop nav pill, mobile popover, theme toggle) and Footer (NavLinks + copyright), wire both into LayoutShell.

## Source spec
- [`features/header.md`](../specs/features/header.md)
- [`features/footer.md`](../specs/features/footer.md)
- [`features/theme-toggle.md`](../specs/features/theme-toggle.md)
- Architecture: §4.7, §4.8

## Prereqs
- Task 05 (primitives and LayoutShell ready).

## Steps

1. **Drop `public/images/avatar.jpg`** (user provides). Until then, a placeholder is fine.
2. **Create `src/lib/useTheme.ts`** (canonical hook from `architecture.md` §4.8).
3. **Create `src/components/Avatar.tsx`** — Avatar + AvatarContainer (forwardRef so the Header can read positions).
4. **Create `src/components/ThemeToggle.tsx`** — single button cycling light → dark → system → light. Use SunIcon/MoonIcon. `aria-label` reflects next state.
5. **Create `src/components/MobileNavigation.tsx`** — handwritten popover (no `@headlessui/react`). Backdrop, panel, Esc key handler, click-to-close.
6. **Create `src/components/Header.tsx`**:
   - Reads `useLocation()`; on `/`, attaches a passive scroll listener that writes CSS custom properties on `document.documentElement`. Cleanup on path change.
   - Desktop (≥`md`): nav pill with NavLinks for About / Articles / Projects / Uses + ThemeToggle.
   - Mobile (<`md`): "Menu" button → MobileNavigation popover.
   - Avatar: 64×64 on Home (large), 36×36 in pill elsewhere.
7. **Create `src/components/Footer.tsx`** — ContainerOuter/Inner, NavLinks (About / Articles / Projects / Uses), copyright `© {new Date().getFullYear()} Jalo Moster. All rights reserved.`.
8. **Update `src/components/LayoutShell.tsx`** to render `<Header />` and `<Footer />` (replace any temporary stubs).

## Outputs
- New: 6 files under `src/components/` + 1 under `src/lib/`.

## Verification
- `bunx tsc --noEmit` passes.
- `bun run dev`:
  - Header visible on every route.
  - Theme toggle: click cycles `html.dark`; refresh persists.
  - On `/`, scrolling shrinks the avatar.
  - Resize to mobile (DevTools): Menu button appears; click opens popover; Esc closes.
- Hero copy assertion still passes (v1 Hero is still rendered inside `HomePage` until Task 07).

## Open questions
- Active-route highlight style: gradient underline (default) vs. solid border.
