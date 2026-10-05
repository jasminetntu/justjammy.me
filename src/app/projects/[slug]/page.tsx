import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProjectDetail } from "@/components/sections/project-detail";
import { getProject, projectSlugs } from "@/content/projects";
import { comingSoon } from "@/content/site";

interface Params {
  params: Promise<{ slug: string }>;
}

// prerender a static page per project
export function generateStaticParams() {
  return projectSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  if (comingSoon.projects) return {};
  const { slug } = await params;
  const resolved = await getProject(slug);
  if (!resolved) return {};
  return {
    title: resolved.project.title,
    description: resolved.project.hook,
  };
}

export default async function ProjectPage({ params }: Params) {
  if (comingSoon.projects) notFound(); // detail hidden while projects are coming soon
  const { slug } = await params;
  const resolved = await getProject(slug);
  if (!resolved) notFound();

  return <ProjectDetail meta={resolved.project} Body={resolved.Body} />;
}
