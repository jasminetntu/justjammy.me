// project registry — each project lives entirely in its own `<slug>.mdx`
// file (metadata as `export const meta = {...}`, case-study prose as the
// body below it); this file is just the slug → module wiring, since nothing
// can discover "every .mdx in this folder" automatically (Turbopack has no
// filesystem-glob-at-build-time primitive) and a Client Component can't use
// `fs` to do it at runtime either.
//
// Server-only: `getAllProjects()` / `getProject()` dynamically `import()`
// the compiled .mdx modules, so this file must only be imported from server
// components — never from a Client Component, which would otherwise bundle
// every case study's JS into the client. Server pages pass the resolved
// `ProjectMeta[]` down as props.

import type { ComponentType } from "react";

import type { ProjectInfo, ProjectMeta } from "./types";

export type { ProjectImage, ProjectLayout, ProjectLink, ProjectMeta, ProjectStat } from "./types";

// `meta` is `unknown` here (not `ProjectInfo`) because the compiled .mdx
// module's declared type (see src/types/mdx.d.ts) is untyped — it's cast to
// `ProjectMeta` only after `validateProject` checks it at runtime
type ProjectModule = { meta: unknown; default: ComponentType };

// import order here = display order on the vine's Projects section
const modules: Record<string, () => Promise<ProjectModule>> = {
  "before-i-go": () => import("./before-i-go.mdx"),
  "blowfish-budgeting": () => import("./blowfish-budgeting.mdx"),
  draftly: () => import("./draftly.mdx"),
  "murphys-lab": () => import("./murphys-lab.mdx"),
  "where-is-mr-quack": () => import("./where-is-mr-quack.mdx"),
};

const REQUIRED_FIELDS = ["title", "hook", "role", "timeframe", "tags", "layout"] as const;

// `meta` is a plain JS export inside an .mdx file — TypeScript never checks
// it. This is what catches a missing/misspelled field instead of letting it
// fail silently (or crash deep inside a component) at render time.
function validateProject(slug: string, meta: unknown): ProjectMeta {
  const m = meta as Partial<ProjectInfo> | undefined;
  if (!m || typeof m !== "object") {
    throw new Error(`projects/${slug}.mdx: missing \`export const meta\``);
  }
  for (const field of REQUIRED_FIELDS) {
    if (m[field] === undefined) {
      throw new Error(`projects/${slug}.mdx: meta.${field} is required`);
    }
  }
  if (!Array.isArray(m.tags)) {
    throw new Error(`projects/${slug}.mdx: meta.tags must be an array`);
  }
  return { ...m, slug } as ProjectMeta;
}

// slugs only — cheap, doesn't load any module. Used by generateStaticParams
// and the sitemap, neither of which need the full metadata.
export function projectSlugs(): string[] {
  return Object.keys(modules);
}

// server-only: loads every project's metadata (validated) in display order
export async function getAllProjects(): Promise<ProjectMeta[]> {
  return Promise.all(
    Object.entries(modules).map(async ([slug, load]) => validateProject(slug, (await load()).meta)),
  );
}

// server-only: one project's metadata + its case-study component
export async function getProject(slug: string): Promise<{ project: ProjectMeta; Body: ComponentType } | undefined> {
  const load = modules[slug];
  if (!load) return undefined;
  const mod = await load();
  return { project: validateProject(slug, mod.meta), Body: mod.default };
}

// server-only: featured projects, in display order
export async function getFeaturedProjects(): Promise<ProjectMeta[]> {
  const all = await getAllProjects();
  return all.filter((p) => p.featured);
}
