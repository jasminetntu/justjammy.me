# Jasmine Tu — Portfolio

A personal portfolio site: a soft, constellation-garden themed experience with an
ambient canvas background (color washes, a wispy ribbon, sparkle cursor), a
draggable design wall, and a growing-vine experience timeline.

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
npm run build      # production build
npm start          # serve the production build
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

**Mental model:** everything in `app/`, `components/`, and `lib/` is machinery you
build once. Everything in `content/` is what you edit day to day.

## Editing content

- **Text / links** — `src/content/site.ts`, `about.ts`, `experience.ts`.
- **Add a design piece** — one entry in `src/content/design/index.ts`
  (see that folder's notes). Wall position auto-resolves; no coordinates needed.
- **Add a project** — see `src/content/projects/README.md` (one entry in
  `index.ts` + one `.mdx` body + one line in `bodies.ts`).

Drop images under `public/images/…` and point the content entry at them.

## Deploying (Vercel)

The site is fully static and deploys on Vercel's free tier. After the first
deploy, set the canonical URL so share images and the sitemap use absolute links:

- set `NEXT_PUBLIC_SITE_URL` (e.g. `https://your-domain.com`) in the Vercel
  project's env vars, **or** edit the fallback in `src/content/site.ts`.

## Still to add (content)

- `public/jasmine-tu-resume.pdf` (the resume link 404s until it's added)
- real artwork + copy for design pieces and project case studies
