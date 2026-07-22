# Portfolio Website — Architecture & Plan

> Last updated: 2026-07-22
> Status: Built — Phases 1–5 complete, Phase 6 (polish) in progress

This document captures the architecture, technology choices, and reasoning for
the portfolio website. It's the single source of truth for *why* the project is
built the way it is. Sections below marked with a **Reality check** note where the
build intentionally diverged from the original plan.

---

## 1. Goals

- **Industry-standard & professional** — built the way real engineering teams build.
- **Scalable & maintainable** — clean structure that won't rot as it grows.
- **Easy to extend** — adding a new project or experience should be trivial
  (ideally: add one file).
- **Unique, creative, and fun** — strong design ambition; projects should be
  presented in interesting, interactive ways.
- **Free to host** — runs on a free tier, on a custom domain.

---

## 2. Tech Stack

| Tool | Job | Why it's the standard |
|---|---|---|
| **Next.js (App Router)** | Framework | Industry-standard React meta-framework; full-stack in one repo; great SEO |
| **TypeScript** | Language | Catches bugs before runtime; expected at a professional level |
| **Tailwind CSS** | Styling | Fast, consistent, scales without CSS chaos |
| **shadcn/ui** | UI components | Accessible, customizable primitives that you own (not a locked-in library) |
| **MDX** | Content | One file per project; rich text + code + embedded React components |
| **Motion** (Framer Motion) | Animations | Scroll-triggered animation, page transitions — the creative playground |
| **Resend** | Email | Powers the contact form; modern, generous free tier |
| **Vitest + React Testing Library** | Unit tests | Fast, modern test runner |
| **Playwright** | End-to-end tests | Browser-level testing; demonstrates engineering rigor |
| **ESLint + Prettier** | Code quality | Auto-formatting + linting; standard on every team |
| **GitHub Actions** | CI | Runs lint/typecheck/test on every push |
| **Vercel** | Hosting | Free tier, instant deploys, first-class Next.js support |

> **Deferred / on-demand:** React Three Fiber (3D scenes) — only added if/when a
> specific project needs it, to keep the site lean and fast.

> **Reality check (what actually shipped):**
> - **Styling** is Tailwind v4 with **custom components** (`components/ui`, `sections`) —
>   shadcn/ui was not needed at this scale.
> - **MDX** is used for **project case-study bodies only**; structured metadata is
>   typed TS (see §3.3), not MDX frontmatter.
> - **Animations**: Motion for route cross-fades + a hand-rolled **canvas FX engine**
>   (`src/lib/canvas/`) for the ambient background — the bigger creative surface.
> - **Deferred, not yet built:** the Resend contact endpoint (contact is links-only
>   for now), Playwright e2e (Vitest unit tests only), Prettier (ESLint only), and the
>   GitHub Actions CI workflow.

---

## 3. Key Architectural Decisions

### 3.1 Framework: Next.js (migrating off Create React App)

The repo started as Create React App (CRA), which was **officially deprecated in
early 2025**. We are fully scrapping the CRA setup in favor of Next.js because it:

- is what most companies actually use (strong résumé signal),
- is genuinely full-stack — frontend pages **and** backend endpoints in one repo,
- renders pages on the server for excellent SEO (recruiters can find the site),
- deploys free on Vercel with zero config.

### 3.2 Backend: "Light / serverless"

The site is **mostly static pages** plus a **few serverless functions**.

- **Serverless** = small functions that only run for the moment they're triggered
  (e.g. when someone submits the contact form), then shut off. No always-on
  server to rent, pay for, or maintain.
- **"Light"** = static pages for everything that doesn't need a backend; serverless
  only for the dynamic bits (contact form, possibly view counts later).
- Result: free at portfolio scale, nothing to maintain, still genuinely full-stack.

### 3.3 Content: typed registries (+ MDX for long-form project prose)

**Reality check:** the original plan was "one MDX file per project/experience with
validated frontmatter." What shipped is cleaner and more type-safe:

- Structured content is **typed TypeScript** in `src/content/` — `site.ts`,
  `about.ts`, `experience.ts` (timeline + skills + certifications), `design/index.ts`
  (piece registry), and `projects/index.ts` (project metadata). The types
  autocomplete in the editor and error loudly at build on a typo.
- **MDX** is used only for **project case-study bodies** — one `<slug>.mdx` of prose
  per project, registered in `projects/bodies.ts`. MDX is Markdown **plus** JSX, so a
  body can embed custom React components when a project wants interactive flair.

