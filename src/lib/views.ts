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
  const path = pathname.replace(/\/+$/, "") || "/";
  if (path === "/about") return "about";
  if (path === "/experience") return "experience";
  if (path === "/projects" || path.startsWith("/projects/")) return "project";
  if (path === "/design") return "design";
  if (path.startsWith("/design/")) return "piece";
  if (path === "/contact") return "contact";
  return "garden";
}
