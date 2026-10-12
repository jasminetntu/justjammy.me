"use client";

export type FrameShape = "square" | "horizontal" | "vertical";

// vertical frames lock to a 4:5 (width:height) ratio — matches the site's
// print flyers (e.g. public/images/design/da_wics/somisomi_fundraiser_wics_flyer.png,
// 1080×1350) — rather than just transposing the horizontal pair
const VERTICAL_RATIO = 4 / 5;

// shared width/height resolution so the carousel and card stack size their
// frames identically for a given shape. "horizontal" is an exact passthrough
// (not a reorder-to-landscape) so a caller that already computed its own
// width/height — portrait included — gets exactly that back.
export function resolveFrameSize(shape: FrameShape, frameWidth: number, frameHeight: number) {
  if (shape === "square") {
    const side = Math.max(frameWidth, frameHeight);
    return { width: side, height: side };
  }
  if (shape === "vertical") {
    const longSide = Math.max(frameWidth, frameHeight);
    return { width: Math.round(longSide * VERTICAL_RATIO), height: longSide };
  }
  return { width: frameWidth, height: frameHeight };
}

interface ShapeToggleProps {
  shape: FrameShape;
  onChange: (shape: FrameShape) => void;
}

// small square/horizontal/vertical pill — lets a viewer flip the polaroid
// aspect ratio on the carousel and card stack
export function ShapeToggle({ shape, onChange }: ShapeToggleProps) {
  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-[rgba(154,127,107,.18)] bg-white/70 p-1 text-[12px]">
      {(["square", "horizontal", "vertical"] as const).map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange(s)}
          className={`rounded-full px-3 py-1 font-serif italic transition-colors duration-200 ${
            shape === s ? "bg-[rgba(154,123,191,.16)] text-[#6f5ba0]" : "text-ink-faint hover:text-ink-muted"
          }`}
        >
          {s}
        </button>
      ))}
    </div>
  );
}
