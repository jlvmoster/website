# Task 05 — Nav & section components

## Goal
Replace the stubs from Task 04 with real `Nav`, `Hero`, `Writing`, `About`, and `Contact` components. Each is its own file under `src/components/` so it can be lifted to a route later.

## Source specs
- [`features/nav.md`](../specs/features/nav.md)
- [`features/hero.md`](../specs/features/hero.md)
- [`features/writing.md`](../specs/features/writing.md)
- [`features/about.md`](../specs/features/about.md)
- [`features/contact.md`](../specs/features/contact.md)
- Requirements: §FR-1.1.2–§FR-1.1.4, §FR-1.2.1–§FR-1.2.4

## Prereqs
- Task 03 (tokens + `font-sans` available).
- Task 04 (App shell with stub imports in place).

## Hard rule
**Hero copy is verbatim**, including "my pleasure":

> Hi, I'm Jalo and I'm a Software Engineer at Chick-fil-A. It's my pleasure to invite you into my portfolio.

Do not paraphrase. The phrase is a deliberate Chick-fil-A tie-in.

## Steps

1. **Invoke the `frontend-design` skill before writing component code.** It produces distinctive, non-generic components that fit the minimal aesthetic. Pass it the resolved color tokens (Task 03), typography, and the per-section feature specs.
2. **`src/components/Nav.tsx`** — sticky top, text-only anchor links to `#hero`, `#writing`, `#about`, `#contact` in that order. Use CSS `scroll-behavior: smooth` on `html` (in `globals.css`) rather than JS. No hamburger; if narrow viewports crowd, use a horizontal scroll row.
3. **`src/components/Hero.tsx`** — `<section id="hero">` with the verbatim copy as a single string literal (no templating, no i18n indirection). Three social links to the URLs in §FR-1.2.1.b, each `target="_blank" rel="noopener noreferrer"`. Inline SVG icons (no icon library), each with `aria-label`.
4. **`src/components/Writing.tsx`** — `<section id="writing">` with a heading ("Writing") and an empty-state line as a single child JSX block so swapping to `<PostList />` later is a one-spot edit. Default copy: "First post coming soon."
5. **`src/components/About.tsx`** — `<section id="about">` with a `<p>` (or two short ones) containing role ("Software Engineer at Chick-fil-A"), location, and a one-line current focus. Wrapped in `.prose` (or equivalent) so the 65ch cap from Task 03 applies.
6. **`src/components/Contact.tsx`** — `<section id="contact">` with a `mailto:jalo@moster.dev` anchor in its own subcomponent / clearly demarcated block, so the v2 swap to `<ContactForm action="/api/contact">` is a one-spot edit.
7. **Update `src/App.tsx`** to import the real components (the imports already exist from Task 04 — just delete the stub bodies in `src/components/*.tsx` and write the real ones).

## Outputs
- Rewritten: `src/components/{Nav,Hero,Writing,About,Contact}.tsx`.
- Possibly: small `globals.css` additions (e.g., `html { scroll-behavior: smooth; }`).

## Verification
- `bunx tsc --noEmit` passes.
- `bun run dev` (after Task 06) renders all four sections with the four nav anchors.
- Manual: click each nav link, target section scrolls into view.

## Open questions to surface
- **Nav**: include a "Jalo" wordmark on the left? Default: no. Background treatment when sticky over content — solid, semi-transparent with backdrop-blur, or hairline border only? Default: hairline border + token bg.
- **About**: location to display (city/region or omit)? One-line current-focus framing?
- **Contact**: subject line in the `mailto:` (`?subject=…`) or no preset? Default: no preset.
- **Writing**: empty-state copy — keep "First post coming soon." or something less placeholder-y?
