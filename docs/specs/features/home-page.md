# Home Page — Implementation Spec

## Goal
The `/` route. Hero (verbatim copy + three social links) + 4 most-recent article cards + Resume timeline + Download CV.

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
- Hero block: `<Container className="mt-9">` wraps `<h1>` (Spotlight headline copy can sit above this — see open question) + `<p>` (verbatim bio) + social row.
- Hero copy: the substring `"It's my pleasure to invite you into my portfolio."` must appear in the static markup of `HomePage.tsx` as a literal — no template, no concat, no i18n.
- Social row: GitHub, Instagram, LinkedIn (X is omitted — Jalo has three socials). Each is a `<SocialLink>` opening in a new tab.
- Body grid: `mt-24 md:mt-28 grid max-w-xl grid-cols-1 gap-y-20 lg:max-w-none lg:grid-cols-2`. Left column: `<getAllArticles().slice(0, 4).map(a => <ArticleCard key={a.slug} article={a} />)>`. Right column: `<Resume />`.
- Resume: array of `{ company, title, logo, start, end }` from `src/content/resume.ts`. Each row: logo disc + company/title/dates. Button: `<Button href="/cv.pdf" variant="secondary" download>Download CV <ArrowDownIcon /></Button>` so the PDF is fetched as a static asset rather than handled by the client router.
- No newsletter signup.

## Test plan
- **Smoke** (`bun test`): `renderToStaticMarkup(<HomePage />)` (inside MemoryRouter) contains the verbatim hero substring, three social URLs, and four `article` elements.
- **E2E**: Resume renders ≥ 1 row with the canonical job entries; "Download CV" link resolves to `/cv.pdf`.

## Open questions
- Hero headline copy: Spotlight uses a name + role line above the bio. Default: keep just the verbatim §FR-1.2.1.a sentence.
- Hero h1 typeface: `font-serif` (v1 flavor) vs. `font-sans` (Spotlight). Default: sans.
- Resume content (companies, titles, dates). User to provide.
- Whether to ship `XIcon` even though Home doesn't render it. Default: include in `icons.tsx` for future use, don't render on Home.
