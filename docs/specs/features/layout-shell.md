# LayoutShell — Implementation Spec

## Goal
The fixed centered background panel + flex content column (Header / main / Footer). Every page renders into the shell.

## Requirements covered
- §FR-1.1.8, §FR-1.1.9 — Header + Footer present on every route.
- §FR-1.3.6 — `--panel` and `--ring` tokens drive panel chrome.

## File layout
- `src/components/LayoutShell.tsx` — composes the panel + Header + main + Footer.
- `src/components/Container.tsx` — ContainerOuter, ContainerInner, composed Container.

## Behavior & edge cases
- Body uses `bg-bg dark:bg-bg` (zinc-50 / zinc-950) — the page-behind-the-panel color. Set on `<body>` via the body rule in `globals.css`.
- The panel is a fixed sibling layer:
  - Outer: `fixed inset-0 flex justify-center sm:px-8`.
  - Middle: `flex w-full max-w-7xl lg:px-8`.
  - Inner: `w-full bg-[var(--panel)] ring-1 ring-[var(--ring)]`.
- Content column is `relative flex w-full flex-col`. Wraps Header / `<main className="flex-auto">{children}</main>` / Footer.
- Container compound (Outer + Inner + composed Container) is used by SimpleLayout and individual pages.
- `forwardRef` is required on Container components so Header's scroll math can capture an offset.

## Test plan
- **E2E**: panel sibling element is in DOM with the expected `--panel` background color (read computed style). Header and Footer render. `main` has non-zero `clientHeight`.

## Open questions
- None.
