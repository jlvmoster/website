# Home Page — Implementation Spec

## Goal
The `/` route. Brand-first Hero (name headline + role line + verbatim bio + socials including quiet mailto) + a labeled Writing column (heading + “View all” + 4 most-recent article cards) + Resume timeline + Download CV.

## Requirements covered
- §FR-1.2.1, §FR-1.2.1.a, §FR-1.2.1.b — Hero copy verbatim, three socials.
- §FR-1.2.5 — Home page composition.
- §FR-1.2.8 — Articles preview reads `getAllArticles()`.

## File layout
- `src/pages/HomePage.tsx` — composes Hero JSX inline, ArticleCard grid, Resume.
- `src/components/home/Resume.tsx` — work timeline with logos, dates, "Download CV" button.
- `src/components/home/ArticleCard.tsx` — Card variant tailored to the Home grid.
- `src/content/resume.ts` — typed `Role[]`.
- `public/images/avatar.jpg`, `public/images/logos/*.svg`, `public/cv.pdf`.

## Behavior & edge cases
- Hero block: `<Container className="mt-9">` wraps brand-first `<h1>` (name) + role line + `<p>` (verbatim bio) + social row.
- Hero copy: the substring `"It's my pleasure to invite you into my portfolio."` must appear in the static markup of `HomePage.tsx` as a literal — no template, no concat, no i18n. Do not paraphrase that paragraph.
- Social row: GitHub, Instagram, LinkedIn, plus a quiet mailto icon (`aria-label="Email Jalo"`). HTTP socials open in a new tab; mailto does not.
- Body grid: `mt-20 md:mt-24` with a two-column Writing + Resume layout. Left column: `<h2>Writing</h2>` + `Link to="/articles"` (“View all”) + up to four `<ArticleCard>`s. Empty list still uses `<EmptyState>`. Right column: `<Resume />` with a soft zinc wash panel.
- Resume: array of `{ company, title, logo, start, end }` from `src/content/resume.ts`. Each row: logo disc + company/title/dates. Button: `<Button href="/cv.pdf" variant="secondary" download>Download CV <ArrowDownIcon /></Button>`.
- No newsletter signup.

## Test plan
- **Smoke** (`bun test`): `renderToStaticMarkup(<HomePage />)` (inside MemoryRouter) contains the verbatim hero substring, the role line, name `<h1>`, three social URLs + mailto, the Writing `<h2>`, Home article titles as `<h3>`, a `Link` to `/articles` labeled “View all” with `focus-visible:text-accent`, and Footer “Back to top”.
- **E2E**: Resume renders ≥ 1 row with the canonical job entries; "Download CV" link resolves to `/cv.pdf`. Home Writing heading is visible; “View all” navigates to `/articles` without a full reload. The “my pleasure” paragraph is unchanged.

## Open questions
- ~~Hero headline copy: Spotlight uses a name + role line above the bio.~~ **Resolved (ui-ux-overhaul):** name as `<h1>`, role as supporting line, verbatim bio below.
- Hero h1 typeface: `font-serif` (v1 flavor) vs. `font-sans` (Spotlight). Default: sans.
- Resume content (companies, titles, dates). User to provide.
- Whether to ship `XIcon` even though Home doesn't render it. Default: include in `icons.tsx` for future use, don't render on Home.
