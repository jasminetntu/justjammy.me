// design-piece registry — one typed entry per piece; the polaroid wall, masonry
// grid, and wall boundary all read this array, so adding a piece = one entry here
// (no component edits, no hand-placed coordinates).
//
// pieces are placeholders for now (gradient fills, generic titles); swap in real
// @jammydoodlez artwork later via an entry's `image` + real copy

import type { PiecePlacement } from "@/lib/design-wall";

export type DesignCategory = "posters" | "portraits" | "web" | "motion";

export interface DesignImage {
  // path under /public, e.g. "/images/design/<slug>/hero.jpg"
  src: string;
  alt: string;
  caption?: string;
}

export interface DesignLink {
  label: string;
  href: string;
}

export interface DesignPiece {
  slug: string;
  title: string;
  medium: string; // display label, e.g. "poster", "web · experience"
  year: string;
  category: DesignCategory; // filter key
  blurb: string; // one-line intro shown on the detail page
  description?: string; // longer prose for the detail page (typed, no MDX)
  gradient: string; // fallback fill until real art lands
  image?: DesignImage; // real artwork, when available
  links?: DesignLink[];

  // polaroid size on the wall (px) — a property of the art, not its placement
  size: { w: number; h: number };
  gridHeight: number; // tile height in the masonry grid (px)

  // wall placement is AUTO by default — layoutWall() scatters pieces with
  // guaranteed spacing, so a new piece needs no coordinates; set `place` to
  // art-direct one, any omitted field still auto-resolves
  place?: PiecePlacement;
}

// gradient palette shared across the placeholder pieces
const G = {
  pink: "linear-gradient(150deg,#fbe1ee,#e7a6c6)",
  pink2: "linear-gradient(150deg,#f6d6e6,#dd8fb6)",
  portrait: "linear-gradient(155deg,#fdeef4,#f0c4dc)",
  portrait2: "linear-gradient(155deg,#f7dfeb,#e3a9c6)",
  web: "linear-gradient(150deg,#fbe1ee,#dcebd0)",
  motion: "linear-gradient(150deg,#f2d6ec,#cdb4e6)",
} as const;

// placeholders — neutral "title / type / year" text until real pieces land
// TODO(jasmine): fill real title/medium/year/blurb per piece + `image`
// (art under /public/images/design/<slug>/) and any `links`; positions auto,
// so a new piece needs only `size` + `gridHeight` (no coordinates).
const BLURB = "A short description of this piece.";
export const pieces: DesignPiece[] = [
  {
    slug: "piece-1",
    title: "Title",
    medium: "type",
    year: "year",
    category: "posters",
    blurb: BLURB,
    gradient: G.pink,
    size: { w: 240, h: 316 },
    gridHeight: 210,
  },
  {
    slug: "piece-2",
    title: "Title",
    medium: "type",
    year: "year",
    category: "posters",
    blurb: BLURB,
    gradient: G.pink2,
    size: { w: 240, h: 316 },
    gridHeight: 175,
  },
  {
    slug: "piece-3",
    title: "Title",
    medium: "type",
    year: "year",
    category: "posters",
    blurb: BLURB,
    gradient: G.pink,
    size: { w: 240, h: 316 },
    gridHeight: 195,
  },
  {
    slug: "piece-4",
    title: "Title",
    medium: "type",
    year: "year",
    category: "portraits",
    blurb: BLURB,
    gradient: G.portrait,
    size: { w: 258, h: 318 },
    gridHeight: 225,
  },
  {
    slug: "piece-5",
    title: "Title",
    medium: "type",
    year: "year",
    category: "portraits",
    blurb: BLURB,
    gradient: G.portrait2,
    size: { w: 258, h: 318 },
    gridHeight: 185,
  },
  {
    slug: "piece-6",
    title: "Title",
    medium: "type",
    year: "year",
    category: "portraits",
    blurb: BLURB,
    gradient: G.portrait,
    size: { w: 258, h: 318 },
    gridHeight: 205,
  },
  {
    slug: "piece-7",
    title: "Title",
    medium: "type",
    year: "year",
    category: "web",
    blurb: BLURB,
    gradient: G.web,
    size: { w: 384, h: 240 },
    gridHeight: 165,
  },
  {
    slug: "piece-8",
    title: "Title",
    medium: "type",
    year: "year",
    category: "motion",
    blurb: BLURB,
    gradient: G.motion,
    size: { w: 288, h: 288 },
    gridHeight: 185,
  },
];

export function getPiece(slug: string): DesignPiece | undefined {
  return pieces.find((p) => p.slug === slug);
}

// filter options derived from existing pieces (order preserved),
// so the chip bar stays in sync with the data
export function pieceCategories(): Array<"all" | DesignCategory> {
  const seen: DesignCategory[] = [];
  for (const p of pieces) {
    if (!seen.includes(p.category)) seen.push(p.category);
  }
  return ["all", ...seen];
}
