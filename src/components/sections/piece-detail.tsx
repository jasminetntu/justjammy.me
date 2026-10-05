import Image from "next/image";
import type { ComponentType } from "react";

import { PagePanel } from "@/components/layout/page-panel";
import { BackLink } from "@/components/ui/back-link";
import { ImageCarousel } from "@/components/ui/image-carousel";
import type { DesignPiece } from "@/content/design";
import { focalPosition } from "@/lib/focal";

// field-notes layout for a single design piece — mirrors the project detail
// page so both case-study surfaces feel like one family; mostly visual, artwork
// taped in like a gallery print with a short write-up. The first image is the
// print up top; any more browse via a carousel below. Body is the piece's
// MDX write-up (renders empty until one is written).
export function PieceDetail({ piece, Body }: { piece: DesignPiece; Body: ComponentType }) {
  const [headerImage, ...restImages] = piece.images ?? [];

  return (
    <main className="mx-auto max-w-[1040px] px-[clamp(20px,4vw,40px)] pb-[90px] pt-24">
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:gap-4">
        <BackLink href="/design" label="Design" className="shrink-0 text-[17px] text-pink-deep sm:pt-1" />

        <PagePanel className="min-w-0 flex-1">
          <div className="relative overflow-hidden rounded-[22px] bg-[radial-gradient(120%_90%_at_20%_0%,#fdeef5,#f7f2f8)] p-[44px_40px] shadow-[0_24px_60px_rgba(154,90,120,.14)]">
            <div className="flex flex-wrap items-start gap-6">
              <div className="min-w-[220px] flex-1">
                <div className="font-serif text-[40px] font-medium leading-none text-ink-deep">{piece.title}</div>
                <div className="font-serif my-4 mt-1.5 text-[16px] italic text-pink-deep">
                  {piece.medium} · {piece.year}
                </div>
                <p className="text-[14px] leading-[1.75] text-ink-dark">{piece.blurb}</p>
              </div>

              {/* the print — real art when available, a soft gradient placeholder for now */}
              <div
                className="relative shrink-0 basis-[220px] rounded-[3px] bg-white p-[10px_10px_34px] shadow-[0_14px_34px_rgba(154,90,120,.2)]"
                style={{ transform: "rotate(2deg)" }}
              >
                <div
                  className="relative h-[210px] w-full overflow-hidden"
                  style={{ background: headerImage ? undefined : piece.gradient }}
                >
                  {headerImage && (
                    <Image
                      src={headerImage.src}
                      alt={headerImage.alt}
                      fill
                      sizes="220px"
                      className="object-cover"
                      style={{ objectPosition: focalPosition(headerImage.focal) }}
                    />
                  )}
                </div>
                <div className="font-script absolute inset-x-0 bottom-2 text-center text-[16px] text-[#a35b85]">
                  {headerImage?.caption ?? piece.medium}
                </div>
              </div>
            </div>

            {restImages.length > 0 && (
              <ImageCarousel
                images={restImages}
                showShapeToggle={false}
                initialShape={piece.galleryShape}
                frameWidth={320}
                frameHeight={220}
              />
            )}

            <div className="mt-8">
              <Body />
            </div>

            {piece.links && piece.links.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-3.5">
                {piece.links.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-serif text-[15px] italic text-pink-deep transition-opacity hover:opacity-70 max-md:active:opacity-70"
                  >
                    {link.label} ↗
                  </a>
                ))}
              </div>
            )}
          </div>
        </PagePanel>
      </div>
    </main>
  );
}
