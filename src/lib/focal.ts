// a focal point for object-cover/object-contain images — percentages from
// the top-left, same convention as CSS object-position. Non-destructive: the
// source file is untouched, this just steers which part stays visible when
// the frame crops it. Omit to keep the default center crop.
export interface Focal {
  x: number; // 0-100
  y: number; // 0-100
}

export function focalPosition(focal?: Focal): string | undefined {
  return focal ? `${focal.x}% ${focal.y}%` : undefined;
}
