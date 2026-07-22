import type { MetadataRoute } from "next";

import { pieces } from "@/content/design";
import { projects } from "@/content/projects";
import { siteUrl } from "@/content/site";

// generated at build — reads the same content arrays as the pages, so new
// design pieces / projects appear automatically; absolute URLs via siteUrl
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes = ["", "/about", "/experience", "/design", "/contact"].map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: now,
  }));

  const designRoutes = pieces.map((p) => ({
    url: `${siteUrl}/design/${p.slug}`,
    lastModified: now,
  }));

  const projectRoutes = projects.map((p) => ({
    url: `${siteUrl}/projects/${p.slug}`,
    lastModified: now,
  }));

  return [...staticRoutes, ...designRoutes, ...projectRoutes];
}
