# Adding content

A step-by-step guide for: adding a **project**, adding a **design piece / artwork**, revealing a section, and swapping the resume. Every file path is exact, and every step is copy-paste.

> **Preview as you go:** run `npm run dev` and open http://localhost:3000. It live-reloads on save, so you see changes instantly. To publish, see the last section.

Where content lives:

| What | File / folder |
|------|---------------|
| Name, email, links, resume path | `src/content/site.ts` |
| About page copy + highlights | `src/content/about.ts` |
| Experience timeline, skills, certs | `src/content/experience.ts` |
| Projects (metadata + case studies) | `src/content/projects/` |
| Design pieces (metadata + optional write-up) | `src/content/design/` |
| Images | `public/images/…` |
| Show/hide the coming-soon states | `src/content/site.ts` (`comingSoon`) |

---

## 1. Add a project

A project is **one file**: `src/content/projects/my-project.mdx` (the filename **becomes the slug**, lowercase with dashes — it's the only link between the file and the URL `/projects/my-project`).

### Step 1 — create the file and its info

At the top of the file, export a `meta` object. Only `title, hook, role, timeframe, tags, layout` are required; the rest are optional.

```mdx
export const meta = {
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
};
```

### Step 2 — write the story

Below the `meta` export, write the case study in Markdown. Headings become italic section titles:

```mdx
## The spark
What it is and why I made it.

## How I built it
The interesting parts. **Bold**, images, and lists all work.
```

### Step 3 — register the file

Open `src/content/projects/index.ts` and add one line to the `modules` map:

```ts
"my-project": () => import("./my-project.mdx"),
```

(This is the one place that still needs a manual edit — nothing can discover "every file in this folder" automatically, so each slug is wired up explicitly.)

### (Optional) add images

1. Put image files in `public/images/projects/my-project/` (create the folder).
2. Add an `images` field to `meta`:

```ts
images: [
  { src: "/images/projects/my-project/hero.jpg", alt: "short description" },
],
```

✅ **Checklist:** `my-project.mdx` with a `meta` export + story → one line in `index.ts`'s `modules` map → (optional) images. The project now has a page at `/projects/my-project`.

> **Heads up:** `meta` is plain JS, not type-checked by the editor. A typo'd field name or a missing required field won't show a red squiggle — but it *will* throw a clear error the next time you run `npm run dev` or `npm run build`, naming the exact file and field.

---

## 2. Add a design piece (artwork)

Same shape as a project: **one file**, `src/content/design/my-piece.mdx` (the
filename **becomes the slug** — the URL is `/design/my-piece`).

### Step 1 — create the file and its info

At the top of the file, export a `meta` object.

```mdx
export const meta = {
  title: "Poster for X",
  medium: "poster",              // small label, e.g. "poster", "portrait"
  year: "2025",
  category: "de anza",           // one of: "de anza" | "illustration" | "branding"
  blurb: "One line about the piece.",
  images: [                      // first image is the wall/grid thumbnail;
    { src: "/images/design/my-piece/art.jpg", alt: "short description", caption: "optional" },
    { src: "/images/design/my-piece/more.jpg", alt: "short description" },
  ],                             // the rest browse via a carousel on the detail page
  size: { w: 260, h: 320 },      // the art's real shape (any scale — only the ratio matters)
};
```

> **Tip — no cropping:** set `size` to your thumbnail image's actual width:height ratio (e.g. open it and check its pixel dimensions). It sizes both the draggable-wall polaroid *and* the compact-grid tile, so getting the ratio right means neither view crops the image oddly. Want a specific shape (square / horizontal / vertical) for the detail-page carousel regardless of the source images? Add `galleryShape: "square"` (or `"horizontal"` / `"vertical"`).

### Step 2 — write the story (optional)

Below the `meta` export, write in Markdown, same as a project's case study:

```mdx
## The brief
What it is and the thinking behind it.

## The process
The interesting parts. **Bold**, images, and lists all work.
```

No write-up yet? Leave it out — the file can be just the `meta` export; the
piece's detail page won't show a write-up section until you add one.

### Step 3 — register the file

Open `src/content/design/index.ts` and add one line to the `modules` map:

```ts
"my-piece": () => import("./my-piece.mdx"),
```

(This is the one place that still needs a manual edit — nothing can discover "every file in this folder" automatically, so each slug is wired up explicitly. The order of lines here is the display order on the wall/grid.)

### Without artwork yet (placeholder)

Leave off `images` and set `gradient` to any CSS gradient string, e.g.
`"linear-gradient(150deg,#fbe1ee,#e7a6c6)"`. It shows that color tile until you add art.

You don't place pieces on the wall — positions are automatic and never overlap.

✅ **Checklist:** image(s) in `public/images/design/<slug>/` → `my-piece.mdx` with
a `meta` export (+ optional write-up) → one line in `index.ts`'s `modules` map.

> **Heads up:** `meta` is plain JS, not type-checked by the editor. A typo'd field name, a missing required field, or a `category` that isn't one of the three listed won't show a red squiggle — but it *will* throw a clear error the next time you run `npm run dev` or `npm run build`, naming the exact file and field.

---

## 3. Reveal a section (turn off "coming soon")

Right now `/design` and the Projects section show **"coming soon"**. When your content is ready, open `src/content/site.ts` and flip the flag(s):

```ts
export const comingSoon = {
  design: false,     // false = show the real design gallery
  projects: false,   // false = show the real projects
} as const;
```

They're independent — reveal one and keep the other hidden.

---

## 4. Swap the resume

Save your resume as `public/jasmine-tu-resume.pdf` (that exact name). The contact page's "resume" link points to it automatically. (Different name? update `resume` in `src/content/site.ts`.)

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

Then upload **everything inside the `out/` folder** to `public_html` in Hostinger's File Manager (hPanel). That's the whole site. (First real build: set your domain so share links are correct — see `README.md` / the deploy notes.)
