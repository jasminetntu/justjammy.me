// quarter-circle bloom geometry for the radial nav (top-right star trigger)

export const PETAL_ANGLES = [8, 35, 62, 89] as const;
export const PETAL_RADIUS = 84;

// petals bloom toward the lower-left of the trigger
export function petalOffset(index: number): { dx: number; dy: number } {
  const t = (PETAL_ANGLES[index] * Math.PI) / 180;
  return {
    dx: -PETAL_RADIUS * Math.cos(t),
    dy: PETAL_RADIUS * Math.sin(t),
  };
}
