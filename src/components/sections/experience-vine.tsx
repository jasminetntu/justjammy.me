"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { useFx } from "@/components/layout/fx-provider";
import { BackLink } from "@/components/ui/back-link";
import { FourPointStar } from "@/components/ui/four-point-star";
import { EXPERIENCE_ZONE_WASHES } from "@/lib/canvas/wash";
import {
  certifications,
  currently,
  projectsSection,
  skills,
  timeline,
  type TimelineSection,
} from "@/content/experience";
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

// two-column layout: a fixed identity sidebar (back · title · currently · skills ·
// featured projects) + a scrolling "growing stem" timeline on the right.
export function ExperienceVine() {
  const projects = featuredProjects();
  const scrollRef = useRef<HTMLDivElement>(null);
  // mobile-only: skills + certs collapse so the work timeline surfaces first
  const [skillsOpen, setSkillsOpen] = useState(false);
  useScrollWash(scrollRef);

  return (
    // desktop: fixed two-column (scroll-independent sidebar + timeline).
    // mobile: normal document flow — sidebar stacks on top, timeline below,
    // the whole page scrolls as one.
    <main className="min-h-dvh md:fixed md:inset-0 md:flex md:overflow-hidden">
      {/* ── SIDEBAR ── */}
      <aside
        className="flex flex-col bg-[linear-gradient(to_bottom,rgba(255,255,255,.32)_72%,rgba(255,255,255,0))] px-[clamp(28px,3vw,40px)] pb-6 pt-[92px] md:h-full md:overflow-y-auto md:border-r md:border-[rgba(154,127,107,.14)] md:bg-white/30 md:bg-none md:pb-9 md:pt-[76px] md:backdrop-blur-[3px]"
        style={{ flex: "0 0 clamp(356px,35vw,476px)" }}
      >
        <div className="mb-2.5 mt-2">
          <BackLink className="text-[#8a9a7e]" />
        </div>
        <h1 className="font-serif m-0 mb-[14px] text-[17px] font-medium uppercase italic leading-none tracking-[.18em] text-[#93a06f]">
          experience
        </h1>
        <div className="flex items-center gap-2.5">
          {/* star on desktop only — on mobile "Currently" reads as a plain subtitle */}
          <span className="hidden md:inline-flex">
            <FourPointStar size={15} color="#8ea36c" style={{ filter: "none" }} />
          </span>
          <span className="font-serif text-[16px] italic leading-[1.3] text-[#6f6a54]">
            Currently — {currently}
          </span>
        </div>

        {/* divider only on desktop — on mobile the toggle row's own underline is
            the single separator (avoids doubled-up lines) */}
        <div className="my-[22px] hidden shrink-0 border-t border-[rgba(154,127,107,.18)] md:block" />

        {/* mobile-only toggle — collapses skills + certs so the work timeline
            (NVIDIA / Google) surfaces first. flat editorial row: label + a
            four-point star that spins open. the whole row is the tap target.
            hidden on desktop, where the sidebar shows everything expanded */}
        <button
          type="button"
          onClick={() => setSkillsOpen((o) => !o)}
          aria-expanded={skillsOpen}
          className="mt-[22px] flex w-full items-center gap-2.5 border-b border-[rgba(154,127,107,.18)] pb-3 md:hidden"
        >
          <FourPointStar
            size={15}
            color="#8ea36c"
            className="shrink-0 transition-transform duration-500 ease-out"
            style={{ transform: skillsOpen ? "rotate(45deg) scale(1.12)" : "rotate(0deg)" }}
          />
          <span className="font-serif text-[13px] uppercase italic tracking-[.16em] text-[#7a8a5f]">
            Skills &amp; Certifications
          </span>
        </button>

        {/* collapsible on mobile (animated height + fade); always open on desktop.
            grid-rows 0fr→1fr animates to the content's natural height */}
        <div
          className={`grid transition-[grid-template-rows] duration-500 ease-out md:grid-rows-[1fr] ${
            skillsOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
          }`}
        >
          <div
            className={`min-h-0 overflow-hidden pt-5 transition-opacity duration-500 ease-out md:pt-0 md:opacity-100 ${
              skillsOpen ? "opacity-100" : "opacity-0"
            }`}
          >
          {/* skills ledger */}
          <div className="font-serif mb-2 text-[13px] uppercase italic tracking-[.16em] text-[#7a8a5f]">
            Skills
          </div>
          <div>
            {skills.map((s) => (
              <div key={s.category} className="flex gap-4 py-2">
                <div className="font-serif flex-[0_0_92px] text-[15px] italic leading-[1.3] text-[#a89a86]">
                  {s.category}
                </div>
                <div className="flex-1 text-[13px] leading-[1.5] text-ink-dark">{s.value}</div>
              </div>
            ))}
          </div>

          {/* certifications */}
          <div className="my-[22px] shrink-0 border-t border-[rgba(154,127,107,.18)]" />
          <div className="font-serif mb-3 text-[13px] uppercase italic tracking-[.16em] text-[#7a8a5f]">
            Certifications
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            {certifications.map((c) => (
              <a
                key={c.name}
                href={c.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group block"
              >
                <div className="text-[13.5px] font-medium leading-snug text-ink-dark transition-colors group-hover:text-green-deep">
                  {c.name}
                </div>
                <div className="font-serif text-[12.5px] italic text-[#a89a86]">
                  {c.issuer} · {c.date}
                </div>
              </a>
            ))}
          </div>
          </div>
        </div>

      </aside>

      {/* ── TIMELINE ── */}
      <div ref={scrollRef} className="relative min-w-0 md:h-full md:flex-1 md:overflow-y-auto">
        <div className="mx-auto max-w-[720px] px-[clamp(24px,4vw,52px)] pb-24 pt-6 md:pt-[112px]">
          <div className="relative">
            {timeline.map((section, si) => (
              <VineSection
                key={section.key}
                section={section}
                prevColor={si === 0 ? null : timeline[si - 1].bloom}
              />
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
                    <span className="font-serif text-[15px] italic text-[#a493c6]">
                      case studies blooming soon ✦
                    </span>
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
        </div>
      </div>
    </main>
  );
}

function VineSection({ section, prevColor }: { section: TimelineSection; prevColor: string | null }) {
  return (
    <section data-zone={section.key}>
      <SectionHeader label={section.label} bloom={section.bloom} heading={section.heading} fromColor={prevColor} />
      {section.entries.map((entry, i) => {
        const isLast = i === section.entries.length - 1;
        const tint = stemTint(section.bloom);
        return (
        <Reveal key={`${entry.org}-${entry.role}`} className="relative flex gap-[26px]" delay={i * 0.09}>
          <Rail>
            {/* the last entry's stem fades out, so sections read as separate blooms */}
            <div
              className="absolute bottom-0 left-1/2 top-0 w-0.5 -translate-x-1/2"
              style={{ background: isLast ? `linear-gradient(${tint} 0%, ${tint} 42%, transparent 100%)` : tint }}
            />
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
        );
      })}
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

  // stem is solid below the medallion (no incoming line above it) — the soft
  // break between sections comes from the previous section's last entry fading
  // out. the final (projects) stem fades out at the bottom.
  const tint = stemTint(bloom);
  const line = toTransparent
    ? `linear-gradient(${tint} 0px, ${tint} ${bloomTop + 56}px, rgba(154,123,191,0) 100%)`
    : tint;

  return (
    <Reveal className="relative flex gap-[26px]">
      <Rail>
        <div
          className="absolute left-1/2 w-0.5 -translate-x-1/2"
          style={{ top: continuing ? bloomTop : 24, bottom: toTransparent ? 34 : 0, background: line }}
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

// shift the background wash as sections scroll past the timeline's midpoint
function useScrollWash(scrollRef: React.RefObject<HTMLElement | null>) {
  const { setWashOverride } = useFx();
  const current = useRef<string | null>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const zones = Array.from(el.querySelectorAll<HTMLElement>("[data-zone]"));
    const compute = () => {
      // viewport midpoint — works whether the timeline scrolls in its own
      // container (desktop) or the whole page scrolls (mobile stacked layout)
      const mid = window.innerHeight * 0.5;
      let active: keyof typeof EXPERIENCE_ZONE_WASHES = "work";
      for (const z of zones) {
        if (z.getBoundingClientRect().top <= mid) active = z.dataset.zone as keyof typeof EXPERIENCE_ZONE_WASHES;
        else break;
      }
      if (current.current !== active) {
        current.current = active;
        setWashOverride(EXPERIENCE_ZONE_WASHES[active]);
      }
    };
    compute();
    el.addEventListener("scroll", compute, { passive: true });
    window.addEventListener("scroll", compute, { passive: true });
    window.addEventListener("resize", compute);
    return () => {
      el.removeEventListener("scroll", compute);
      window.removeEventListener("scroll", compute);
      window.removeEventListener("resize", compute);
      setWashOverride(null);
    };
  }, [scrollRef, setWashOverride]);
}
