// project registry — structured metadata lives here (typed, autocompleted);
// long-form case-study prose lives in the sibling `<slug>.mdx` file.
// add a project = one entry here + one MDX file.

export type ProjectLayout = "notes" | "editorial" | "rail";

export interface ProjectStat {
  value: string;
  label: string;
}

export interface ProjectLink {
  label: string;
  href: string;
}

export interface ProjectImage {
  // path under /public, e.g. "/images/projects/<slug>/hero.jpg"
  src: string;
  alt: string;
  caption?: string; // handwritten-style caption in the field-notes layout
}

export interface ProjectMeta {
  slug: string;
  title: string;
  hook: string; // one-line summary, shown on the detail page
  role: string;
  timeframe: string;
  tags: string[];
  category?: string; // at-a-glance type, outline badge — e.g. "Game", "Full-Stack", "AI"
  badge?: string; // standout callout (filled badge) — e.g. "1st place"
  layout: ProjectLayout; // default detail layout
  stats?: ProjectStat[];
  links?: ProjectLink[];
  images?: ProjectImage[];
  featured?: boolean; // surface on the vine's Projects section
}

// ordered as they should appear; the vine reads `featured` ones.
// TODO(jasmine): add real `links` URLs (itch.io / Devpost / live) + `images`
// (0 or 1 for most; a few may have more). tags marked "(confirm)" are guesses
// from the description — correct the stack where I couldn't tell.
export const projects: ProjectMeta[] = [
  {
    slug: "before-i-go",
    title: "Before I Go",
    hook: 'A pixel-style visual novel built in under a week — 1st place out of 40+ teams on the theme "Not Enough Time."',
    role: "Developer · Designer",
    timeframe: "May 2025 · DA Game Jam",
    tags: ["Game Dev", "Visual Novel", "Pixel Art"],
    category: "Game",
    badge: "1st place",
    layout: "notes",
    stats: [{ value: "1st", label: "place · 40+ teams" }],
    featured: true,
  },
  {
    slug: "blowfish-budgeting",
    title: "Blowfish Budgeting",
    hook: "A full-stack budgeting app that automates income, savings, and expense tracking — with a dynamic mascot to keep users motivated.",
    role: "Developer · Designer · Artist",
    timeframe: "May 2025 · DA Hacks 3.5",
    tags: ["Node.js", "Figma", "Full-Stack"],
    category: "Full-Stack",
    layout: "notes",
    featured: true,
  },
  {
    slug: "draftly",
    title: "Draftly",
    hook: "A web app using the OpenAI API to analyze job descriptions and generate tailored resumes.",
    role: "Developer · Designer · Artist",
    timeframe: "Feb 2025 · SCU Hack for Humanity",
    tags: ["Node.js", "OpenAI API", "Web"],
    category: "AI",
    layout: "notes",
    featured: true,
  },
  {
    slug: "murphys-lab",
    title: "Murphy's Lab",
    hook: 'A pixel-style horror survival game in Unity — five enemy AI behaviors and a dynamic survival timer on the theme "Nothing Goes Wrong."',
    role: "Developer · Designer · Artist",
    timeframe: "Feb 2025 · Brackey's Jam",
    tags: ["Unity", "C#", "Game Dev"],
    category: "Game",
    layout: "notes",
    featured: true,
  },
  {
    slug: "where-is-mr-quack",
    title: "Where is Mr. Quack?",
    hook: 'A charming pixel-style RPG in GameMaker with a puzzle-based "bubble-push" mechanic for level progression.',
    role: "Developer · Designer · Artist",
    timeframe: "Jan 2025 · Global Game Jam",
    tags: ["GameMaker", "Game Dev", "RPG"],
    category: "Game",
    layout: "notes",
    featured: true,
  },
];

export function getProject(slug: string): ProjectMeta | undefined {
  return projects.find((p) => p.slug === slug);
}

export function featuredProjects(): ProjectMeta[] {
  return projects.filter((p) => p.featured);
}
