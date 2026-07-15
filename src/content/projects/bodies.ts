import type { ComponentType } from "react";

// maps a project slug to its MDX case-study body. one entry per project,
// alongside its metadata in index.ts. kept explicit (not a glob) so the
// bundler statically resolves each import.
export const projectBodies: Record<string, () => Promise<{ default: ComponentType }>> = {
  "before-i-go": () => import("./before-i-go.mdx"),
  "blowfish-budgeting": () => import("./blowfish-budgeting.mdx"),
  draftly: () => import("./draftly.mdx"),
  "murphys-lab": () => import("./murphys-lab.mdx"),
  "where-is-mr-quack": () => import("./where-is-mr-quack.mdx"),
};
