import type { Metadata } from "next";

import { ExperienceVine } from "@/components/sections/experience-vine";
import { getFeaturedProjects } from "@/content/projects";
import { comingSoon } from "@/content/site";

export const metadata: Metadata = {
  title: "Experience",
  description:
    "Jasmine Tu's work and leadership — software engineering at NVIDIA and Google Cloud — plus skills, certifications, and projects.",
};

export default async function ExperiencePage() {
  // coming-soon toggle → empty list falls through to the vine's "blooming soon" state
  const projects = comingSoon.projects ? [] : await getFeaturedProjects();
  return <ExperienceVine projects={projects} />;
}
