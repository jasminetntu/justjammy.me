# Adding content (no AI needed)

A step-by-step guide for the things you'll do over and over: add a **project**,
add a **design piece / artwork**, reveal a section, swap the resume. Every file
path is exact, and every step is copy-paste.

> **Preview as you go:** run `npm run dev` and open http://localhost:3000. It
> live-reloads on save, so you see changes instantly. To publish, see the last
> section.

Where content lives:

| What | File / folder |
|------|---------------|
| Name, email, links, resume path | `src/content/site.ts` |
| About page copy + highlights | `src/content/about.ts` |
| Experience timeline, skills, certs | `src/content/experience.ts` |
| Projects (metadata + case studies) | `src/content/projects/` |
| Design pieces (artwork) | `src/content/design/index.ts` |
| Images | `public/images/…` |
| Show/hide the coming-soon states | `src/content/site.ts` (`comingSoon`) |

---

## 1. Add a project

A project = **one entry of info** + **one write-up file** + **one line to link them**.

### Step 1 — add the info

Open `src/content/projects/index.ts`. Copy an existing entry in the `projects`
array and edit it. Only `slug, title, hook, role, timeframe, tags, layout` are
required; the rest are optional.

```ts
{
  slug: "my-project",            // becomes the URL: /projects/my-project (lowercase, dashes)
  title: "My Project",
  hook: "One sentence about what it is.",
  role: "Developer · Designer",
  timeframe: "May 2025 · Hackathon",
  tags: ["React", "TypeScript"],
  category: "Full-Stack",        // optional: small outline label (e.g. Game, AI)
  badge: "1st place",            // optional: standout callout
  layout: "notes",              // keep as "notes"
  stats: [{ value: "1st", label: "place · 40+ teams" }],   // optional
  links: [{ label: "Live", href: "https://…" }],           // optional
  featured: true,                // show it in the Experience page's Projects section
},
```

### Step 2 — write the story

Create a new file `src/content/projects/my-project.mdx` (the name **must match the
slug**). Write in Markdown. Headings become italic section titles:

```mdx
## The spark
What it is and why I made it.

## How I built it
The interesting parts. **Bold**, images, and lists all work.
```

### Step 3 — link them

Open `src/content/projects/bodies.ts` and add one line to the list:

```ts
"my-project": () => import("./my-project.mdx"),
```

### (Optional) add images

1. Put image files in `public/images/projects/my-project/` (create the folder).
2. Add an `images` field to the entry from Step 1:

```ts
images: [
  { src: "/images/projects/my-project/hero.jpg", alt: "short description" },
],
```

✅ **Checklist:** entry in `index.ts` → `my-project.mdx` file → line in `bodies.ts`
→ (optional) images. The project now has a page at `/projects/my-project`.

---

## 2. Add a design piece (artwork)

Simpler — just **one entry**. Open `src/content/design/index.ts` and copy an entry
in the `pieces` array.

### With real artwork

1. Put the image in `public/images/design/my-piece/` (create the folder).
2. Add the entry:

```ts
{
  slug: "my-piece",              // becomes /design/my-piece
  title: "Poster for X",
  medium: "poster",              // small label, e.g. "poster", "portrait"
  year: "2025",
  category: "posters",           // one of: posters | portraits | web | motion
  blurb: "One line about the piece.",
  gradient: G.pink,              // ignored once `image` is set (keep any value)
  image: { src: "/images/design/my-piece/art.jpg", alt: "short description" },
  size: { w: 260, h: 320 },      // how big it appears on the draggable wall (px)
  gridHeight: 220,               // its height in the compact grid view (px)
},
```

> **Tip — no cropping:** set `size` and `gridHeight` to roughly match your image's
> shape. Tall image → taller numbers; wide image → set `w` bigger than `h` and a
> smaller `gridHeight`.

### Without artwork yet (placeholder)

Leave off `image` and pick a `gradient` from the `G` palette at the top of the file
(`G.pink`, `G.portrait`, `G.web`, `G.motion`, …). It shows a soft color tile until
you add art.

You don't place pieces on the wall — positions are automatic and never overlap.

✅ **Checklist:** image in `public/images/design/<slug>/` → one entry in
`index.ts` with `image`. Done.

---

## 3. Reveal a section (turn off "coming soon")

Right now `/design` and the Projects section show **"coming soon"**. When your
content is ready, open `src/content/site.ts` and flip the flag(s):

```ts
export const comingSoon = {
  design: false,     // false = show the real design gallery
  projects: false,   // false = show the real projects
} as const;
```

They're independent — reveal one and keep the other hidden if you like.

---

## 4. Swap the resume

Save your resume as `public/jasmine-tu-resume.pdf` (that exact name). The contact
page's "resume" link points to it automatically. (Different name? update `resume`
in `src/content/site.ts`.)

---

## 5. Preview and publish

**Preview locally:**

```bash
npm run dev      # then open http://localhost:3000
```

**Publish to Hostinger:**

```bash
npm run build    # creates an "out" folder
```

Then upload **everything inside the `out/` folder** to `public_html` in Hostinger's
File Manager (hPanel). That's the whole site. (First real build: set your domain so
share links are correct — see `README.md` / the deploy notes.)
