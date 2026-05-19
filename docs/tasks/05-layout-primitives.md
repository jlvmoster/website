# Task 05 — Layout primitives

## Goal
Create the Spotlight primitive components used by every page: Container compound, LayoutShell, Card compound, Button, SimpleLayout, Section, Prose, the icon catalog, plus `formatDate` and `clsx` helpers.

## Source spec
- [`features/layout-shell.md`](../specs/features/layout-shell.md)
- [`features/iconography.md`](../specs/features/iconography.md)
- Architecture: §4.5, §4.6, §4.10, §4.11

## Prereqs
- Task 04 (router + LayoutShell stub in place).

## Steps

1. **Create `src/lib/clsx.ts`** (or `bun add clsx` per the open question in Task 01).
2. **Create `src/lib/formatDate.ts`** — verbatim Spotlight shape:
   ```ts
   export function formatDate(dateString: string) {
     return new Date(`${dateString}T00:00:00Z`).toLocaleDateString("en-US", {
       day: "numeric", month: "long", year: "numeric", timeZone: "UTC",
     });
   }
   ```
3. **Create `src/components/Container.tsx`** — Outer, Inner, composed Container (canonical shape in `architecture.md` §4.6).
4. **Create `src/components/icons.tsx`** — paste SVG paths from Spotlight `src/components/SocialIcons.tsx` and inline glyphs. 14 named exports per `features/iconography.md`.
5. **Create `src/components/Card.tsx`** — compound `Card` with `.Title`, `.Description`, `.Eyebrow`, `.Cta`, `.Link` (lift from Spotlight `src/components/Card.tsx`; swap `next/link`'s `Link` for `react-router-dom`'s `Link`; for external `href` (starts with `http`) render `<a target="_blank" rel="noopener noreferrer">`).
6. **Create `src/components/Button.tsx`** — primary/secondary variants (lift from Spotlight `src/components/Button.tsx`). Use `Link` only for in-app route hrefs; render a plain `<a>` for external URLs, static assets such as `/cv.pdf`, or `download` links.
7. **Create `src/components/SimpleLayout.tsx`** — title + intro + body in a `Container` (lift from Spotlight `src/components/SimpleLayout.tsx`).
8. **Create `src/components/Section.tsx`** — left-bordered title + children grid using `useId()` (lift from Spotlight `src/components/Section.tsx`).
9. **Create `src/components/Prose.tsx`** — `<div className="prose dark:prose-invert">`.
10. **Rewrite `src/components/LayoutShell.tsx`** to the real shape (canonical in `architecture.md` §4.5). Wire it into `App.tsx`.

## Outputs
- New: 9 files under `src/components/` + 2 under `src/lib/`.

## Verification
- `bunx tsc --noEmit` passes.
- `bun run dev` renders the panel background on every route. Pages still show stub h1 bodies (until Tasks 07–09).

## Open questions
- See `features/tooling.md` for `clsx` source (npm vs. inline).
