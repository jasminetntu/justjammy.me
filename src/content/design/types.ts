// types for design-piece content. A piece's real data lives in its own
// `<slug>.mdx` file (`export const meta = {...}` typed as `DesignMeta` below,
// plus the write-up prose); index.ts wires slugs to modules and validates
// each `meta` against `DesignPiece` at load time.

import type { FrameShape } from "@/components/ui/shape-toggle";
import type { Focal } from "@/lib/focal";
import type { PiecePlacement } from "@/lib/design-wall";

export type DesignCategory = "de anza" | "illustration" | "branding";

export interface DesignImage {
  // path under /public, e.g. "/images/design/<slug>/hero.jpg"
  src: string;
  alt: string;
  caption?: string;
  focal?: Focal; // crop focal point — set via /dev/crop
}

export interface DesignLink {
  label: string;
  href: string;
}

export interface DesignPiece {
  slug: string; // derived from the .mdx filename, not written in `meta`
  title: string;
  medium: string; // display label, e.g. "poster", "web · experience"
  year: string;
  category: DesignCategory; // filter key
  blurb: string; // one-line intro shown on the detail page
  gradient?: string; // fallback fill if no `images` yet
  // images[0] is the wall/grid thumbnail; the full array shows on the detail
  // page via a carousel. Leave undefined (and set `gradient`) for a piece
  // with no art yet.
  images?: DesignImage[];
  galleryShape?: FrameShape; // fixed carousel shape on the detail page (no visible toggle there); defaults to "horizontal"
  links?: DesignLink[];

  // the art's real shape (px, any scale — only the ratio matters): sizes the
  // wall polaroid AND the compact-grid tile (via CSS aspect-ratio), so the
  // grid tile matches the thumbnail's actual shape at any column width
  // instead of a separately-guessed height that can crop it oddly
  size: { w: number; h: number };

  // wall placement is AUTO by default — layoutWall() scatters pieces with
  // guaranteed spacing, so a new piece needs no coordinates; set `place` to
  // art-direct one, any omitted field still auto-resolves
  place?: PiecePlacement;
}

// shape of a .mdx file's `export const meta` — everything in DesignPiece
// except `slug`, which comes from the filename instead
export type DesignMeta = Omit<DesignPiece, "slug">;
