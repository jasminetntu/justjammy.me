// site-wide content — edit here, the components pick it up

// canonical origin for absolute URLs (share images, sitemap); resolves an
// explicit override first, then the Vercel deploy URL, then a placeholder
// TODO(jasmine): set NEXT_PUBLIC_SITE_URL (or edit the fallback) to the real domain
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://jasmine-tu.vercel.app");

export const site = {
  name: "Jasmine Tu",
  description: "Portfolio of Jasmine Tu — software engineer & designer.",
  email: "jasminetntu@gmail.com",
  linkedin: "https://www.linkedin.com/in/jasminetntu/",
  github: "https://github.com/jasminetntu",
  instagram: "https://www.instagram.com/jammydoodlez",
  // TODO(jasmine): drop the PDF at public/jasmine-tu-resume.pdf (404s until then)
  resume: "/jasmine-tu-resume.pdf",
  location: "San Jose & Irvine",
  availability: "Open to internships & flexible roles",
} as const;

// flip a flag to true to show an on-brand "coming soon" state instead of the
// placeholder content — /design shows a coming-soon page, and the experience
// vine's Projects section shows "blooming soon" (detail routes stop building)
export const comingSoon = {
  design: true,
  projects: true,
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

// four corner stars of the constellation garden
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
