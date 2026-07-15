# Prototype → Site: Phased Build Plan

> Last updated: 2026-07-13
> Status: Phase 3 complete · Phase 4 next
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

### ⏳ Phase 4 — Design gallery + piece detail
- `/design` — draggable infinite polaroid wall (momentum, cursor-parallax depth,
  idle drift, data-driven boundary, hover straighten + caption) with a compact
  masonry-grid toggle; medium filter chips; Instagram link.
- `/design/[slug]` — piece detail with the same 3-layout toggle. Pieces from typed data.

### ⏳ Phase 5 — Contact
`/contact` — pink "say hello" letter: greeting cycles hello → hi → hey (each
click launches a shooting star), links bloom in staggered with draw-in
underlines, email click-to-copy with a sparkle burst, resume PDF in `public/`.

### ⏳ Phase 6 — Polish
Per-route metadata, favicon / OG image, `README` + this doc + `ARCHITECTURE.md`
sync, prune leftovers, final full-verification sweep.

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
