// site-wide content — edit here, the components pick it up

export const site = {
  name: "Jasmine Tu",
  description: "Portfolio of Jasmine Tu — software engineer & designer.",
  email: "jasminetntu@gmail.com",
  linkedin: "https://www.linkedin.com/in/jasminetntu/",
  github: "https://github.com/jasminetntu",
  instagram: "https://www.instagram.com/jammydoodlez",
} as const;

// rotating subtitle on the home page (cross-fades every ~5.2s)
export const taglines = [
  "software engineer & designer",
  "previously at NVIDIA & Google Cloud",
  "studying C.S. at UC Irvine",
  "your favorite woman in tech",
  "collector of trinkets",
  "fueled by matcha & curiosity",
] as const;

// the four corner stars of the constellation garden
// hx/hy = corner direction (-1..1); color = hover + click-burst tint
export interface GardenNode {
  key: string;
  label: string;
  href: string;
  color: string;
  hx: number;
  hy: number;
}

export const gardenNodes: GardenNode[] = [
  { key: "about", label: "about", href: "/about", color: "#a6c293", hx: -0.96, hy: -0.95 },
  { key: "experience", label: "experience", href: "/experience", color: "#a6c293", hx: 0.96, hy: -0.95 },
  { key: "design", label: "design", href: "/design", color: "#dd8fb6", hx: -0.96, hy: 0.93 },
  { key: "contact", label: "contact", href: "/contact", color: "#e2a7c4", hx: 0.96, hy: 0.93 },
];
