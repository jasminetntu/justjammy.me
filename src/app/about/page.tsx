import type { Metadata } from "next";

import { About } from "@/components/sections/about";

export const metadata: Metadata = {
  title: "About · Jasmine Tu",
};

export default function AboutPage() {
  return <About />;
}
