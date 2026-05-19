# Hero — Implementation Spec

## Goal
Top-of-page section that introduces Jalo with a fixed one-line copy and three social links.

## Requirements covered
- §FR-1.2.1 — Hero renders name, one-line bio, and primary links.
- §FR-1.2.1.a — Copy verbatim: *"Hi, I'm Jalo and I'm a Software Engineer at Chick-fil-A. It's my pleasure to invite you into my portfolio."* "my pleasure" is non-negotiable.
- §FR-1.2.1.b — Three social links to `github.com/jlvmoster`, `instagram.com/jlvmoster`, `linkedin.com/in/jlvmoster`.
- §FR-1.1.3 — Implemented as its own component for future route-lifting.

## File layout
- `src/pages/HomePage.tsx` — composes the Hero block (inline JSX, no separate component) along with Articles preview and Resume.
- (Optional) `src/components/home/Hero.tsx` if the inline block grows past ~30 lines.
- Container wrapping: `<Container className="mt-9">`.

## Behavior & edge cases
- Copy is a single string literal in the component — no templating, no i18n indirection. The verbatim constraint should be self-evident on inspection.
- Social links open in a new tab: `target="_blank" rel="noopener noreferrer"`.
- Icons are inline SVGs (no icon library — see §FR-1.3.5). Each link has accessible text or `aria-label`.
- Layout: links sit beneath the copy. Stacks on narrow viewports, inline on wide.
- Hero block is the first child of `HomePage.tsx`. The verbatim copy lives in `HomePage.tsx` as a string literal — the substring `"It's my pleasure"` must be present in the static markup so smoke tests (`renderToStaticMarkup`) detect it.
- The h1 is `text-4xl sm:text-5xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100`.
- The bio paragraph is `mt-6 text-base text-zinc-600 dark:text-zinc-400`.
- Social-links row sits below the bio, gap-x-6, hover transitions tint icons to `fill-zinc-600 dark:fill-zinc-300`.

## Test plan
- **Unit:** `Hero.test.tsx` renders the component and asserts the exact copy string appears in the DOM (substring match on `"It's my pleasure"` is sufficient as a regression guard).
- **E2E** (in `tests/e2e/site.spec.ts`): hero copy renders verbatim; each of the three social anchors has the correct `href`.

## Open questions
- Hero headline font: keep `font-serif` from v1 or switch to `font-sans` (Spotlight uses sans). Default: switch to sans for visual consistency with the rest of the Spotlight aesthetic.
