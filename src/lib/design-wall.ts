// pure geometry for the draggable design wall — split out from the canvas/DOM so
// the layout + boundary + drag-clamp math can be unit-tested in isolation
// (mirrors the pure/shell split in src/lib/canvas/).

export interface WallItem {
  x: number; // resting offset from wall center
  y: number;
  w: number; // piece width
  h: number; // piece height
}

export interface WallBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  cx: number; // center of the extent
  cy: number;
}

// how far past each piece the gallery extent reaches (matches the frame padding)
const HALF_MARGIN_X = 30;
const HALF_MARGIN_Y = 36;

// derive the gallery extent from the pieces, so it grows as pieces are added
export function computeWallBounds(items: WallItem[]): WallBounds {
  if (items.length === 0) {
    return { minX: 0, maxX: 0, minY: 0, maxY: 0, cx: 0, cy: 0 };
  }
  let minX = Infinity,
    maxX = -Infinity,
    minY = Infinity,
    maxY = -Infinity;
  for (const p of items) {
    const hw = p.w / 2 + HALF_MARGIN_X;
    const hh = p.h / 2 + HALF_MARGIN_Y;
    minX = Math.min(minX, p.x - hw);
    maxX = Math.max(maxX, p.x + hw);
    minY = Math.min(minY, p.y - hh);
    maxY = Math.max(maxY, p.y + hh);
  }
  return { minX, maxX, minY, maxY, cx: (minX + maxX) / 2, cy: (minY + maxY) / 2 };
}

// clamp a camera offset so the drag stops `pad` px past the gallery extent. when
// the extent is smaller than the viewport on an axis, it locks to centered.
export function clampCamAxis(
  value: number,
  min: number,
  max: number,
  viewport: number,
  center: number,
  pad: number,
): number {
  let lo = viewport / 2 - max - pad;
  let hi = -viewport / 2 - min + pad;
  if (lo > hi) lo = hi = -center;
  if (value < lo) return lo;
  if (value > hi) return hi;
  return value;
}

// ---------------------------------------------------------------------------
// auto-layout — scatter pieces randomly but with guaranteed spacing
// ---------------------------------------------------------------------------

export interface PiecePlacement {
  x?: number;
  y?: number;
  rot?: number;
  depth?: number;
}

export interface LayoutInput {
  slug: string;
  width: number;
  height: number;
  place?: PiecePlacement; // optional manual override (per field)
}

export interface Placement {
  x: number;
  y: number;
  rot: number;
  depth: number;
}

// min edge-to-edge gap between two pieces. Y is roomier so the hover caption
// (which drops below a piece) never lands on the neighbor beneath it.
const GAP_X = 58;
const GAP_Y = 84;
const MAX_TILT = 4; // ±deg of resting tilt
const LAYOUT_SEED = 20260715; // fixed so the scatter is stable across reloads

// tiny deterministic PRNG (mulberry32) — same seed → same scatter every time,
// which keeps the layout stable and unit-testable (no Math.random anywhere)
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// two rectangles (centered at their x/y) clear each other if there's a big enough
// gap on either axis
function clears(
  ax: number,
  ay: number,
  aw: number,
  ah: number,
  bx: number,
  by: number,
  bw: number,
  bh: number,
): boolean {
  return (
    Math.abs(ax - bx) >= (aw + bw) / 2 + GAP_X || Math.abs(ay - by) >= (ah + bh) / 2 + GAP_Y
  );
}

// Place pieces center-outward: the biggest piece anchors the middle, then each
// piece searches from radius 0 outward and takes the SMALLEST radius (at a random
// angle) that clears everything placed so far. This keeps a dense, centered
// cluster instead of an even spray — pieces only push outward when the middle is
// full, and the random angle keeps it organic rather than a rigid ring. Manual
// `place` overrides win outright. Deterministic (seeded), so it's stable + testable.
const RADIUS_STEP = 22; // px granularity of the outward search

export function layoutWall(items: LayoutInput[]): Map<string, Placement> {
  const out = new Map<string, Placement>();
  if (items.length === 0) return out;

  const rand = mulberry32(LAYOUT_SEED);
  const placed: Array<{ x: number; y: number; w: number; h: number }> = [];

  // an upper bound on how far out we ever need to look, ~proportional to footprint
  const footprint = items.reduce((s, it) => s + (it.width + GAP_X) * (it.height + GAP_Y), 0);
  const maxRadius = Math.sqrt(footprint) * 1.2;

  // largest first for tighter packing; stable sort keeps ties deterministic
  const order = [...items].sort((a, b) => b.width * b.height - a.width * a.height);

  for (const it of order) {
    const tilt = it.place?.rot ?? (rand() * 2 - 1) * MAX_TILT;
    const depth = it.place?.depth ?? 0.9 + rand() * 0.2;

    // a fully-pinned override skips the search entirely
    if (it.place?.x != null && it.place?.y != null) {
      out.set(it.slug, { x: it.place.x, y: it.place.y, rot: tilt, depth });
      placed.push({ x: it.place.x, y: it.place.y, w: it.width, h: it.height });
      continue;
    }

    let best: { x: number; y: number } | null = null;
    for (let r = 0; r <= maxRadius && !best; r += RADIUS_STEP) {
      // sample more angles as the ring grows, so the search stays dense
      const tries = r === 0 ? 1 : Math.max(10, Math.round((2 * Math.PI * r) / RADIUS_STEP));
      for (let k = 0; k < tries; k++) {
        const ang = rand() * Math.PI * 2;
        const x = it.place?.x ?? Math.cos(ang) * r;
        const y = it.place?.y ?? Math.sin(ang) * r;
        if (placed.every((q) => clears(x, y, it.width, it.height, q.x, q.y, q.w, q.h))) {
          best = { x, y };
          break;
        }
      }
    }
    // extremely unlikely, but never leave a piece unplaced
    if (!best) best = { x: (rand() * 2 - 1) * maxRadius, y: (rand() * 2 - 1) * maxRadius };

    out.set(it.slug, { x: best.x, y: best.y, rot: tilt, depth });
    placed.push({ x: best.x, y: best.y, w: it.width, h: it.height });
  }

  return out;
}
