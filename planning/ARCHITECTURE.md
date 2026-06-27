# Portfolio Website — Architecture & Plan

> Last updated: 2026-06-26
> Status: Planning → ready to scaffold

This document captures the architecture, technology choices, and reasoning for
the portfolio website. It's the single source of truth for *why* the project is
built the way it is.

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

### 3.3 Content: MDX files ("add a project = add a file")

Each project/experience is a single `.mdx` file in `src/content/`. MDX is
Markdown **plus** JSX — so a file can be plain text *or* embed fully custom,
interactive React components. Content lives in version control alongside the code.

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
│   ├── app/                      # Pages & routes (App Router)
│   │   ├── layout.tsx            # Shared shell: nav, footer, fonts
│   │   ├── page.tsx              # Home
│   │   ├── globals.css
│   │   ├── about/page.tsx
│   │   ├── projects/
│   │   │   ├── page.tsx          # Project grid (lists all projects)
│   │   │   └── [slug]/page.tsx   # One project page (renders the MDX)
│   │   ├── experience/page.tsx   # Work / experience timeline
│   │   ├── contact/page.tsx
│   │   └── api/
│   │       └── contact/route.ts  # ← serverless contact endpoint
│   │
│   ├── components/
│   │   ├── ui/                   # Primitives: Button, Card, Badge…
│   │   ├── layout/               # Navbar, Footer, Container
│   │   ├── sections/             # Hero, ProjectGrid, Timeline…
│   │   └── projects/             # Reusable creative widgets
│   │                             #   (sliders, scrollytelling, demos)
│   │
│   ├── content/                  # ← YOUR DATA. This is what you edit.
│   │   ├── projects/
│   │   │   ├── cool-project.mdx
│   │   │   └── another-thing.mdx
│   │   └── experience/
│   │       └── nvidia.mdx
│   │
│   ├── lib/                      # Helpers (load content, utils)
│   ├── styles/                   # Design tokens (colors, spacing, fonts)
│   └── types/                    # Shared TypeScript types
│
├── public/images/                # Photos, logos, screenshots
├── tests/                        # Playwright end-to-end tests
├── docs/                         # Deeper architecture / how-to notes
├── planning/                     # This file and other planning docs
├── .github/workflows/ci.yml      # Auto lint/test on push
├── tailwind.config.ts
├── next.config.mjs
├── tsconfig.json
└── package.json
```

**Mental model:** everything in `src/app` and `src/components` is the *machinery*
you build once. Everything in `src/content` is the *stuff you add forever*. Day to
day, you'll mostly just drop files into `content/`.

---

## 5. The "Add a Project" Workflow

To add a new project, create **one file** — `src/content/projects/my-new-thing.mdx`:

```mdx
---
title: "My New Thing"
summary: "A one-line hook for the project card."
role: "Lead Engineer"
year: 2026
tags: ["react", "typescript", "design"]
cover: "/images/my-new-thing/cover.png"
featured: true
---

Write the full story here in Markdown — **bold text**, images,
code blocks, embedded video, whatever you want.

<BeforeAfterSlider before="/a.png" after="/b.png" />   {/* a custom widget */}
```

That file **automatically**:
- appears as a card in the `/projects` grid,
- gets its own page at `/projects/my-new-thing`,
- shows up in tag filters and "featured" sections.

No code changes required. Experiences in `content/experience/` work the same way.

---

## 6. How the Goals Are Met

- **Scalable** — content is separated from code; adding content can't break the app.
- **Type-safe** — MDX frontmatter is validated, so a typo errors loudly instead of
  silently breaking a page.
- **Maintainable** — a shared component library means redesign once, update everywhere.
- **Professional** — CI runs on every push and catches broken builds before they ship.
- **Creative** — a `components/projects/` widget library + bespoke showpiece pages
  give unlimited room for unique, interactive presentation.
- **Free** — static hosting + serverless functions on Vercel's free tier.

---

## 7. Build Plan (next steps)

1. Scrap CRA; scaffold Next.js + TypeScript + Tailwind + ESLint (App Router, `src/`).
2. Add MDX content pipeline + typed frontmatter validation.
3. Create folder structure with a sample project and a sample experience.
4. Build the layout shell (Navbar, Footer) and core pages (Home, Projects, About,
   Experience, Contact).
5. Add Motion for animations + a starter `components/projects/` widget.
6. Wire up the serverless contact endpoint (Resend).
7. Set up Vitest + Playwright + a GitHub Actions CI workflow.
8. Deploy to Vercel and connect the custom domain.
9. Write `docs/` how-to notes (esp. "how to add a project").
