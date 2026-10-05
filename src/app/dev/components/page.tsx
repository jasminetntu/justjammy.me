"use client";

import { BackLink } from "@/components/ui/back-link";
import { FourPointStar } from "@/components/ui/four-point-star";
import { GalleryArrow } from "@/components/ui/gallery-arrow";
import { ImageCardStack } from "@/components/ui/image-card-stack";
import { ImageCarousel } from "@/components/ui/image-carousel";
import { Kaomoji } from "@/components/sections/kaomoji";
import { PolaroidFrame } from "@/components/ui/polaroid-frame";

// hidden component overview — not linked from anywhere on the site. Find it
// by typing the URL. Metadata (title, noindex) lives in the sibling
// layout.tsx since a Client Component can't export `metadata`. Not a
// security boundary — just kept off the public nav.
const DEMO_IMAGES = [
  { src: "/images/design/adobe_illustrator/eraser_study.png", alt: "eraser study", caption: "one" },
  { src: "/images/design/adobe_illustrator/yusaku_kamekura.png", alt: "kamekura study", caption: "two" },
  { src: "/images/design/adobe_illustrator/pencil_study.png", alt: "pencil study", caption: "three" },
  { src: "/images/design/da_expo/sponsor_infographic.png", alt: "sponsors infographic", caption: "four" },
  { src: "/images/design/da_expo/agenda.png", alt: "agenda", caption: "five" },
];

// full pages aren't shown inline here — About / ExperienceVine / DesignGallery
// / ContactLetter / Garden / ComingSoon / ProjectDetail / PieceDetail are each
// a whole fixed-viewport page (several use `fixed inset-0`), not an isolated
// widget, so stacking them on one scrolling page would just collide. Link out
// to the real route instead.
const FULL_PAGES = [
  { name: "Garden (home)", href: "/" },
  { name: "About", href: "/about" },
  { name: "ExperienceVine", href: "/experience" },
  { name: "DesignGallery", href: "/design" },
  { name: "ContactLetter", href: "/contact" },
  { name: "ComingSoon", href: "/design" },
  { name: "ProjectDetail", href: "/projects/before-i-go" },
  { name: "PieceDetail", href: "/design/dax" },
];

function Section({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-[rgba(154,127,107,.18)] py-10 first:border-t-0 first:pt-0">
      <h2 className="font-serif mb-1 text-[22px] italic text-ink-deep">{title}</h2>
      {note && <p className="mb-5 text-[13px] text-ink-muted">{note}</p>}
      <div className="flex flex-wrap items-center gap-8">{children}</div>
    </section>
  );
}

export default function ComponentsOverviewPage() {
  return (
    <main className="mx-auto max-w-[980px] px-[clamp(20px,4vw,40px)] pb-[120px] pt-28">
      <h1 className="font-script mb-2 text-[40px] text-ink-deep">components</h1>
      <p className="mb-10 text-[13px] text-ink-muted">
        Internal overview — every reusable UI component, rendered with sample data. Not linked from the site;
        robots: noindex.
      </p>

      <Section title="BackLink">
        <BackLink />
        <BackLink href="/design" label="Design" className="text-pink-deep" />
      </Section>

      <Section title="FourPointStar">
        <FourPointStar size={16} color="#c089ac" />
        <FourPointStar size={24} color="#7fa06e" />
        <FourPointStar size={32} color="#9a7bbf" />
      </Section>

      <Section title="Kaomoji" note="Click it — flings sparkles.">
        <span className="font-serif text-[32px] text-ink-dark">
          Hello! <Kaomoji />
        </span>
      </Section>

      <Section title="GalleryArrow">
        <GalleryArrow direction="left" label="left" onClick={() => {}} className="relative" />
        <GalleryArrow direction="right" label="right" onClick={() => {}} className="relative" />
      </Section>

      <Section title="PolaroidFrame" note="tilted (left) vs. clean/straight (right)">
        <PolaroidFrame image={DEMO_IMAGES[0]} rotate={3} width={180} height={160} />
        <PolaroidFrame image={{ ...DEMO_IMAGES[1], caption: undefined }} rotate={0} width={180} height={160} />
      </Section>

      <Section title="ImageCarousel" note="tilted (default)">
        <div className="w-full">
          <ImageCarousel images={DEMO_IMAGES} />
        </div>
      </Section>

      <Section title="ImageCarousel" note="tilted={false} — clean frames, no caption">
        <div className="w-full">
          <ImageCarousel images={DEMO_IMAGES} tilted={false} />
        </div>
      </Section>

      <Section title="ImageCardStack" note="tilted (default)">
        <div className="w-full">
          <ImageCardStack images={DEMO_IMAGES} />
        </div>
      </Section>

      <Section title="ImageCardStack" note="tilted={false}">
        <div className="w-full">
          <ImageCardStack images={DEMO_IMAGES} tilted={false} />
        </div>
      </Section>

      <Section
        title="Full-page sections"
        note="Each is a whole page (some use fixed inset-0), not an isolated widget — opens the real route."
      >
        <ul className="flex w-full flex-col gap-1.5">
          {FULL_PAGES.map((p) => (
            <li key={p.name}>
              <a href={p.href} className="text-[14px] text-ink-dark underline hover:text-pink-deep">
                {p.name}
              </a>
              <span className="ml-2 text-[12px] text-ink-faint">{p.href}</span>
            </li>
          ))}
        </ul>
      </Section>
    </main>
  );
}
