// design tokens lifted from the locked prototype (portfolio-prototype/Home.dc.html + HANDOFF.md)

export const colors = {
  bg: "#f9f5f0",
  ink: "#6b5343",
  inkDark: "#5a4636",
  inkDeep: "#40382f",
  muted: "#8f745e",
  label: "#8a6f5c",
  faint: "#9a8770",
  pink: "#e2a7c4",
  pinkMid: "#dd8fb6",
  pinkDeep: "#c077a3",
  pinkSoft: "#c089ac",
  green: "#a6c293",
  greenDeep: "#7fa06e",
  violet: "#9a7bbf",
  violetSoft: "#c0a9dd",
} as const;

// soft slow easing used everywhere in the prototype
export const ease = {
  soft: "cubic-bezier(.22,1,.36,1)",
  spring: "cubic-bezier(.34,1.56,.64,1)",
} as const;

// 4-point star path shared by every sparkle/medallion (viewBox -12 -12 24 24)
export const STAR_PATH =
  "M0 -11 C1.4 -3 3 -1.4 11 0 C3 1.4 1.4 3 0 11 C-1.4 3 -3 1.4 -11 0 C-3 -1.4 -1.4 -3 0 -11 Z";
