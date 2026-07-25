# Projects content

> **New here / want the plain-English walkthrough?** See
> [`docs/adding-content.md`](../../../docs/adding-content.md) — step-by-step for
> projects *and* artwork, no coding background needed.

A project = **structured metadata** (typed) + a **case-study body** (MDX prose).
Metadata lives in `index.ts`; the story lives in a sibling `<slug>.mdx` file.

## Add a project (3 small edits)

1. **Add an entry to `index.ts`** — one object in the `projects` array:

   ```ts
   {
     slug: "cool-project",              // becomes /projects/cool-project
     title: "Cool Project",
     hook: "One-line summary shown on the detail page.",
     role: "Developer · Designer",
     timeframe: "May 2025 · Hackathon",
     tags: ["React", "TypeScript"],
     category: "Full-Stack",            // optional outline badge
     badge: "1st place",                // optional filled callout
     layout: "notes",                   // detail layout (notes implemented)
     stats: [{ value: "1st", label: "place · 40+ teams" }],  // optional
     links: [{ label: "Live", href: "https://…" }],          // optional
     images: [{ src: "/images/projects/cool-project/hero.jpg", alt: "…" }], // optional
     featured: true,                    // surface in the experience vine's Projects
   }
   ```

   Fields are typed by `ProjectMeta` in `index.ts` — the editor autocompletes them
   and a typo/missing required field errors at build.

2. **Create `<slug>.mdx`** — the case study prose (no frontmatter; metadata is in
   `index.ts`). Headings render as italic section titles:

   ```mdx
   ## The spark
   What it is and why I built it.

   ## How I built it
   The interesting parts. **Bold**, images, and code all work.
   ```

3. **Register the body in `bodies.ts`** — one line mapping slug → MDX import:

   ```ts
   "cool-project": () => import("./cool-project.mdx"),
   ```

   (Kept explicit rather than a glob so the bundler statically resolves each import.)

That's it — the project gets a static page at `/projects/<slug>`, and `featured`
ones appear in the experience vine's Projects section.

## Notes

- Images go under `public/images/projects/<slug>/`; reference them in `images`.
- `layout`: only `notes` is implemented; `editorial`/`rail` are reserved for a
  future project that needs a different detail layout.
- For a one-off "showpiece", skip MDX and build a custom route at
  `src/app/projects/<slug>/page.tsx` instead.
