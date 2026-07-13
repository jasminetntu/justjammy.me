import { describe, expect, it } from "vitest";

import { makeBurst, makeTrailSpark, stepSparks } from "@/lib/canvas/particles";

describe("particles", () => {
  it("makeBurst creates n sparks at the origin point", () => {
    const sparks = makeBurst(100, 200, "#e2a7c4", 16);
    expect(sparks).toHaveLength(16);
    for (const s of sparks) {
      expect(s.x).toBe(100);
      expect(s.y).toBe(200);
      expect(s.life).toBe(1);
    }
  });

  it("stepSparks applies gravity and decays life", () => {
    const sparks = [makeTrailSpark(0, 0)];
    const vyBefore = sparks[0].vy;
    stepSparks(sparks);
    expect(sparks[0].vy).toBeCloseTo(vyBefore + 0.012);
    expect(sparks[0].life).toBeLessThan(1);
  });

  it("stepSparks culls dead sparks", () => {
    const sparks = [makeTrailSpark(0, 0)];
    sparks[0].life = 0.001;
    stepSparks(sparks);
    expect(sparks).toHaveLength(0);
  });
});
