# Footer — Implementation Spec

## Goal
Persistent footer on every route with NavLinks and a copyright line.

## Requirements covered
- §FR-1.1.9 — Footer present on every route.

## File layout
- `src/components/Footer.tsx`.

## Behavior & edge cases
- Wraps in `<ContainerOuter><ContainerInner>` (Spotlight pattern, no `<Container>` shortcut).
- NavLinks: About / Articles / Projects / Uses. No Speaking. No Contact (mailto lives in About column).
- Top border: `border-t border-zinc-100 dark:border-zinc-700/40`.
- Layout: `flex flex-col items-center justify-between gap-6 md:flex-row` — NavLinks left, copyright right on desktop; stacked on mobile.
- Copyright string: `© {new Date().getFullYear()} Jalo Moster. All rights reserved.` Year evaluates at render time.

## Test plan
- **E2E**: footer visible on `/`, `/about`, `/articles`, `/articles/:slug`, `/projects`, `/uses`. Each NavLink href matches the expected route.

## Open questions
- Copyright wording: `Jalo Moster` (full name) vs. `Jalo` (first name only). Default: full name.
