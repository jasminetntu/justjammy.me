# <img src="src/app/icon.svg" width="30" height="30" style="vertical-align: bottom;" alt="justjammy.me logo"> [justjammy.me](justjammy.me)

My little corner of the internet! (˶˃ ᵕ ˂˶) .ᐟ.ᐟ

## Stack

- **Next.js (App Router)** + **React** + **TypeScript**
- **Tailwind CSS v4** — theme tokens in `src/app/globals.css` (`@theme`)
- **MDX** (`@next/mdx`) — long-form project case-study bodies
- **Motion** — route cross-fades
- **Canvas** — a hand-rolled ambient FX engine (`src/lib/canvas/`)
- **Vitest** — unit tests for the pure logic (wash, layout, routing)

Fonts (via `next/font`): Parisienne (script names), Cormorant Garamond (italic
labels), Hanken Grotesk (body).

## Scripts

```bash
npm run dev        # local dev server (http://localhost:3000)
npm run build      # static export → out/ folder (upload this to hosting)
npm run typecheck  # tsc --noEmit
npm run lint       # eslint
npm test           # vitest run
```

## Project structure

```
src/
  app/                 # routes (App Router) + metadata, sitemap, robots, og image
  components/
    layout/            # canvas, fx provider, header, page transition
    sections/          # one component per page (garden, about, experience, …)
    ui/                # small shared pieces (back link, four-point star)
  content/             # ← the data you edit (see below)
    site.ts            # name, email, links, location, resume path
    about.ts           # about copy + highlights
    experience.ts      # timeline, skills, certifications
    design/            # design pieces (typed registry)
    projects/          # project metadata + MDX case-study bodies
  lib/
    canvas/            # ambient FX engine (washes, ribbon, particles, draw)
    design-wall.ts     # seeded, non-overlapping wall layout
    theme.ts, views.ts, …
tests/                 # vitest unit tests
planning/              # ARCHITECTURE.md + BUILD-PLAN.md
```

## Editing content

- **Text / links** — `src/content/site.ts`, `about.ts`, `experience.ts`.
- **Add a design piece** — one entry in `src/content/design/index.ts` (see that folder's notes). Wall position auto-resolves; no coordinates needed.
- **Add a project** — see `src/content/projects/README.md` (one entry in `index.ts` + one `.mdx` body + one line in `bodies.ts`).

Drop images under `public/images/…` and point the content entry at them.

