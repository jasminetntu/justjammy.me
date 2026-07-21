import type { Metadata } from "next";

import { About } from "@/components/sections/about";

export const metadata: Metadata = {
  title: "About",
  description:
    "Jasmine Tu — a Vietnamese software engineer and designer studying C.S. at UC Irvine, recently at NVIDIA and Google Cloud.",
};

export default function AboutPage() {
  return <About />;
}
