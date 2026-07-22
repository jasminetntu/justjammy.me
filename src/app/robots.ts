import type { MetadataRoute } from "next";

import { siteUrl } from "@/content/site";

// crawlers may index everything; point them at the sitemap. the generated
// image routes (opengraph-image/twitter-image) aren't pages, so they're skipped.
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