Content lives in version control alongside the code; adding content can't break the
app (it's separated from the machinery).

### 3.4 Project presentation: Hybrid

Projects are presented on a spectrum, decided per-project:

| Level | How it's built | Example |
|---|---|---|
| Standard | Plain MDX (text + images) | A quick writeup |
| Enhanced | MDX + custom components sprinkled in | Scroll animations, interactive demos |
| **Bespoke** | A dedicated custom page, no MDX | A "showpiece" project that's its own mini-experience |

**Default** = template-with-flair (consistent, scalable, still fun). **Showpieces**
(1–2 standout projects) get their own fully custom route under
`app/projects/` and can break all the rules. The MDX template is the fast,
consistent default; bespoke pages are the escape hatch for maximum creativity.

### 3.5 Hosting vs. domain (they're separate)

- **Hosting** (Vercel) = where the files and functions live.
- **Domain** (bought from a registrar) = the address people type.
- Connected by pointing the domain's DNS at Vercel — a one-time ~5-minute setup.
- The custom domain works identically whether the backend is serverless or not.

---

## 4. Folder Structure

```
jasmine-tu-website-portfolio/
├── src/
│   ├── app/                      # routes (App Router)
│   │   ├── layout.tsx            # shared shell: fonts, canvas, header, metadata
│   │   ├── page.tsx              # home (the constellation garden)
│   │   ├── globals.css           # Tailwind v4 @theme tokens + base styles
│   │   ├── about/page.tsx
│   │   ├── experience/page.tsx
│   │   ├── design/page.tsx       # + design/[slug]/page.tsx  (piece detail)
│   │   ├── projects/[slug]/page.tsx   # project detail (renders the MDX body)
│   │   ├── contact/page.tsx
│   │   ├── not-found.tsx         # on-brand 404
│   │   ├── opengraph-image.tsx   # + twitter-image.tsx (branded share card)
│   │   ├── sitemap.ts, robots.ts
│   │   └── api/contact/          # reserved for the serverless endpoint (not built)
│   │
│   ├── components/
│   │   ├── ui/                   # small shared pieces (back link, four-point star)
│   │   ├── layout/               # canvas, fx provider, header, page transition
│   │   └── sections/             # one component per page (garden, about, …)
│   │
│   ├── content/                  # ← YOUR DATA. This is what you edit.
│   │   ├── site.ts, about.ts, experience.ts
│   │   ├── design/index.ts       # design-piece registry
│   │   └── projects/             # index.ts (metadata) + <slug>.mdx + bodies.ts
│   │
│   ├── lib/
│   │   ├── canvas/               # ambient FX engine (washes, ribbon, particles)
│   │   ├── design-wall.ts        # seeded non-overlapping wall layout
│   │   └── theme.ts, views.ts, radial.ts, emphasis.ts, …
│   └── types/                    # shared TypeScript types
│
├── public/images/                # photos, logos, screenshots
├── tests/                        # Vitest unit tests (pure logic)
├── planning/                     # ARCHITECTURE.md (this file) + BUILD-PLAN.md
├── next.config.ts, tsconfig.json, package.json
```

**Mental model:** everything in `src/app` and `src/components` is the *machinery*
you build once. Everything in `src/content` is the *stuff you add forever*. Day to
day, you'll mostly just drop files into `content/`.

---

## 5. The "Add a Project" Workflow

**Reality check:** metadata is typed TS, so adding a project is three small edits
(not one MDX file). Full walkthrough in `src/content/projects/README.md`; in short:

1. Add a typed entry to the `projects` array in `src/content/projects/index.ts`
   (slug, title, hook, role, tags, `featured`, …).
2. Create the case-study body `src/content/projects/<slug>.mdx` (prose only).
3. Register it in `src/content/projects/bodies.ts` (one `slug → import` line).

The project then gets a static page at `/projects/<slug>`, and `featured` ones
surface in the experience vine's Projects section. Design pieces are even simpler —
one typed entry in `src/content/design/index.ts` (wall position auto-resolves).

Experience content (roles, skills, certifications) is edited directly in the typed
arrays in `src/content/experience.ts`.

---

## 6. How the Goals Are Met

- **Scalable** — content is separated from code; adding content can't break the app.
- **Type-safe** — content is typed TypeScript, so a typo or missing required field
  errors loudly at build instead of silently breaking a page.
- **Maintainable** — a shared component library means redesign once, update everywhere.
- **Professional** — CI runs on every push and catches broken builds before they ship.
- **Creative** — a `components/projects/` widget library + bespoke showpiece pages
  give unlimited room for unique, interactive presentation.
- **Free** — static hosting + serverless functions on Vercel's free tier.

---

## 7. Build Plan

The original scaffold plan is done. See **`planning/BUILD-PLAN.md`** for the
phase-by-phase status, what shipped, and noted deviations.

Not yet built (deferred): the serverless contact endpoint (Resend), Playwright e2e,
a GitHub Actions CI workflow, and connecting a custom domain on deploy.
