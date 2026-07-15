// experience timeline — the "growing stem" vine on /experience.
// dates are display strings (ranges are irregularly formatted) kept verbatim
// from the locked prototype.

export interface TimelineEntry {
  role: string;
  org: string;
  dates: string;
  blurb: string;
}

export interface TimelineSection {
  key: "work" | "leadership";
  label: string;
  // bloom medallion + stem color, entry-date color, section-heading color
  bloom: string;
  accent: string;
  heading: string;
  entries: TimelineEntry[];
}

export const currently = "Computer Science @ UC Irvine";

export const timeline: TimelineSection[] = [
  {
    key: "work",
    label: "Work",
    bloom: "#7fa06e",
    accent: "#7fa06e",
    heading: "#46603a",
    entries: [
      {
        role: "Software Engineer Intern",
        org: "NVIDIA",
        dates: "Jan 2026 – Present",
        blurb:
          "Full-stack analytics platform for AI-first IT support — monthly analysis from ~6 hours to minutes, report prep ~95% faster.",
      },
      {
        role: "Agentic AI Intern",
        org: "Google Cloud",
        dates: "Jul – Aug 2025",
        blurb:
          "Multi-agent system automating security scans across ~25 GCP services — manual analysis down over 90%.",
      },
      {
        role: "Customer Service Specialist",
        org: "Tastea",
        dates: "May 2024 – Aug 2025",
        blurb:
          "Crafted drinks and trained new hires in a fast-paced café — helping support $7–9K in monthly revenue.",
      },
      {
        role: "Mathematics Tutor",
        org: "Goodwill of the Greater East Bay",
        dates: "Aug 2021 – May 2023",
        blurb:
          "Tutored high schoolers in AP Calculus & Statistics, lifting performance ~20% by making hard concepts click.",
      },
    ],
  },
  {
    key: "leadership",
    label: "Leadership",
    bloom: "#dd8fb6",
    accent: "#c2789f",
    heading: "#a8557f",
    entries: [
      {
        role: "President",
        org: "Women in CS",
        dates: "Aug 2025 – Jun 2026",
        blurb:
          "Directing workshops, career events, and corporate partnerships — expanding opportunities and building an empowering, inclusive space for women in tech.",
      },
      {
        role: "Creative Director",
        org: "Game Dev Club",
        dates: "Jul 2025 – Jun 2026",
        blurb:
          "Leading creative direction and branding — designing promotional materials and running workshops and game jams to foster an engaged community.",
      },
      {
        role: "Product Director",
        org: "De Anza Expo",
        dates: "Sep 2025 – May 2026",
        blurb:
          "Directed branding, visual identity, and attendee experience design for De Anza's student-led tech showcase.",
      },
    ],
  },
];

// projects section colors (the third bloom on the vine)
export const projectsSection = {
  label: "Projects",
  bloom: "#9a7bbf",
  accent: "#a493c6",
  heading: "#6f5ba0",
};
