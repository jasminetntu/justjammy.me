import type { Metadata } from "next";

import { DesignGallery } from "@/components/sections/design-gallery";

export const metadata: Metadata = {
  title: "Design",
  description: "A wandering gallery of posters, portraits, and motion work by Jasmine Tu.",
};

export default function DesignPage() {
  return <DesignGallery />;
}
