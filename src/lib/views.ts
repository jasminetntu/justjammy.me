// route → view mapping; views drive the background wash mood and ribbon visibility

export const VIEWS = [
  "garden",
  "about",
  "experience",
  "project",
  "design",
  "piece",
  "contact",
] as const;

export type View = (typeof VIEWS)[number];

export function pathToView(pathname: string): View {
  if (pathname === "/about") return "about";
  if (pathname === "/experience") return "experience";
  if (pathname === "/projects" || pathname.startsWith("/projects/")) return "project";
  if (pathname === "/design") return "design";
  if (pathname.startsWith("/design/")) return "piece";
  if (pathname === "/contact") return "contact";
  return "garden";
}

// burst color fired at screen center when navigating to a view
export const VIEW_ACCENT: Record<View, string> = {
  garden: "#e2a7c4",
  about: "#a6c293",
  experience: "#a6c293",
  project: "#9a7bbf",
  design: "#dd8fb6",
  piece: "#c077a3",
  contact: "#e2a7c4",
};
