"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

import { GalleryArrow } from "./gallery-arrow";
import type { GalleryImage } from "./gallery-image";
import { POLAROID_TILTS } from "./gallery-image";
import { ImageLightbox } from "./image-lightbox";
import { PolaroidFrame } from "./polaroid-frame";
import { resolveFrameSize, ShapeToggle, type FrameShape } from "./shape-toggle";

interface ImageCardStackProps {
  images: GalleryImage[];
  tilted?: boolean; // polaroid tilt + handwritten caption vs. a clean straight frame
  frameWidth?: number; // px — the image area scales with it, any source aspect ratio fits uncropped
  frameHeight?: number;
  showShapeToggle?: boolean; // dev-only control — off on real site pages, on for the /dev/components kitchen sink
  initialShape?: FrameShape; // fixed shape to use when the toggle is hidden
}

// images stacked on top of each other like a deck — arrows cycle which one is
// on top (peeking cards behind hint at the rest of the deck, with a lighter
// shadow so they don't blur into the front card's), clicking the front card
// opens the full-screen lightbox, square/horizontal/vertical toggle for the
// frame shape. Any number of images, any size.
export function ImageCardStack({
  images,
  tilted = true,
  frameWidth = 260,
  frameHeight = 190,
  showShapeToggle = true,
  initialShape = "horizontal",
}: ImageCardStackProps) {
  const [front, setFront] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [shape, setShape] = useState<FrameShape>(initialShape);

  if (images.length === 0) return null;

  const { width: activeWidth, height: activeHeight } = resolveFrameSize(shape, frameWidth, frameHeight);

  function step(dir: 1 | -1) {
    setFront((f) => (f + dir + images.length) % images.length);
  }

  const stackDepth = Math.min(images.length - 1, 2); // how many peek cards show behind the front

  return (
    <div className="relative my-6 flex flex-col items-center gap-4">
      {showShapeToggle && <ShapeToggle shape={shape} onChange={setShape} />}

      <div className="flex items-center justify-center gap-6">
      {images.length > 1 && <GalleryArrow direction="left" label="Previous card" onClick={() => step(-1)} />}

      <div
        className="relative transition-[width,height] duration-300"
        style={{ width: activeWidth + 24, height: activeHeight + 60 }}
      >
        {Array.from({ length: stackDepth }, (_, i) => {
          const depth = stackDepth - i; // draw the furthest-back peek card first
          const peekImage = images[(front + depth) % images.length];
          return (
            <div
              key={`peek-${depth}`}
              className="pointer-events-none absolute inset-0 flex items-center justify-center"
              style={{
                transform: `translate(${depth * 10}px, ${depth * -10}px)`,
                opacity: 1 - depth * 0.12,
                zIndex: stackDepth - depth,
              }}
            >
              <PolaroidFrame
                image={peekImage}
                rotate={tilted ? POLAROID_TILTS[depth % POLAROID_TILTS.length] : 0}
                width={activeWidth}
                height={activeHeight}
                shadow="soft"
              />
            </div>
          );
        })}

        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={`${front}-${images[front].src}`}
            initial={{ opacity: 0, scale: 0.92, x: 24 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.92, x: -24 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0 flex items-center justify-center"
            style={{ zIndex: stackDepth + 1 }}
          >
            <PolaroidFrame
              image={images[front]}
              rotate={tilted ? POLAROID_TILTS[front % POLAROID_TILTS.length] : 0}
              width={activeWidth}
              height={activeHeight}
              onClick={() => setLightboxOpen(true)}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {images.length > 1 && <GalleryArrow direction="right" label="Next card" onClick={() => step(1)} />}
      </div>

      {lightboxOpen && (
        <ImageLightbox images={images} index={front} onClose={() => setLightboxOpen(false)} onIndexChange={setFront} />
      )}
    </div>
  );
}
