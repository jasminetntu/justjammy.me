import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProjectDetail } from "@/components/sections/project-detail";
import { projectBodies } from "@/content/projects/bodies";
import { getProject, projects } from "@/content/projects";

interface Params {
  params: Promise<{ slug: string }>;
}

// prerender a static page per project
export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  return {
    title: project.title,
    description: project.hook,
  };
}

export default async function ProjectPage({ params }: Params) {
  const { slug } = await params;
  const project = getProject(slug);
  const loadBody = projectBodies[slug];
  if (!project || !loadBody) notFound();

  const { default: Body } = await loadBody();
  return <ProjectDetail meta={project} Body={Body} />;
}
