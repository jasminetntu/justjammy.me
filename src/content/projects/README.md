# Projects content

> **New here / want the plain-English walkthrough?** See
> [`docs/adding-content.md`](../../../docs/adding-content.md) — step-by-step for
> projects *and* artwork, no coding background needed.

A project is **one file**: `<slug>.mdx`. The filename is the slug — it becomes
`/projects/<slug>` and is the only link between the file and the route.
Metadata lives in an `export const meta = {...}` at the top of the file;
the case-study prose is the MDX body below it.

## Add a project (2 small edits)

1. **Create `<slug>.mdx`** with a `meta` export:

   ```mdx
   export const meta = {
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
   };

   ## The spark
   What it is and why I built it.

   ## How I built it
   The interesting parts. **Bold**, images, and code all work.
   ```

   `meta` is validated against `ProjectMeta` (see `types.ts`) at load time — a
   typo'd or missing required field throws a clear error naming the file and
   field the next time the dev server or build runs. (It's plain JS inside an
   .mdx file, so the editor itself won't catch it — only this runtime check will.)

2. **Register it in `index.ts`** — one line in the `modules` map:

   ```ts
   "cool-project": () => import("./cool-project.mdx"),
   ```

   (Kept explicit rather than a glob so the bundler statically resolves each
   import — there's no filesystem-glob-at-build-time primitive in Turbopack.
   The order of lines here is the display order on the vine's Projects section.)

That's it — the project gets a static page at `/projects/<slug>`, and `featured`
ones appear in the experience vine's Projects section.

## Notes

- Images go under `public/images/projects/<slug>/`; reference them in `images`.
- `layout`: only `notes` is implemented; `editorial`/`rail` are reserved for a
  future project that needs a different detail layout.
- `index.ts` is server-only (`getAllProjects()` / `getProject()` dynamically
  `import()` each file) — never import it from a Client Component, since
  that would bundle every case study's compiled JS into the client. Pass the
  resolved data down as props from a server page instead.
- For a one-off "showpiece", skip MDX and build a custom route at
  `src/app/projects/<slug>/page.tsx` instead.
