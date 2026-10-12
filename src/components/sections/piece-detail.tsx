import Image from "next/image";
import type { ComponentType } from "react";

import { PagePanel } from "@/components/layout/page-panel";
import { BackLink } from "@/components/ui/back-link";
import { ImageCarousel } from "@/components/ui/image-carousel";
import type { DesignImage, DesignLink, DesignMeta } from "@/content/design";
import { focalPosition } from "@/lib/focal";

// an aspect ratio, written the way you'd find it for a real format — e.g.
// { w: 1080, h: 1080 } (square), { w: 1080, h: 1350 } (4:5 portrait), or
// { w: 1920, h: 1080 } (16:9). Only the ratio between w and h matters, not
// their magnitude — {w:4,h:5} and {w:1080,h:1350} resize identically.
interface AspectRatio {
  w: number;
  h: number;
}

// resolves an aspect ratio + scale to a concrete pixel width/height.
// `longSidePx` is the rendered size of the *longer* side at scale={1} — the
// single "how big" knob, completely independent of the ratio's orientation,
// so there's no <1 vs >1 inversion to reason about: landscape ratios and
// portrait ratios both just get bigger/smaller together with `scale`.
function resolveAspectSize(ratio: AspectRatio, longSidePx: number, scale: number) {
  const longSide = longSidePx * scale;
  const shortSide = longSide * (Math.min(ratio.w, ratio.h) / Math.max(ratio.w, ratio.h));
  const landscapeOrSquare = ratio.w >= ratio.h;
  return {
    width: Math.round(landscapeOrSquare ? longSide : shortSide),
    height: Math.round(landscapeOrSquare ? shortSide : longSide),
  };
}

// page chrome only — back link + the framed panel. Everything inside (the
// header print, carousel, write-up prose, links) is composed by the piece's
// own .mdx body using PieceHeader / PieceCarousel / PieceLinks below, in
// whatever order that file places them — so each piece can lay itself out
// independently instead of sharing one fixed template.
export function PieceDetail({ Body }: { Body: ComponentType }) {
  return (
    <main className="mx-auto max-w-[1040px] px-[clamp(20px,4vw,40px)] pb-[90px] pt-24">
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:gap-4">
        <BackLink href="/design" label="Design" className="shrink-0 text-[17px] text-pink-deep sm:pt-1" />

        <PagePanel className="min-w-0 flex-1">
          <div className="relative overflow-hidden rounded-[22px] bg-[radial-gradient(120%_90%_at_20%_0%,#fdeef5,#f7f2f8)] p-[44px_40px] shadow-[0_24px_60px_rgba(154,90,120,.14)]">
            <Body />
          </div>
        </PagePanel>
      </div>
    </main>
  );
}

// title/blurb + the tilted "print" of the first image — the piece's standard
// opener, but just a component an .mdx file chooses to place (and where).
// `aspectRatio` is a standard-size pair (ratio only — magnitude doesn't
// matter); `scale` resizes the print up/down from its default size.
// `showImage={false}` drops the print entirely — title/blurb only.
export function PieceHeader({
  piece,
  aspectRatio = { w: 1080, h: 1080 },
  scale = 1,
  showImage = true,
}: {
  piece: DesignMeta;
  aspectRatio?: AspectRatio;
  scale?: number;
  showImage?: boolean;
}) {
  const headerImage = piece.images?.[0];
  // these are the IMAGE's own dimensions — the print's horizontal padding
  // (10px each side, see p-[10px_10px_34px] below) is added on top for the
  // outer card, so it never eats into the requested ratio the way a fixed
  // padding silently would at small `scale` values
  const { width: imageWidth, height: imageHeight } = resolveAspectSize(aspectRatio, 220, scale);
  const printWidth = imageWidth + 20;

  return (
    <div className="flex flex-wrap items-start gap-6">
      <div className="min-w-[220px] flex-1">
        <div className="font-serif text-[40px] font-medium leading-none text-ink-deep">{piece.title}</div>
        <div className="font-serif my-4 mt-1.5 text-[16px] italic text-pink-deep">
          {piece.category} · {piece.timeframe}
        </div>
        <p className="text-[14px] leading-[1.75] text-ink-dark">{piece.blurb}</p>
      </div>

      {showImage && (
        <div
          className="relative shrink-0 rounded-[3px] bg-white p-[10px_10px_34px] shadow-[0_14px_34px_rgba(154,90,120,.2)]"
          style={{ width: printWidth, transform: "rotate(2deg)" }}
        >
          <div
            className="relative overflow-hidden"
            style={{ width: imageWidth, height: imageHeight, background: headerImage ? undefined : piece.gradient }}
          >
            {headerImage && (
              <Image
                src={headerImage.src}
                alt={headerImage.alt}
                fill
                sizes={`${imageWidth}px`}
                className="object-cover"
                style={{ objectPosition: focalPosition(headerImage.focal) }}
              />
            )}
          </div>
          <div className="absolute inset-x-0 bottom-2 text-center text-[13px] text-[#a35b85]">
            {headerImage?.caption ?? piece.category}
          </div>
        </div>
      )}
    </div>
  );
}

// the detail-page carousel, pre-configured for a piece page (no shape
// toggle — fixed to one shape per call); place it anywhere, e.g.
// `<PieceCarousel images={meta.images?.slice(1) ?? []} aspectRatio={{ w: 4, h: 5 }} />`.
// `aspectRatio` is a standard-size pair (ratio only); `scale` resizes the
// frames up/down from their default size. Portrait ratios (h > w) work the
// same as landscape ones — no sign flipping to reason about.
export function PieceCarousel({
  images,
  aspectRatio = { w: 3, h: 2 },
  scale = 1,
}: {
  images: DesignImage[];
  aspectRatio?: AspectRatio;
  scale?: number;
}) {
  if (images.length === 0) return null;
  const { width, height } = resolveAspectSize(aspectRatio, 320, scale);
  return (
    <ImageCarousel
      images={images}
      showShapeToggle={false}
      initialShape="horizontal"
      frameWidth={width}
      frameHeight={height}
    />
  );
}

// external links row — renders nothing if there are none
export function PieceLinks({ links }: { links?: DesignLink[] }) {
  if (!links || links.length === 0) return null;
  return (
    <div className="mt-6 flex flex-wrap gap-3.5">
      {links.map((link) => (
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
  );
}
