# Hero — Implementation Spec

## Goal
Top-of-page section that introduces Jalo with a fixed one-line copy and three social links.

## Requirements covered
- §FR-1.2.1 — Hero renders name, one-line bio, and primary links.
- §FR-1.2.1.a — Copy verbatim: *"Hi, I'm Jalo and I'm a Software Engineer at Chick-fil-A. It's my pleasure to invite you into my portfolio."* "my pleasure" is non-negotiable.
- §FR-1.2.1.b — Three social links to `github.com/jlvmoster`, `instagram.com/jlvmoster`, `linkedin.com/in/jlvmoster`.
- §FR-1.1.3 — Implemented as its own component for future route-lifting.

## File layout
- `src/components/Hero.tsx` — the section component.
- Imported as the first child in `src/App.tsx`.

## Behavior & edge cases
- Section element has `id="hero"` so the nav anchor (`#hero`) resolves.
- Copy is a single string literal in the component — no templating, no i18n indirection. The verbatim constraint should be self-evident on inspection.
- Social links open in a new tab: `target="_blank" rel="noopener noreferrer"`.
- Icons are inline SVGs (no icon library — see §FR-1.3.5). Each link has accessible text or `aria-label`.
- Layout: links sit beneath the copy. Stacks on narrow viewports, inline on wide.

## Test plan
- **Unit:** `Hero.test.tsx` renders the component and asserts the exact copy string appears in the DOM (substring match on `"It's my pleasure"` is sufficient as a regression guard).
- **E2E** (in `tests/e2e/site.spec.ts`): hero copy renders verbatim; each of the three social anchors has the correct `href`.

## Open questions
- None.
