import createMDX from "@next/mdx";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // allow .mdx alongside .ts/.tsx as page + content extensions
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  // static export → out/ folder for upload to shared hosting (Hostinger public_html)
  output: "export",
  // trailing slash so routes export as about/index.html (Apache serves /about cleanly)
  trailingSlash: true,
  // next/image optimization needs a server; static hosting serves images as-is
  images: { unoptimized: true },
};

const withMDX = createMDX({
  // add remark/rehype plugins here when a case study needs them
});

export default withMDX(nextConfig);
