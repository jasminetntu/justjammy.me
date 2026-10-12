import Image from "next/image";

import { focalPosition } from "@/lib/focal";

import type { GalleryImage } from "./gallery-image";

// two shadow tiers so stacked/adjacent frames don't blur into one muddy blob:
// "full" for the frame currently in front, "soft" for ones peeking behind it
const SHADOW = {
  full: "shadow-[0_1px_2px_rgba(70,48,54,.16),0_12px_20px_-6px_rgba(70,48,54,.22)]",
  soft: "shadow-[0_4px_10px_-2px_rgba(70,48,54,.14)]",
} as const;

// height of the white polaroid margin below the image — also the frame's
// bottom padding, so the caption band below can center text inside exactly
// that space (equal gap above/below) instead of eyeballing a bottom offset
const CAPTION_BAND = 26;

// horizontal padding (p-2, each side) around the image — subtracted from
// the outer card's width previously, which silently narrowed the rendered
// image below the caller's intended `width`/`height` ratio by a fixed 16px
// (barely visible at ~260px wide, obviously wrong at small sizes/scales).
// The button's own width now adds this back on top of `width`, so `width`×
// `height` always describes the image itself, exactly.
const PAD_X = 8;

interface PolaroidFrameProps {
  image: GalleryImage;
  rotate?: number; // degrees; omit (or tilted=false upstream) for a straight frame
  width: number;
  height: number;
  onClick?: () => void;
  shadow?: keyof typeof SHADOW;
  className?: string;
}

// a white-bordered polaroid frame around one image — object-cover so the
// image fills the frame edge-to-edge regardless of its source aspect ratio
// (cropped as needed, no empty letterbox bars)
export function PolaroidFrame({
  image,
  rotate = 0,
  width,
  height,
  onClick,
  shadow = "full",
  className = "",
}: PolaroidFrameProps) {
  const hasCaption = rotate !== 0 && image.caption;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative shrink-0 rounded-[4px] bg-white p-2 transition-[transform,width] duration-300 ${SHADOW[shadow]} ${onClick ? "cursor-zoom-in hover:scale-[1.03] max-md:active:scale-[1.03]" : ""} ${className}`}
      style={{ width: width + PAD_X * 2, paddingBottom: CAPTION_BAND, transform: rotate ? `rotate(${rotate}deg)` : undefined }}
      disabled={!onClick}
    >
      <div
        className="relative overflow-hidden bg-[rgba(0,0,0,.04)] transition-[height] duration-300"
        style={{ width, height }}
      >
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes={`${width}px`}
          className="object-cover"
          style={{ objectPosition: focalPosition(image.focal) }}
        />
      </div>
      {hasCaption && (
        <div
          className="absolute inset-x-0 bottom-0 flex items-center justify-center text-center text-[13px] text-[#7a6a58]"
          style={{ height: CAPTION_BAND }}
        >
          {image.caption}
        </div>
      )}
    </button>
  );
}
