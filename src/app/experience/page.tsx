import type { Metadata } from "next";

import { ExperienceVine } from "@/components/sections/experience-vine";

export const metadata: Metadata = {
  title: "Experience · Jasmine Tu",
};

export default function ExperiencePage() {
  return <ExperienceVine />;
}
