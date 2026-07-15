import { describe, expect, it } from "vitest";

import {
  clampCamAxis,
  computeWallBounds,
  layoutWall,
  type LayoutInput,
  type WallItem,
} from "@/lib/design-wall";

describe("computeWallBounds", () => {
  it("returns a zeroed extent for no pieces", () => {
    expect(computeWallBounds([])).toEqual({ minX: 0, maxX: 0, minY: 0, maxY: 0, cx: 0, cy: 0 });
  });

  it("pads each piece by its half-size plus a margin", () => {
    const items: WallItem[] = [{ x: 0, y: 0, w: 100, h: 200 }];
    const b = computeWallBounds(items);
    // half width 50 + margin 30 = 80 ; half height 100 + margin 36 = 136
    expect(b).toEqual({ minX: -80, maxX: 80, minY: -136, maxY: 136, cx: 0, cy: 0 });
  });

  it("spans the union of all pieces and centers the extent", () => {
    const items: WallItem[] = [
      { x: -200, y: 0, w: 100, h: 100 },
      { x: 300, y: 0, w: 100, h: 100 },
    ];
    const b = computeWallBounds(items);
    expect(b.minX).toBe(-280); // -200 - (50+30)
    expect(b.maxX).toBe(380); //  300 + (50+30)
    expect(b.cx).toBe(50); // midpoint
  });
});

describe("clampCamAxis", () => {
  // a wide extent (bigger than the viewport) leaves room to drag between edges
  const min = -500;
  const max = 500;
  const center = 0;
  const viewport = 400;
  const pad = 100;

  it("passes through a value already within range", () => {
    expect(clampCamAxis(0, min, max, viewport, center, pad)).toBe(0);
  });

  it("clamps past the far edge", () => {
    const lo = viewport / 2 - max - pad; // 200 - 500 - 100 = -400
    expect(clampCamAxis(-9999, min, max, viewport, center, pad)).toBe(lo);
  });

  it("clamps past the near edge", () => {
    const hi = -viewport / 2 - min + pad; // -200 + 500 + 100 = 400
    expect(clampCamAxis(9999, min, max, viewport, center, pad)).toBe(hi);
  });

  it("locks to centered when the extent is smaller than the viewport", () => {
    // narrow extent, wide viewport => nowhere to drag, snaps to -center
    expect(clampCamAxis(50, -50, 50, 1000, 0, pad)).toBe(-0);
    expect(clampCamAxis(-50, -50, 50, 1000, 0, pad)).toBe(-0);
  });
});

describe("layoutWall", () => {
  // the real placeholder set: a mix of sizes, no manual placement
  const sample: LayoutInput[] = [
    { slug: "a", width: 240, height: 316 },
    { slug: "b", width: 240, height: 316 },
    { slug: "c", width: 240, height: 316 },
    { slug: "d", width: 258, height: 318 },
    { slug: "e", width: 258, height: 318 },
    { slug: "f", width: 258, height: 318 },
    { slug: "g", width: 384, height: 240 },
    { slug: "h", width: 288, height: 288 },
  ];

  // two centered rectangles overlap unless there's a clear gap on some axis
  const overlaps = (
    a: { x: number; y: number; w: number; h: number },
    b: { x: number; y: number; w: number; h: number },
  ) => Math.abs(a.x - b.x) < (a.w + b.w) / 2 && Math.abs(a.y - b.y) < (a.h + b.h) / 2;

  it("returns an empty map for no pieces", () => {
    expect(layoutWall([]).size).toBe(0);
  });

  it("places every piece exactly once", () => {
    const out = layoutWall(sample);
    expect(out.size).toBe(sample.length);
    for (const s of sample) expect(out.has(s.slug)).toBe(true);
  });

  it("never overlaps two pieces", () => {
    const out = layoutWall(sample);
    const rects = sample.map((s) => ({ ...out.get(s.slug)!, w: s.width, h: s.height }));
    for (let i = 0; i < rects.length; i++) {
      for (let j = i + 1; j < rects.length; j++) {
        expect(overlaps(rects[i], rects[j])).toBe(false);
      }
    }
  });

  it("is deterministic — same input, same scatter", () => {
    const a = layoutWall(sample);
    const b = layoutWall(sample);
    for (const s of sample) {
      expect(a.get(s.slug)).toEqual(b.get(s.slug));
    }
  });

  it("honors a manual position override", () => {
    const out = layoutWall([
      { slug: "pinned", width: 240, height: 316, place: { x: 111, y: -222, rot: 5, depth: 1.3 } },
    ]);
    expect(out.get("pinned")).toEqual({ x: 111, y: -222, rot: 5, depth: 1.3 });
  });
});
