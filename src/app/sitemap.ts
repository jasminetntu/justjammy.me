import type { MetadataRoute } from "next";

import { pieceSlugs } from "@/content/design";
import { projectSlugs } from "@/content/projects";
import { comingSoon, siteUrl } from "@/content/site";

// emit a static sitemap.xml for the export
export const dynamic = "force-static";

// generated at build — reads the same slugs the pages prerender from, so a
// new design piece / project appears automatically; absolute URLs via siteUrl
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes = ["", "/about", "/experience", "/design", "/contact"].map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: now,
  }));

  // skip detail URLs for coming-soon sections (those routes 404)
  const designRoutes = comingSoon.design
    ? []
    : pieceSlugs().map((slug) => ({ url: `${siteUrl}/design/${slug}`, lastModified: now }));

  const projectRoutes = comingSoon.projects
    ? []
    : projectSlugs().map((slug) => ({ url: `${siteUrl}/projects/${slug}`, lastModified: now }));

  return [...staticRoutes, ...designRoutes, ...projectRoutes];
}
