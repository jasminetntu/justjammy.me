import { describe, expect, it } from "vitest";

import { PETAL_ANGLES, PETAL_RADIUS, petalOffset } from "@/lib/radial";

describe("petalOffset", () => {
  it("places every petal on the arc radius", () => {
    for (let i = 0; i < PETAL_ANGLES.length; i++) {
      const { dx, dy } = petalOffset(i);
      expect(Math.hypot(dx, dy)).toBeCloseTo(PETAL_RADIUS);
    }
  });

  it("blooms toward the lower-left quadrant", () => {
    for (let i = 0; i < PETAL_ANGLES.length; i++) {
      const { dx, dy } = petalOffset(i);
      expect(dx).toBeLessThanOrEqual(0);
      expect(dy).toBeGreaterThanOrEqual(0);
    }
  });
});
