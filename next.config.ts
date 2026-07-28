import createMDX from "@next/mdx";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // allow .mdx alongside .ts/.tsx as page + content extensions
  pageExtensions: ["ts", "tsx", "md", "mdx"],
};

const withMDX = createMDX({
  // add remark/rehype plugins here when a case study needs them
});

export default withMDX(nextConfig);
