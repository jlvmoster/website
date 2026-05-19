# Iconography — Implementation Spec

## Goal
Single inline-SVG catalog. No `@heroicons/react`, no `lucide-react`.

## Requirements covered
- §FR-1.3.5 — No UI library.

## File layout
- `src/components/icons.tsx` — single file, one named export per glyph.

## Behavior & edge cases
- Each icon is a function component accepting `React.ComponentPropsWithoutRef<"svg">`.
- Each icon sets `aria-hidden="true"` and uses `currentColor` for `fill` or `stroke` so Tailwind text utilities tint them.
- Catalog (copy SVG paths verbatim from Spotlight `src/components/SocialIcons.tsx` and the inline glyphs in `src/components/Header.tsx`, `src/components/Card.tsx`, `src/app/articles/[slug]/page.tsx`, `src/app/projects/page.tsx`):
  - `GitHubIcon`
  - `InstagramIcon`
  - `LinkedInIcon`
  - `XIcon`
  - `MailIcon`
  - `BriefcaseIcon`
  - `ArrowDownIcon`
  - `ArrowLeftIcon`
  - `SunIcon`
  - `MoonIcon`
  - `ChevronRightIcon`
  - `ChevronDownIcon`
  - `CloseIcon`
  - `LinkIcon`

## Test plan
- **Smoke**: each icon renders without throwing (one-line render test per icon).

## Open questions
- None.
