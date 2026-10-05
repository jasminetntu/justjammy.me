import type { Metadata } from "next";

import { ComingSoon } from "@/components/sections/coming-soon";
import { DesignGallery } from "@/components/sections/design-gallery";
import { getAllPieces } from "@/content/design";
import { comingSoon } from "@/content/site";

export const metadata: Metadata = {
  title: "Design",
  description: "A wandering gallery of posters, portraits, and motion work by Jasmine Tu.",
};

export default async function DesignPage() {
  if (comingSoon.design) return <ComingSoon eyebrow="design" />;
  const pieces = await getAllPieces();
  return <DesignGallery pieces={pieces} />;
}
