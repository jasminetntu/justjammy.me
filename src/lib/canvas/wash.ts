import type { View } from "@/lib/views";

// one wash = 4 radial color blobs, each [r, g, b, alpha]
export type WashColor = [number, number, number, number];
export type Wash = [WashColor, WashColor, WashColor, WashColor];

// blob anchor positions (fractions of viewport) + radius (fraction of max dimension)
export const WASH_POS = [
  { x: 0.56, y: 0.04, r: 0.62 },
  { x: 0.9, y: 0.5, r: 0.5 },
  { x: 0.1, y: 0.92, r: 0.6 },
  { x: 0.06, y: 0.12, r: 0.4 },
] as const;

// per-view color moods, verbatim from the prototype's washSets
export const WASH_SETS: Record<View, Wash> = {
  garden: [
    [233, 128, 176, 0.26],
    [222, 150, 190, 0.16],
    [160, 190, 128, 0.2],
    [233, 128, 176, 0.12],
  ],
  about: [
    [233, 128, 176, 0.22],
    [244, 212, 196, 0.14],
    [160, 190, 128, 0.13],
    [233, 128, 176, 0.14],
  ],
  experience: [
    [160, 190, 128, 0.2],
    [221, 143, 182, 0.16],
    [154, 123, 191, 0.18],
    [160, 190, 128, 0.1],
  ],
  design: [
    [233, 128, 176, 0.13],
    [222, 150, 190, 0.09],
    [233, 150, 190, 0.08],
    [233, 128, 176, 0.08],
  ],
  contact: [
    // faint: page gradient carries the color, ribbon drifts over it
    [233, 128, 176, 0.06],
    [160, 190, 128, 0.07],
    [176, 150, 224, 0.03],
    [160, 190, 128, 0.05],
  ],
  project: [
    [176, 150, 224, 0.24],
    [201, 174, 240, 0.16],
    [154, 123, 191, 0.16],
    [176, 150, 224, 0.14],
  ],
  piece: [
    [233, 128, 176, 0.3],
    [222, 150, 190, 0.2],
    [233, 150, 190, 0.16],
    [233, 128, 176, 0.18],
  ],
};

// scroll-driven moods on /experience — wash shifts green → pink → lavender as
// each vine section crosses viewport midpoint
export const EXPERIENCE_ZONE_WASHES: Record<"work" | "leadership" | "projects", Wash> = {
  work: [
    [160, 190, 128, 0.22],
    [221, 143, 182, 0.14],
    [154, 123, 191, 0.14],
    [160, 190, 128, 0.1],
  ],
  leadership: [
    [233, 128, 176, 0.22],
    [221, 143, 182, 0.14],
    [160, 190, 128, 0.12],
    [233, 128, 176, 0.14],
  ],
  projects: [
    [154, 123, 191, 0.22],
    [201, 174, 240, 0.14],
    [233, 128, 176, 0.12],
    [154, 123, 191, 0.14],
  ],
};

export function cloneWash(w: Wash): Wash {
  return w.map((c) => [...c]) as Wash;
}

// ease every channel toward the target; mutates `cur` in place (runs per frame)
export function stepWash(cur: Wash, target: Wash, speed: number): void {
  for (let i = 0; i < 4; i++) {
    for (let k = 0; k < 4; k++) {
      cur[i][k] += (target[i][k] - cur[i][k]) * speed;
    }
  }
}

// experience lerps slower so the scroll-driven mood shifts feel gradual
export function washSpeed(view: View): number {
  return view === "experience" ? 0.012 : 0.018;
}
