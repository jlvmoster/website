# Contact — Implementation Spec

## Goal
A simple way to reach Jalo via email, structured to be replaceable with a server-backed form later.

## Requirements covered
- §FR-1.2.4 — `mailto:` link in v1; designed for `/api/contact` swap later.
- §GP-3.2 — Future contact form / newsletter via `src/worker.ts`.

## File layout
- `src/components/Contact.tsx`.
- Imported as the last section in `src/App.tsx`.

## Behavior & edge cases
- Section element has `id="contact"`.
- Renders a `mailto:` anchor — default to `jalo@moster.dev`.
- The interactive element (the `<a>`) lives in its own subcomponent or clearly demarcated JSX block so the v2 swap to `<ContactForm action="/api/contact">` is a one-spot edit.
- No JS form handling, no analytics tracking, no third-party widgets in v1.

## Test plan
- **Unit:** renders an anchor with `href="mailto:jalo@moster.dev"`.
- **E2E:** the mailto link is present with the expected `href`.

## Open questions
- Subject line in the mailto (`?subject=…`) or no preset?
