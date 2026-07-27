import Image from "next/image";

import { PagePanel } from "@/components/layout/page-panel";
import { BackLink } from "@/components/ui/back-link";
import type { DesignPiece } from "@/content/design";

// field-notes layout for a single design piece — mirrors the project detail
// page so both case-study surfaces feel like one family; mostly visual, artwork
// taped in like a gallery print with a short write-up
export function PieceDetail({ piece }: { piece: DesignPiece }) {
  return (
    <main className="mx-auto max-w-[880px] px-[clamp(20px,4vw,40px)] pb-[90px] pt-24">
      <PagePanel>
        <div className="mb-3">
          <BackLink href="/design" label="Design" className="text-[17px] text-pink-deep" />
        </div>

        <div className="relative overflow-hidden rounded-[22px] bg-[radial-gradient(120%_90%_at_20%_0%,#fdeef5,#f7f2f8)] p-[44px_40px] shadow-[0_24px_60px_rgba(154,90,120,.14)]">
          <div className="flex flex-wrap items-start gap-6">
            <div className="min-w-[220px] flex-1">
              <div className="font-script text-[40px] leading-none text-ink-deep">{piece.title}</div>
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
                style={{ background: piece.image ? undefined : piece.gradient }}
              >
                {piece.image && (
                  <Image src={piece.image.src} alt={piece.image.alt} fill sizes="220px" className="object-cover" />
                )}
              </div>
              <div className="font-script absolute inset-x-0 bottom-2 text-center text-[16px] text-[#a35b85]">
                {piece.image?.caption ?? piece.medium}
              </div>
            </div>
          </div>

          {piece.description && (
            <p className="mt-8 text-[15px] leading-[1.85] text-ink-dark">{piece.description}</p>
          )}

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
    </main>
  );
}
