"use client";

import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { GalleryArrow } from "./gallery-arrow";
import type { GalleryImage } from "./gallery-image";

interface ImageLightboxProps {
  images: GalleryImage[];
  index: number;
  onClose: () => void;
  onIndexChange: (index: number) => void;
}

// full-screen enlarged view shared by the carousel and card stack — dims the
// page, shows the image uncropped and centered, with its own arrows so you
// can keep flipping through without closing. Portaled straight to
// document.body: this component is always mounted deep inside the page tree
// (PagePanel's animation transform, the detail card's overflow-hidden), and
// either of those makes a `fixed inset-0` descendant resolve against that
// ancestor's box instead of the real viewport — undersized backdrop,
// buttons positioned/clipped against the wrong box. Portaling escapes all of
// that entirely.
export function ImageLightbox({ images, index, onClose, onIndexChange }: ImageLightboxProps) {
  const image = images[index];
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onIndexChange((index - 1 + images.length) % images.length);
      if (e.key === "ArrowRight") onIndexChange((index + 1) % images.length);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [index, images.length, onClose, onIndexChange]);

  if (!image || !mounted) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(40,32,28,.82)] p-6"
        onClick={onClose}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-8 top-8 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-ink-dark shadow-lg transition-opacity hover:opacity-80 max-sm:right-4 max-sm:top-4"
        >
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden>
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>

        {images.length > 1 && (
          <GalleryArrow
            direction="left"
            label="Previous image"
            className="absolute left-8 top-1/2 -translate-y-1/2 max-sm:left-4"
            onClick={() => onIndexChange((index - 1 + images.length) % images.length)}
          />
        )}

        <motion.div
          key={image.src}
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
          className="relative flex max-h-[85vh] max-w-[90vw] flex-col items-center gap-3"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative h-[75vh] w-[85vw] max-w-[900px]">
            <Image src={image.src} alt={image.alt} fill sizes="90vw" className="object-contain" priority />
          </div>
          {image.caption && <p className="font-serif text-center text-[15px] italic text-white/90">{image.caption}</p>}
          {images.length > 1 && (
            <p className="text-[12px] tracking-[.1em] text-white/60">
              {index + 1} / {images.length}
            </p>
          )}
        </motion.div>

        {images.length > 1 && (
          <GalleryArrow
            direction="right"
            label="Next image"
            className="absolute right-8 top-1/2 -translate-y-1/2 max-sm:right-4"
            onClick={() => onIndexChange((index + 1) % images.length)}
          />
        )}
      </motion.div>
    </AnimatePresence>,
    document.body,
  );
}
