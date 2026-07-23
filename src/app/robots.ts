import type { MetadataRoute } from "next";

import { siteUrl } from "@/content/site";

// emit a static robots.txt for the export
export const dynamic = "force-static";

// crawlers may index everything; point them at the sitemap — generated
// image routes (opengraph-image/twitter-image) aren't pages, so skipped
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/opengraph-image", "/twitter-image"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
