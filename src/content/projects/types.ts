// types for project content. A project's real data lives in its own
// `<slug>.mdx` file (`export const meta = {...}` typed as `ProjectMeta`
// below, plus the case-study prose); index.ts wires slugs to modules and
// validates each `meta` against `ProjectMeta` at load time.

import type { Focal } from "@/lib/focal";

export type ProjectLayout = "notes" | "editorial" | "rail";

export interface ProjectStat {
  value: string;
  label: string;
}

export interface ProjectLink {
  label: string;
  href: string;
}

export interface ProjectImage {
  // path under /public, e.g. "/images/projects/<slug>/hero.jpg"
  src: string;
  alt: string;
  caption?: string; // handwritten-style caption in the field-notes layout
  focal?: Focal; // crop focal point — set via /dev/crop
}

export interface ProjectMeta {
  slug: string; // derived from the .mdx filename, not written in `meta`
  title: string;
  hook: string; // one-line summary, shown on the detail page
  role: string;
  timeframe: string;
  tags: string[];
  category?: string; // at-a-glance type, outline badge — e.g. "Game", "Full-Stack", "AI"
  badge?: string; // standout callout (filled badge) — e.g. "1st place"
  layout: ProjectLayout; // default detail layout
  stats?: ProjectStat[];
  links?: ProjectLink[];
  images?: ProjectImage[];
  featured?: boolean; // surface on the vine's Projects section
}

// shape of a .mdx file's `export const meta` — everything in ProjectMeta
// except `slug`, which comes from the filename instead
export type ProjectInfo = Omit<ProjectMeta, "slug">;
