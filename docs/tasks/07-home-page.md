# Task 07 — Home page

## Goal
Replace the temporary v1 Hero rendering with the full Spotlight Home composition: Hero (verbatim copy + three socials) + Photos strip + 4 article cards + Resume timeline + Download CV button.

## Source spec
- [`features/home-page.md`](../specs/features/home-page.md)
- [`features/hero.md`](../specs/features/hero.md)

## Prereqs
- Task 06 (Header + Footer wired).
- User-provided assets: `public/images/photos/image-{1..5}.jpg`, `public/images/logos/*.svg`, `public/cv.pdf`.

## Steps

1. **Drop the user-provided assets** into `public/images/photos/`, `public/images/logos/`, and `public/cv.pdf`.
2. **Create `src/content/resume.ts`** — typed `Role[]` (companies/titles/logos/dates provided by user).
3. **Create `src/components/home/Photos.tsx`** — five rotated `<img>` elements.
4. **Create `src/components/home/Resume.tsx`** — work timeline with logos, dates, "Download CV" button (`<Button href="/cv.pdf" variant="secondary">`).
5. **Create `src/components/home/ArticleCard.tsx`** — Card variant tailored to the Home grid (Eyebrow date, Title link to `/articles/<slug>`, Description, Cta).
6. **Rewrite `src/pages/HomePage.tsx`**:
   - Hero block inline: `<Container className="mt-9">` containing the verbatim §FR-1.2.1.a copy in a `<p>` and three `<SocialLink>` icons (GitHub, Instagram, LinkedIn).
   - `<Photos />`.
   - Two-column grid: 4 most-recent article cards (left) + `<Resume />` (right).
7. **Delete the v1 components**: `src/components/Hero.tsx`, `Writing.tsx`, `About.tsx`, `Contact.tsx`, `Nav.tsx`. They're no longer referenced.

## Outputs
- Edited: `src/pages/HomePage.tsx`.
- New: `src/content/resume.ts`, `src/components/home/Photos.tsx`, `src/components/home/Resume.tsx`, `src/components/home/ArticleCard.tsx`.
- Deleted: v1 components listed above.

## Verification
- `bun test` smoke: `renderToStaticMarkup(<HomePage />)` contains the verbatim hero substring and the three social URLs.
- `bun run dev`: Home renders the full Spotlight layout. The three socials open the right URLs in a new tab. "Download CV" downloads `/cv.pdf`.

## Open questions
- See `features/home-page.md` (h1 typeface, headline copy).
