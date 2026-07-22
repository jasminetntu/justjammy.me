import Image from "next/image";
import type { ComponentType } from "react";

import { PagePanel } from "@/components/layout/page-panel";
import { BackLink } from "@/components/ui/back-link";
import type { ProjectImage, ProjectMeta } from "@/content/projects";

const POLAROID_ROTATIONS = [3, -2.5, 2, -3];

// field-notes layout — reads like a sketchbook page: warm, annotated, images
// taped in like polaroids; most projects have 0 or 1 image but the gallery
// handles any number, MDX case study renders as `Body`
export function ProjectDetail({ meta, Body }: { meta: ProjectMeta; Body: ComponentType }) {
  const images = meta.images ?? [];
  const [headerImage, ...restImages] = images;

  return (
    <main className="mx-auto max-w-[880px] px-[clamp(20px,4vw,40px)] pb-[90px] pt-[104px]">
      <PagePanel>
        <div className="mb-3">
          <BackLink href="/experience" label="Experience" className="text-[17px] text-[#9a7bbf]" />
        </div>

        <div className="relative overflow-hidden rounded-[22px] bg-[radial-gradient(120%_90%_at_20%_0%,#f3f6ec,#f7f2f8)] p-[44px_40px] shadow-[0_24px_60px_rgba(90,66,140,.14)]">
          <div className="flex flex-wrap items-start gap-6">
            <div className="min-w-[220px] flex-1">
              <div className="font-script text-[40px] leading-none text-ink-deep">{meta.title}</div>
              <div className="font-serif my-4 mt-1.5 text-[16px] italic text-green-deep">
                {meta.role} — {meta.timeframe}
              </div>
              <p className="mb-4 text-[14px] leading-[1.75] text-ink-dark">{meta.hook}</p>
              <div className="flex flex-wrap gap-2">
                {meta.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-[20px] bg-[rgba(127,160,110,.16)] px-[11px] py-1 text-[11.5px] text-[#5d6b50]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            {headerImage && <Polaroid image={headerImage} rotate={POLAROID_ROTATIONS[0]} />}
          </div>

          {/* the case study (empty until an MDX body is written) */}
          <div className="mt-8">
            <Body />

            {/* extra images, for the occasional project with more than one */}
            {restImages.length > 0 && (
              <div className="mt-6 flex flex-wrap items-start gap-5">
                {restImages.map((img, i) => (
                  <Polaroid key={img.src} image={img} rotate={POLAROID_ROTATIONS[(i + 1) % POLAROID_ROTATIONS.length]} />
                ))}
              </div>
            )}

            {meta.links && meta.links.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-3.5">
                {meta.links.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-serif text-[15px] italic text-[#5d6b50] transition-opacity hover:opacity-70"
                  >
                    {link.label} ↗
                  </a>
                ))}
              </div>
            )}
          </div>

          {meta.stats && meta.stats.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-3.5">
              {meta.stats.map((stat) => (
                <div
                  key={stat.label}
                  className="flex-1 basis-[120px] rounded-2xl border border-[rgba(154,123,191,.2)] bg-[rgba(154,123,191,.09)] px-3 py-[18px] text-center"
                >
                  <div className="font-serif text-[30px] font-semibold leading-none text-[#6f5ba0]">{stat.value}</div>
                  <div className="mt-[7px] text-[12px] text-[#8a7a9e]">{stat.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </PagePanel>
    </main>
  );
}

// a taped-in polaroid with a handwritten caption
function Polaroid({ image, rotate }: { image: ProjectImage; rotate: number }) {
  return (
    <div
      className="relative shrink-0 basis-[170px] rounded-[4px] bg-white p-[8px_8px_30px] shadow-[0_10px_24px_rgba(90,66,140,.18)]"
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      <div className="relative h-[140px] w-full overflow-hidden">
        <Image src={image.src} alt={image.alt} fill sizes="170px" className="object-cover" />
      </div>
      {image.caption && (
        <div className="font-script absolute inset-x-0 bottom-1.5 text-center text-[16px] text-[#7a6a58]">
          {image.caption}
        </div>
      )}
    </div>
  );
}
