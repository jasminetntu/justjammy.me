import type { Metadata } from "next";

import { Garden } from "@/components/sections/garden";

export const metadata: Metadata = {
  // title template doesn't apply to the root segment — spell it out
  title: { absolute: "Home · Jasmine Tu" },
};

export default function HomePage() {
  return <Garden />;
}
