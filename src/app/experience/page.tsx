import type { Metadata } from "next";

import { ExperienceVine } from "@/components/sections/experience-vine";

export const metadata: Metadata = {
  title: "Experience",
  description:
    "Jasmine Tu's work and leadership — software engineering at NVIDIA and Google Cloud — plus skills, certifications, and projects.",
};

export default function ExperiencePage() {
  return <ExperienceVine />;
}
