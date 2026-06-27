# Experience content

Each role/experience is **one `.mdx` file** in this folder. They render on the
`/experience` timeline, ordered by date.

## Format

```mdx
---
company: "NVIDIA"
role: "Software Engineer"
start: "2025-06"
end: "present"        # or a "YYYY-MM" date
location: "Santa Clara, CA"
logo: "/images/experience/nvidia.png"
---

- Bullet points describing what you built and the impact.
- Markdown works here too.
```

## Frontmatter fields

| Field | Required | Notes |
|---|---|---|
| `company` | yes | Organization name |
| `role` | yes | Your title |
| `start` | yes | `"YYYY-MM"` |
| `end` | no | `"YYYY-MM"` or `"present"` |
| `location` | no | City/region |
| `logo` | no | Path under `/public` for the logo |
