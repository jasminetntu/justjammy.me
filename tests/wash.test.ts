import { describe, expect, it } from "vitest";

import { cloneWash, stepWash, WASH_SETS, washSpeed } from "@/lib/canvas/wash";

describe("stepWash", () => {
  it("eases every channel toward the target", () => {
    const cur = cloneWash(WASH_SETS.garden);
    const target = WASH_SETS.contact;
    const before = cur[0][3];
    stepWash(cur, target, 0.5);
    expect(cur[0][3]).toBeCloseTo(before + (target[0][3] - before) * 0.5);
  });

  it("converges to the target after enough steps", () => {
    const cur = cloneWash(WASH_SETS.garden);
    const target = WASH_SETS.experience;
    for (let i = 0; i < 800; i++) stepWash(cur, target, 0.018);
    for (let i = 0; i < 4; i++) {
      for (let k = 0; k < 4; k++) {
        expect(cur[i][k]).toBeCloseTo(target[i][k], 2);
      }
    }
  });

  it("cloneWash returns an independent copy", () => {
    const a = cloneWash(WASH_SETS.garden);
    a[0][0] = 999;
    expect(WASH_SETS.garden[0][0]).not.toBe(999);
  });
});

describe("washSpeed", () => {
  it("lerps slower on experience for gradual scroll moods", () => {
    expect(washSpeed("experience")).toBeLessThan(washSpeed("garden"));
  });
});
