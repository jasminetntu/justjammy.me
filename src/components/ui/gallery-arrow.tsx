"use client";

interface GalleryArrowProps {
  direction: "left" | "right";
  onClick: () => void;
  label: string;
  className?: string;
}

// round floating chevron button shared by the carousel, card stack, and lightbox
export function GalleryArrow({ direction, onClick, label, className = "" }: GalleryArrowProps) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      aria-label={label}
      className={`flex h-10 w-10 items-center justify-center rounded-full bg-white text-ink-dark shadow-[0_6px_18px_rgba(70,48,54,.2)] transition-[transform,opacity] duration-200 hover:scale-105 hover:opacity-80 max-md:active:scale-105 max-md:active:opacity-80 ${className}`}
    >
      <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        {direction === "left" ? <path d="m15 5-7 7 7 7" /> : <path d="m9 5 7 7-7 7" />}
      </svg>
    </button>
  );
}
