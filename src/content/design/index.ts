// design-piece registry — each piece lives entirely in its own `<slug>.mdx`
// file (metadata as `export const meta = {...}`, write-up as the body below
// it); this file is just the slug → module wiring, since nothing can
// discover "every .mdx in this folder" automatically (Turbopack has no
// filesystem-glob-at-build-time primitive) and a Client Component can't use
// `fs` to do it at runtime either.
//
// Server-only: `getAllPieces()` / `getPiece()` dynamically `import()` the
// compiled .mdx modules, so this file must only be imported from server
// components (the design pages) — never from DesignGallery or other Client
// Components, which would otherwise bundle every write-up's JS into the
// client. Server pages pass the resolved `DesignPiece[]` down as props.

import type { ComponentType } from "react";

import type { DesignAffiliation, DesignMeta, DesignPiece } from "./types";

export type { DesignAffiliation, DesignImage, DesignLink, DesignMeta, DesignPiece } from "./types";

// `meta` is `unknown` here (not `DesignMeta`) because the compiled .mdx
// module's declared type (see src/types/mdx.d.ts) is untyped — it's cast to
// `DesignMeta` only after `validatePiece` checks it at runtime
type DesignModule = { meta: unknown; default: ComponentType };

// import order here = display order — it drives the wall/grid layout order
// and the affiliation-chip order (see pieceAffiliations below)
const modules: Record<string, () => Promise<DesignModule>> = {
  dax: () => import("./dax.mdx"),
  dagdc: () => import("./dagdc.mdx"),
  "dagdc-gamejam": () => import("./dagdc-gamejam.mdx"),
  dawics: () => import("./dawics.mdx"),
  "dawics-career-panel": () => import("./dawics-career-panel.mdx"),
  "dawics-hackathon": () => import("./dawics-hackathon.mdx"),
  "vector-illustration": () => import("./vector-illustration.mdx"),
  "illustration-figures": () => import("./illustration-figures.mdx"),
  "illustration-other": () => import("./illustration-other.mdx"),
  "personal-brand": () => import("./personal-brand.mdx"),
};

const AFFILIATIONS: DesignAffiliation[] = ["De Anza College", "Personal", "UC Irvine"];
const REQUIRED_FIELDS = ["title", "category", "timeframe", "associatedTo", "blurb", "size"] as const;

// `meta` is a plain JS export inside an .mdx file — TypeScript never checks
// it. This is what catches a typo'd associatedTo or a missing field instead
// of letting it fail silently (or crash deep inside a component) at render time.
function validatePiece(slug: string, meta: unknown): DesignPiece {
  const m = meta as Partial<DesignMeta> | undefined;
  if (!m || typeof m !== "object") {
    throw new Error(`design/${slug}.mdx: missing \`export const meta\``);
  }
  for (const field of REQUIRED_FIELDS) {
    if (m[field] === undefined) {
      throw new Error(`design/${slug}.mdx: meta.${field} is required`);
    }
  }
  if (!AFFILIATIONS.includes(m.associatedTo as DesignAffiliation)) {
    throw new Error(
      `design/${slug}.mdx: meta.associatedTo "${String(m.associatedTo)}" must be one of ${AFFILIATIONS.join(", ")}`,
    );
  }
  return { ...m, slug } as DesignPiece;
}

// slugs only — cheap, doesn't load any module. Used by generateStaticParams
// and the sitemap, neither of which need the full metadata.
export function pieceSlugs(): string[] {
  return Object.keys(modules);
}

// server-only: loads every piece's metadata (validated) in display order
export async function getAllPieces(): Promise<DesignPiece[]> {
  return Promise.all(Object.entries(modules).map(async ([slug, load]) => validatePiece(slug, (await load()).meta)));
}

// server-only: one piece's metadata + its write-up component
export async function getPiece(slug: string): Promise<{ piece: DesignPiece; Body: ComponentType } | undefined> {
  const load = modules[slug];
  if (!load) return undefined;
  const mod = await load();
  return { piece: validatePiece(slug, mod.meta), Body: mod.default };
}

// filter options derived from a resolved pieces list (order preserved), so
// the chip bar stays in sync with the data
export function pieceAffiliations(pieces: DesignPiece[]): Array<"all" | DesignAffiliation> {
  const seen: DesignAffiliation[] = [];
  for (const p of pieces) {
    if (!seen.includes(p.associatedTo)) seen.push(p.associatedTo);
  }
  return ["all", ...seen];
}
