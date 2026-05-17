# About — Implementation Spec

## Goal
A short paragraph covering current role, focus, and location.

## Requirements covered
- §FR-1.2.3 — Short paragraph, current focus, location.
- §FR-1.3.4 — Prose blocks capped at ~65ch.

## File layout
- `src/components/About.tsx`.
- Imported into `src/App.tsx` between Writing and Contact.

## Behavior & edge cases
- Section element has `id="about"`.
- Single `<p>` (or two short ones) with `max-width: 65ch` and the prose line-height set by `globals.css`.
- Content includes: current role ("Software Engineer at Chick-fil-A"), location, and a one-line current focus.
- No images in v1.

## Test plan
- **Unit:** renders the paragraph element with the expected role string.
- **E2E:** section is visible; "Chick-fil-A" substring present (regression guard so the role doesn't quietly drift).

## Open questions
- Location to display (city/region or omit)?
- Current-focus copy — what's the one-line framing?
