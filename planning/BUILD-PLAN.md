# Prototype → Site: Phased Build Plan

> Last updated: 2026-07-16
> Status: Phase 5 complete · Phase 6 next
> Companion to [ARCHITECTURE.md](./ARCHITECTURE.md)

---

## Decisions locked before building

| Question | Choice |
|---|---|
| Routing | **Real URLs per section** (`/about`, `/experience`, `/design`, `/contact`, `/projects/[slug]`, `/design/[slug]`) — not the prototype's single-page view swap |
| Content | **Hybrid** — typed TS data in `src/content/` for structured lists; MDX for long-form case studies |
| Contact | **Links only** (email/LinkedIn/GitHub/resume); empty `api/contact` kept for a future form |
| Animation | CSS transitions + canvas rAF ported from the prototype; **Motion v12 only for route cross-fades** |
| Sequencing | **Phased, with a visual browser checkpoint after each phase** |

The prototype's single-page cross-fade feel is recreated on real routes by: the
background canvas wash lerping between per-view color moods + a Motion
cross-fade between pages.

---

## Architecture conventions (set in Phase 1, reused everywhere)

- **`src/lib/canvas/`** — the shared background FX engine, split into pure,
  unit-testable logic (`wash`, `particles`, `radial` geometry) + a thin
  canvas/rAF shell (`engine`, `draw`). One engine instance lives for the whole
  session via `FxProvider`; routes only change its wash mood.
- **`src/content/`** — all copy/data lives here as typed files, never hard-coded
  in components. "Edit content = edit one file."
- **`src/components/sections/`** — one component per page section.
- **`src/components/layout/`** — app shell (provider, canvas, header, transitions, panel).
- **`src/components/ui/`** — small reusable primitives (star, back-link).
- **Verify every phase:** `npm run test` · `npm run typecheck` · `npm run lint`
  · `npm run build`, then a manual browser checkpoint before moving on.

---

## Phases

### ✅ Phase 1 — Foundation
Fonts (Parisienne / Cormorant / Hanken via `next/font`), theme tokens, the
background canvas engine (washes, wispy ribbon, sparkle cursor, ambient sparks,
bursts, shooting stars), route→view mapping, Motion route cross-fades, the
constellation-garden home (name + rotating subtitle + 4 floating stars), and the
top chrome (J monogram + radial bloom nav). Styled 404 + section stubs.

### ✅ Phase 2 — About
`/about` — "Hello!" headline with the interactive kaomoji (hover-pink + click
sparkle burst), bio with `**bold**`, portrait (real headshot wired), skill
chips, highlight cards. Added shared `PagePanel` (section-enter animation),
`BackLink`, and the `**bold**` emphasis parser.

### ✅ Phase 3 — Experience + project detail
- `/experience` — the "growing stem" vine timeline: one continuous gradient stem
  (green → pink → lavender), bloom medallions per section (Work / Leadership /
  Projects), entries as open ledger rows, staggered reveal, scroll-driven wash
  shifts. Entries from typed data (`src/content/experience.ts`).
- `/projects/[slug]` — field-notes case-study page, per-project data in
  `src/content/projects/index.ts` + empty MDX body per project. **MDX pipeline
  set up** (`@next/mdx`, `mdx-components.tsx`, `bodies.ts` import map).
- 5 projects scaffolded (Before I Go, Blowfish Budgeting, Draftly, Murphy's Lab,
  Where is Mr. Quack?) — awaiting real link URLs, images, and written prose.
- **Deviation:** dropped the prototype's 3-layout *toggle* (a design-exploration
  tool, not a visitor feature). Each project declares one `layout` in metadata
  (`notes` implemented; `editorial`/`rail` to add if a future project needs one).

### ✅ Phase 4 — Design gallery + piece detail
- `/design` — draggable polaroid wall (momentum, parallax depth, idle drift,
  data-driven boundary, hover straighten + caption) with an `explore ⁄ compact`
  toggle to a masonry grid; Instagram link. Pieces from typed data
  (`src/content/design/`), placeholders for now.
- `/design/[slug]` — piece detail (field-notes layout mirroring project detail),
  static-generated per piece.
- **Wall auto-layout:** positions are computed, not hand-placed — `layoutWall()`
  (`src/lib/design-wall.ts`) scatters pieces center-outward via seeded rejection
  sampling (deterministic, guaranteed non-overlapping, unit-tested). Adding a
  piece needs no coordinates; an optional per-piece `place` override art-directs.
- **Deviations from the original plan:**
  - Dropped the piece-detail **3-layout toggle** — single `notes` layout, no MDX
    (consistent with the Phase 3 project-detail call; a visitor page, not a
    design-exploration tool).
  - Removed the **medium filter chips** and simplified the wander hint (per user).

### ✅ Phase 5 — Contact
`/contact` — pink-and-green "say hello" letter: greeting cycles
hello → hi → chào → hola (each click launches a shooting star), links bloom in
staggered with draw-in underlines, email click-to-copy with a sparkle burst.
Two-column letter from typed `site.ts` (email/linkedin/github/resume + location).
- **Resume:** links to `/jasmine-tu-resume.pdf` — 404s until the PDF is dropped
  into `public/` (TODO noted in `site.ts`).
- **Instagram** intentionally NOT here (kept exclusive to Design).
- Backlog (not yet built): a greeting-cycle hint + other "fill the space" polish.

### ⏳ Phase 6 — Polish (in progress)
Done so far:
- **Mobile:** every section reworked for phones (experience stacks with a
  collapsible skills/certs toggle; design grid + wall; about reorder + star-stack
  highlights; contact left-aligned links). Tap feedback on touch (no hover) for
  home stars, contact greeting, and the kaomoji.
- **SEO / metadata:** root title template (`%s · Jasmine Tu`) + per-route titles
  and descriptions; branded 1200×630 **Open Graph / Twitter share card** generated
  with `next/og` (mirrors the home garden wash + ribbon); `sitemap.xml` (from the
  content arrays) + `robots.txt`; `metadataBase` from a resolved `siteUrl`.
- **Accessibility:** honor `prefers-reduced-motion` (freeze canvas washes/ribbon,
  drop sparkles/shooting-stars/parallax, rest home stars, stop tagline rotation);
  page-level `h1` on about + design; keyboard-operable greeting + kaomoji;
  on-brand focus-visible ring; deepened faint text tokens for contrast.
- **Cleanup:** removed the center sparkle burst on navigation (fade only) and
  pruned the dead burst code; synced `README`, `ARCHITECTURE.md`, and the content
  READMEs to the real (typed-registry + MDX-body) model.

Remaining:
- Favicon (Jasmine is designing it).
- Final full-verification sweep.
- **Content (not code):** `public/jasmine-tu-resume.pdf`; real artwork + copy for
  design pieces and project case studies.

---

## Deferred (post-launch, from the prototype's HANDOFF)
Real project case-study content · more design pieces + real artwork · easter-egg
layer (clover, dandelion, treble-clef chime, peeking cat) · custom logo · prune
any unused loaded fonts.

---

## Known deviations from the prototype
- **Responsive:** the prototype was desktop-only; each ported section collapses
  to a single column / usable layout on mobile.
- **Reduced motion:** route cross-fades respect `prefers-reduced-motion`.
- **Bad-URL 404:** typing a nonexistent path may full-page-load into the 404
  (Next unmatched-route behavior); in-site navigation always cross-fades.
