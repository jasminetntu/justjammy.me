// route → view mapping; view drives background wash mood + ribbon visibility

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
