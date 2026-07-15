"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { useFx } from "@/components/layout/fx-provider";
import { BackLink } from "@/components/ui/back-link";
import { FourPointStar } from "@/components/ui/four-point-star";
import { EXPERIENCE_ZONE_WASHES } from "@/lib/canvas/wash";
import { currently, projectsSection, timeline, type TimelineSection } from "@/content/experience";
import { featuredProjects, type ProjectMeta } from "@/content/projects";
import { ease } from "@/lib/theme";

// fades a block in when it scrolls into view; `delay` staggers siblings that
// enter together (works on load AND when scrolled to, unlike a global timer)
function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? "translateY(0)" : "translateY(12px)",
        transition: `opacity .7s ease ${delay}s, transform .7s ${ease.soft} ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

// the "growing stem": one vine threads top→bottom, each section headed by a
// bloom medallion, entries hanging off as open ledger rows (no cards).
export function ExperienceVine() {
  const projects = featuredProjects();
  useScrollWash();

  return (
    <main className="relative mx-auto w-full max-w-[700px] px-[clamp(24px,5vw,40px)] pb-24 pt-[118px]">
      {/* header */}
      <Reveal className="mb-10">
        <div className="mb-4">
          <BackLink className="text-[#8a9a7e]" />
        </div>
        <h1 className="font-serif m-0 text-center text-[clamp(34px,4.6vw,50px)] font-medium leading-none text-[#46603a]">
          Experience
        </h1>
        <div className="mt-[17px] flex items-center justify-center gap-[9px]">
          <span className="h-1.5 w-1.5 rounded-full bg-green-deep shadow-[0_0_0_4px_rgba(127,160,110,.16)]" />
          <span className="font-serif text-[17px] italic text-[#5d6b50]">Currently — {currently}</span>
        </div>
      </Reveal>

      {/* the vine */}
      <div className="relative">
        {timeline.map((section, si) => (
          <VineSection key={section.key} section={section} prevColor={si === 0 ? null : timeline[si - 1].bloom} />
        ))}

        {/* projects bloom */}
        <div data-zone="projects">
          <SectionHeader
            label={projectsSection.label}
            bloom={projectsSection.bloom}
            heading={projectsSection.heading}
            fromColor={timeline[timeline.length - 1].bloom}
            toTransparent
          >
            {projects.length === 0 ? (
              <Reveal className="mt-5">
                <span className="font-serif text-[15px] italic text-[#a493c6]">case studies blooming soon ✦</span>
              </Reveal>
            ) : (
              <Reveal className="mt-5 grid grid-cols-1 gap-3.5 sm:grid-cols-2" delay={0.1}>
                {projects.map((p, i) => (
                  <ProjectCard key={p.slug} project={p} index={i} />
                ))}
              </Reveal>
            )}
          </SectionHeader>
        </div>
      </div>
    </main>
  );
}

function VineSection({ section, prevColor }: { section: TimelineSection; prevColor: string | null }) {
  return (
    <section data-zone={section.key}>
      <SectionHeader label={section.label} bloom={section.bloom} heading={section.heading} fromColor={prevColor} />
      {section.entries.map((entry, i) => (
        <Reveal key={`${entry.org}-${entry.role}`} className="relative flex gap-[26px]" delay={i * 0.09}>
          <Rail>
            <div className="absolute bottom-0 left-1/2 top-0 w-0.5 -translate-x-1/2" style={{ background: stemTint(section.bloom) }} />
            <span className="absolute left-1/2 top-[14px] z-[2] h-[15px] w-[15px] -translate-x-1/2">
              <FourPointStar size={15} color={section.bloom} style={{ filter: "none" }} />
            </span>
          </Rail>
          <div className="flex-1 pb-[26px] pt-2">
            <div className="flex items-baseline justify-between gap-4">
              <div className="text-[20px] font-semibold text-ink-deep">{entry.role}</div>
              <div className="font-serif whitespace-nowrap text-[15px] font-medium" style={{ color: section.accent }}>
                {entry.dates}
              </div>
            </div>
            <div className="font-serif my-[2px] mb-2 text-[16px] italic" style={{ color: section.accent }}>
              {entry.org}
            </div>
            <p className="m-0 text-[14px] leading-[1.68] text-[#6c5e51]">{entry.blurb}</p>
          </div>
        </Reveal>
      ))}
    </section>
  );
}

// left rail holding the stem line + a node (bloom or dot)
function Rail({ children }: { children: React.ReactNode }) {
  return <div className="relative flex flex-[0_0_48px] justify-center">{children}</div>;
}

// soft gradient fills used when a project has no image yet — palette-matched
// so empty cards still look intentional
const CARD_GRADIENTS = [
  "linear-gradient(150deg,#e7d4f0,#c9a9dd)",
  "linear-gradient(150deg,#f0d4e6,#d69fc6)",
  "linear-gradient(150deg,#dcd6f2,#b9a6dd)",
  "linear-gradient(150deg,#f2d6ec,#cdb4e6)",
  "linear-gradient(150deg,#e3d9f4,#c0a9dd)",
];

// an image tile: cover image (or gradient fallback) with the title bottom-left;
// on hover it lifts, the tint deepens, and a centered description takes over.
function ProjectCard({ project, index }: { project: ProjectMeta; index: number }) {
  const image = project.images?.[0];

  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group relative flex aspect-[4/3] flex-col justify-end overflow-hidden rounded-2xl shadow-[0_6px_20px_rgba(90,66,140,.1)] transition-[transform,box-shadow] duration-[450ms] hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(90,66,140,.22)]"
      style={{ transitionTimingFunction: ease.soft }}
    >
      {/* image or gradient fill */}
      {image ? (
        <Image src={image.src} alt={image.alt} fill sizes="(max-width:640px) 100vw, 280px" className="object-cover" />
      ) : (
        <div className="absolute inset-0" style={{ background: CARD_GRADIENTS[index % CARD_GRADIENTS.length] }} />
      )}

      {/* base tint: darkens toward the bottom for title legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-[rgba(46,32,60,.42)] via-[rgba(46,32,60,.08)] to-transparent" />
      {/* hover tint: soft purple wash over the whole tile */}
      <div className="absolute inset-0 bg-[rgba(90,66,140,.42)] opacity-0 transition-opacity duration-[450ms] group-hover:opacity-100" />

      {/* badges stack top-right: primary award on top, secondary category below */}
      {(project.badge || project.category) && (
        <div className="absolute right-3 top-3 z-10 flex flex-col items-end gap-1.5 transition-opacity duration-300 group-hover:opacity-0">
          {project.badge && (
            <span className="inline-flex items-center gap-1 rounded-full bg-white/85 px-2.5 py-1 text-[11.5px] font-medium text-[#6f5ba0] shadow-sm backdrop-blur-sm">
              <FourPointStar size={10} color="#9a7bbf" style={{ filter: "none" }} />
              {project.badge}
            </span>
          )}
          {project.category && (
            <span className="rounded-full border border-white/70 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
              {project.category}
            </span>
          )}
        </div>
      )}

      {/* title — fades out on hover */}
      <div className="relative z-[5] p-4 transition-opacity duration-300 group-hover:opacity-0">
        <div className="text-[17px] font-semibold leading-tight text-white [text-shadow:0_1px_10px_rgba(0,0,0,.45)]">
          {project.title}
        </div>
      </div>

      {/* description — fades in on hover, centered */}
      <div className="absolute inset-0 z-[6] flex items-center justify-center p-5 opacity-0 transition-opacity duration-[350ms] group-hover:opacity-100">
        <p className="text-center text-[13.5px] font-medium leading-snug text-white [text-shadow:0_1px_10px_rgba(0,0,0,.45)]">
          {project.hook}
        </p>
      </div>
    </Link>
  );
}

function SectionHeader({
  label,
  bloom,
  heading,
  fromColor,
  toTransparent,
  children,
}: {
  label: string;
  bloom: string;
  heading: string;
  fromColor: string | null;
  toTransparent?: boolean;
  children?: React.ReactNode;
}) {
  // sections after the first sit lower with extra top room so the medallion
  // clears the previous section's last entry (and its own first entry below)
  const continuing = fromColor !== null;
  const bloomTop = continuing ? 22 : 0;

  // stem uses the light tint colors (matching the entry lines) so there's no
  // light→dark step where a section starts; the hue change runs BEHIND the
  // medallion [bloomTop → bloomTop+44] so no band shows around the circle.
  const tintFrom = fromColor ? stemTint(fromColor) : stemTint(bloom);
  const tintTo = stemTint(bloom);
  const line = toTransparent
    ? `linear-gradient(${tintFrom} 0px, ${tintFrom} ${bloomTop}px, ${tintTo} ${bloomTop + 44}px, rgba(154,123,191,0) 100%)`
    : fromColor
      ? `linear-gradient(${tintFrom} 0px, ${tintFrom} ${bloomTop}px, ${tintTo} ${bloomTop + 44}px)`
      : tintTo;

  return (
    <Reveal className="relative flex gap-[26px]">
      <Rail>
        <div
          className="absolute left-1/2 w-0.5 -translate-x-1/2"
          style={{ top: fromColor ? 0 : 24, bottom: toTransparent ? 34 : 0, background: line }}
        />
        <span
          className="absolute left-1/2 z-[2] flex h-11 w-11 -translate-x-1/2 items-center justify-center rounded-full"
          style={{ top: bloomTop, background: bloom, boxShadow: `0 6px 16px ${bloom}44` }}
        >
          <FourPointStar size={22} color="#ffffff" style={{ filter: "none" }} />
        </span>
      </Rail>
      {/* min-height guarantees the 44px medallion fits within the header row,
          so the next entry's dot starts below it (no overlap) */}
      <div className="flex-1" style={{ paddingTop: bloomTop + 6, minHeight: bloomTop + 48 }}>
        <div className="font-serif text-[29px] italic leading-none" style={{ color: heading }}>
          {label}
        </div>
        {children}
      </div>
    </Reveal>
  );
}

// entry-line color: a softer tint of the bloom (matches the prototype's #a6c293 / #dcaccb)
function stemTint(bloom: string): string {
  const tints: Record<string, string> = {
    "#7fa06e": "#a6c293",
    "#dd8fb6": "#dcaccb",
    "#9a7bbf": "#c0a9dd",
  };
  return tints[bloom] ?? bloom;
}

// shift the background wash as sections scroll past the viewport midpoint
function useScrollWash() {
  const { setWashOverride } = useFx();
  const current = useRef<string | null>(null);

  useEffect(() => {
    const zones = Array.from(document.querySelectorAll<HTMLElement>("[data-zone]"));
    const compute = () => {
      const mid = window.scrollY + window.innerHeight * 0.5;
      let active: keyof typeof EXPERIENCE_ZONE_WASHES = "work";
      for (const z of zones) {
        if (z.offsetTop <= mid) active = z.dataset.zone as keyof typeof EXPERIENCE_ZONE_WASHES;
        else break;
      }
      // once the projects bloom is near, tip into its lavender mood
      if (current.current !== active) {
        current.current = active;
        setWashOverride(EXPERIENCE_ZONE_WASHES[active]);
      }
    };
    compute();
    window.addEventListener("scroll", compute, { passive: true });
    window.addEventListener("resize", compute);
    return () => {
      window.removeEventListener("scroll", compute);
      window.removeEventListener("resize", compute);
      setWashOverride(null);
    };
  }, [setWashOverride]);
}
