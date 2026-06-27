# Projects content

Each project is **one `.mdx` file** in this folder. The filename (minus `.mdx`)
becomes the URL slug — e.g. `cool-project.mdx` → `/projects/cool-project`.

## Format

```mdx
---
title: "Cool Project"
summary: "One-line hook shown on the project card."
role: "Lead Engineer"
year: 2026
tags: ["react", "typescript", "design"]
cover: "/images/cool-project/cover.png"
featured: true
---

Write the story in Markdown — headings, **bold**, images, code blocks.

You can also embed custom React components for interactive flair:

<BeforeAfterSlider before="/images/cool-project/a.png" after="/images/cool-project/b.png" />
```

## Frontmatter fields

| Field | Required | Notes |
|---|---|---|
| `title` | yes | Project name |
| `summary` | yes | One-line hook for the card |
| `role` | no | Your role on the project |
| `year` | no | Year (number) |
| `tags` | no | Array of strings; powers filtering |
| `cover` | no | Path under `/public` for the card image |
| `featured` | no | `true` to surface on the home page |

> Reusable creative components live in `src/components/projects/`.
> For a one-off "showpiece" project, skip MDX and build a custom page at
> `src/app/projects/<slug>/page.tsx` instead.
