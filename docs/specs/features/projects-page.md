# Projects Page — Implementation Spec

## Goal
`/projects` SimpleLayout + three-column grid of project cards.

## Requirements covered
- §FR-1.2.6 — Projects page.
- §FR-1.1.5 — Route registered.

## File layout
- `src/pages/ProjectsPage.tsx`.
- `src/content/projects.ts` — typed `Project[]`.
- `public/images/logos/*.svg` — logos referenced by `project.logo` (string URL).

## Behavior & edge cases
- `Project` type: `{ name: string; description: string; link: { href: string; label: string }; logo: string }` where `logo` is a string URL (e.g. `/images/logos/example.svg`).
- Page layout: `<SimpleLayout title="…" intro="…">` then `<ul className="grid grid-cols-1 gap-x-12 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">`.
- Each card: `<Card as="li">` containing:
  - Logo disc (`flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-md ring-1 ring-zinc-900/5 dark:border dark:border-zinc-700/50 dark:bg-zinc-800 dark:ring-0`).
  - `<img src={project.logo} alt="" className="h-8 w-8">` inside the disc.
  - `<Card.Title as="h2" href={project.link.href}>{project.name}</Card.Title>` — external link, `target="_blank" rel="noopener noreferrer"`.
  - `<Card.Description>{project.description}</Card.Description>`.
  - `<p className="relative z-10 mt-6 flex text-sm font-medium text-zinc-400 transition group-hover:text-teal-500 dark:text-zinc-200">` containing `<LinkIcon className="h-6 w-6 flex-none" />` + `<span className="ml-2">{project.link.label}</span>`.
- External links: `target="_blank" rel="noopener noreferrer"`.

## Test plan
- **E2E**: at least one project card renders; each project's external link href matches the data.

## Open questions
- Initial project list. User to provide.
- Title + intro copy. User to provide.
