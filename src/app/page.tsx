import type { Metadata } from "next";

import { Garden } from "@/components/sections/garden";

export const metadata: Metadata = {
  // the title template doesn't apply to the root segment, so spell it out
  title: { absolute: "Home · Jasmine Tu" },
};

export default function HomePage() {
  return <Garden />;
}
