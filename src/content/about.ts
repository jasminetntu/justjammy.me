// about page content — **word** renders bold (see src/lib/emphasis.ts)

export const about = {
  paragraphs: [
    "I’m Jasmine — a Vietnamese software engineer and designer from the Bay Area, studying Computer Science at **UC Irvine**. I just wrapped a Software Engineer internship at **NVIDIA**, where I architected full-stack analytics for AI-first IT support. Before that, I built multi-agent AI systems at **Google Cloud**.",
    "**Women in tech** is close to my heart, and so is design. I like bringing art and technology together to make empathetic, human-centered experiences, whether that’s an interface or a game.",
    "When I’m not working, you’ll find me collecting trinkets, sketching portraits, chasing good food, exploring nature, and living life to the fullest! .☘︎ ݁˖",
  ],
  // set to undefined to fall back to the "your portrait" placeholder
  portrait: "/images/jtu_headshot.jpg" as string | undefined,
  skills: ["Full-Stack", "Agentic AI", "UI/UX", "SQL", "Systems Design", "Data Analysis", "Mentoring"],
  highlights: [
    { title: "C.S. @ UC Irvine", detail: "4.0 GPA" },
    { title: "NVIDIA", detail: "SWE Intern, 2026" },
    { title: "Google Cloud", detail: "Agentic AI Intern, 2025" },
    { title: "Alumni", detail: "Year Up · Break Through Tech" },
  ],
};
