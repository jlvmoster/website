# Nav — Implementation Spec

## Goal
A sticky, minimal nav bar with in-page anchor links to each of the four sections.

## Requirements covered
- §FR-1.1.2 — Navigation between sections uses in-page anchor links in a sticky/minimal nav.
- §FR-1.1.4 — No client-side routing library yet; anchors only.

## File layout
- `src/components/Nav.tsx`.
- Mounted at the top of `src/App.tsx`, above the section components.

## Behavior & edge cases
- Sticky to the top of the viewport (`position: sticky; top: 0`) with a subtle backdrop so text remains legible over content scrolling underneath.
- Anchor links to `#hero`, `#writing`, `#about`, `#contact` — order matches section order.
- Smooth scroll: rely on CSS `scroll-behavior: smooth` on `html` rather than JS.
- Minimal styling: text-only links, no logo, no icons. Active section indicator is *not* required for v1.
- On narrow viewports the four links should still fit comfortably. If they crowd, switch to a horizontal scroll row rather than introducing a hamburger menu (keeps the component free of toggle state).

## Test plan
- **Unit:** renders four anchor elements with the expected `href`s in order.
- **E2E:** clicking each link scrolls the page so the target section is in view (Playwright `expect(locator).toBeInViewport()`).

## Open questions
- Should the nav include the name "Jalo" / a brand mark on the left? Default: no, keep it just the four links.
- Background treatment when sticky over content — solid, semi-transparent with backdrop-blur, or a hairline border-bottom only?
