# Updates — v2.1.0 (2026-05-19)

A round of Lighthouse-driven polish: faster paints, accessible contrast, per-page browser metadata, and tighter security defaults.

## Improvements
- **Per-page browser metadata.** Each page now sets its own tab title and description, so browser tabs, bookmarks, and search results show the right page instead of a generic site title.
- **Quicker first paint.** The avatar reserves its space up front so the layout doesn't shift while it loads, and the production build no longer ships development-only code.
- **Readable text everywhere.** Work dates on the resume and the footer copyright now meet WCAG AA contrast in both light and dark themes.
- **Tighter security defaults.** Every response ships with a baseline set of security headers that harden the site against common browser-side attacks.

---

# Updates — v2 Spotlight redesign (2026-05-18)

The site has been redesigned around a multi-page structure inspired by the Tailwind Plus "Spotlight" template.

## New
- **Multi-page navigation.** The Home page now lives alongside dedicated About, Articles, Projects, and Uses pages — five places to land instead of one long scroll.
- **Theme toggle.** A button in the header switches between light, dark, and system themes. Your choice is remembered between visits.
- **Articles surface.** A reverse-chronological list of posts at `/articles`, each with its own page. The first post is a placeholder; more on the way.
- **Projects page.** A short list of side projects and infrastructure work, with logos and links.
- **Uses page.** A running inventory of the hardware, development tools, and productivity software I actually use.
- **About page.** A longer introduction with a portrait, a multi-paragraph bio, and links to GitHub, Instagram, LinkedIn, and email.
- **Resume timeline.** A compact work history on the Home page with a "Download CV" button.

## Improvements
- **Header with scaling avatar.** A fixed header is present on every route. On the Home page the avatar starts large and scales down as you scroll.
- **Zinc + red palette.** The site now uses a zinc base with a Chick-fil-A red accent. Backgrounds, text, and accent tones all shift between light and dark in lockstep.
- **No flash on load.** The right theme is applied before the page paints, so the site never flickers between light and dark on first load.
- **Deep links still work.** Sharing a link to any page opens that page directly; refreshes don't 404.
- **System fonts only — still.** No web fonts to download. The page renders the moment the HTML arrives.
- **Mobile menu.** On narrow screens the navigation collapses into a tap-to-open menu.

---

# Updates — v1 (2026-05-18)

moster.dev is live. This is the initial release.

## New
- **The site is live at moster.dev.** A single-page portfolio with a sticky top nav linking to Writing, About, and Contact.
- **Hero introduction.** "Hi, I'm Jalo and I'm a Software Engineer at Chick-fil-A. It's my pleasure to invite you into my portfolio."
- **Writing section.** A placeholder for the first post — more to come.
- **About section.** A short introduction.
- **Contact section.** Reach Jalo directly at jalo@moster.dev.
- **Dark mode.** The site automatically follows your operating system's light or dark setting.
- **Deep links work.** Sharing a link to any section opens the site to the right place.

## Improvements
- **Loads fast.** The site uses your device's built-in fonts, so nothing extra has to download before the page renders.
- **Readable typography.** Generous line height and a comfortable reading width keep things easy on the eyes.
