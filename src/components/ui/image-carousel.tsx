"use client";

import { useEffect, useRef, useState } from "react";

import type { GalleryImage } from "./gallery-image";
import { POLAROID_TILTS } from "./gallery-image";
import { ImageLightbox } from "./image-lightbox";
import { PolaroidFrame } from "./polaroid-frame";
import { resolveFrameSize, ShapeToggle, type FrameShape } from "./shape-toggle";

interface ImageCarouselProps {
  images: GalleryImage[];
  tilted?: boolean; // polaroid tilt + handwritten caption vs. a clean straight frame
  frameWidth?: number; // px — the image area scales with it, any source aspect ratio fits uncropped
  frameHeight?: number;
  showShapeToggle?: boolean; // dev-only control — off on real site pages, on for the /dev/components kitchen sink
  initialShape?: FrameShape; // fixed shape to use when the toggle is hidden
}

// gap between cards must clear each side's shadow reach so neighbors never
// blur together; vertical padding must clear it too so overflow-y (forced
// "auto" by overflow-x-auto) doesn't crop the shadow top/bottom
const SHADOW_REACH = 24;
const FADE_WIDTH = 56; // px — edge mask fade, so artwork dissolves as it nears the side
const AUTOPLAY_SPEED = 55; // px/sec — ambient drift; pauses on any interaction
const RESUME_DELAY = 1200; // ms of no interaction before autoplay picks back up

// a horizontally looping, auto-drifting strip of polaroids. Drag/swipe the
// cards directly, or drag the bar underneath to scrub — either pauses the
// drift immediately and resumes it a beat after you let go. Loops forever:
// three back-to-back copies of the images are rendered, and once you drift
// into a clone the scroll position is silently snapped back into the middle
// copy, which is invisible since the content either side is identical.
// Click any frame to open the full-screen lightbox, square/horizontal/
// vertical toggle for the frame shape. Any number of images, any source size.
export function ImageCarousel({
  images,
  tilted = true,
  frameWidth = 260,
  frameHeight = 180,
  showShapeToggle = true,
  initialShape = "horizontal",
}: ImageCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const thumbGhostRef = useRef<HTMLDivElement>(null);
  const dragState = useRef<{ startX: number; startScroll: number; dragging: boolean } | null>(null);
  const scrubbing = useRef(false);
  const pausedRef = useRef(false);
  const lastProgrammaticRef = useRef<number | null>(null);
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [shape, setShape] = useState<FrameShape>(initialShape);

  const count = images.length;
  const { width: activeWidth, height: activeHeight } = resolveFrameSize(shape, frameWidth, frameHeight);
  const loop = count > 1 ? [...images, ...images, ...images] : images;

  // set geometry (gap between the 3 copies) only ever changes with layout —
  // count/shape/frame size — never with scrolling itself, so it's measured
  // once and cached rather than read on every scroll/animation frame.
  // offsetLeft forces a synchronous layout flush; doing that 60x/sec (every
  // autoplay tick fires a scroll event) was the actual source of the jank.
  const geometryRef = useRef<{ setStart: number; setWidth: number } | null>(null);

  function measureGeometry() {
    const track = trackRef.current;
    if (!track || count <= 1) {
      geometryRef.current = null;
      return;
    }
    const children = track.children;
    if (children.length < count * 2 + 1) {
      geometryRef.current = null;
      return;
    }
    const setStart = (children[count] as HTMLElement).offsetLeft;
    const setWidth = (children[count * 2] as HTMLElement).offsetLeft - setStart;
    geometryRef.current = { setStart, setWidth };
  }

  // two copies of the thumb, one lap apart (progress and progress-1) — as
  // the real one exits past the right edge (clipped by the track's
  // overflow-hidden), the ghost one lap behind is already entering from the
  // left at the same spot, so the wrap reads as continuous motion instead of
  // a jump back to the start
  function syncScrollbar(track: HTMLDivElement, setStart: number, setWidth: number) {
    const thumb = thumbRef.current;
    const ghost = thumbGhostRef.current;
    if (!thumb || !ghost || setWidth <= 0) return;
    const progress = (track.scrollLeft - setStart) / setWidth;
    const widthRatio = Math.min(1, track.clientWidth / setWidth);
    thumb.style.width = `${widthRatio * 100}%`;
    ghost.style.width = `${widthRatio * 100}%`;
    thumb.style.left = `${progress * 100}%`;
    ghost.style.left = `${(progress - 1) * 100}%`;
  }

  function pauseAutoplay() {
    pausedRef.current = true;
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
  }
  function scheduleResume() {
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
    resumeTimer.current = setTimeout(() => {
      pausedRef.current = false;
    }, RESUME_DELAY);
  }

  // (re)measure and park the view in the middle copy on mount and whenever
  // the frame size (shape toggle) changes the layout
  useEffect(() => {
    const track = trackRef.current;
    measureGeometry();
    const geo = geometryRef.current;
    if (!track || !geo) return;
    track.scrollLeft = geo.setStart;
    lastProgrammaticRef.current = track.scrollLeft;
    syncScrollbar(track, geo.setStart, geo.setWidth);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count, activeWidth, activeHeight]);

  // continuous ambient drift — skipped under prefers-reduced-motion. Only
  // writes scrollLeft while not paused; onScroll below pauses on anything
  // else that moves the track
  useEffect(() => {
    if (count <= 1) return;
    const reduce = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = (now - last) / 1000;
      last = now;
      const track = trackRef.current;
      if (!track || pausedRef.current) return;
      track.scrollLeft += AUTOPLAY_SPEED * dt;
      lastProgrammaticRef.current = track.scrollLeft;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [count]);

  // every scrollLeft change funnels through here. The drift loop's own
  // writes are recorded in lastProgrammaticRef so they don't self-trigger a
  // pause; a mismatch means something else moved it — card drag/swipe,
  // wheel, or scrubbing the bar — so pause and schedule a resume
  function onScroll() {
    const track = trackRef.current;
    if (!track) return;
    const geo = geometryRef.current;
    if (geo) {
      if (track.scrollLeft < geo.setStart) track.scrollLeft += geo.setWidth;
      else if (track.scrollLeft >= geo.setStart + geo.setWidth) track.scrollLeft -= geo.setWidth;
      syncScrollbar(track, geo.setStart, geo.setWidth);
    }
    const current = track.scrollLeft;
    if (lastProgrammaticRef.current === null || Math.abs(current - lastProgrammaticRef.current) > 0.5) {
      pauseAutoplay();
      scheduleResume();
    }
    lastProgrammaticRef.current = current;
  }

  // mouse-only drag-to-scroll on the cards — touch already scrolls natively,
  // so letting this run for touch too would double-drive the same scroll
  function onPointerDown(e: React.PointerEvent) {
    if (e.pointerType !== "mouse" || !trackRef.current) return;
    dragState.current = { startX: e.clientX, startScroll: trackRef.current.scrollLeft, dragging: false };
  }
  function onPointerMove(e: React.PointerEvent) {
    if (e.pointerType !== "mouse") return;
    const state = dragState.current;
    if (!state || !trackRef.current) return;
    const dx = e.clientX - state.startX;
    if (Math.abs(dx) > 4) state.dragging = true;
    trackRef.current.scrollLeft = state.startScroll - dx;
  }
  function onPointerUp() {
    dragState.current = null;
  }

  // suppress the click-to-enlarge right after a drag, so releasing a swipe
  // doesn't also open the lightbox
  function onFrameClick(index: number) {
    if (dragState.current?.dragging) return;
    setLightboxIndex(index);
  }

  // drag the bar underneath to scrub to any point in the loop
  function scrubFromEvent(e: React.PointerEvent) {
    const bar = barRef.current;
    const track = trackRef.current;
    const geo = geometryRef.current;
    if (!bar || !track || !geo) return;
    const rect = bar.getBoundingClientRect();
    const clicked = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    // the thumb's center (not its left edge) should land under the pointer
    const widthRatio = Math.min(1, track.clientWidth / geo.setWidth);
    const progress = clicked - widthRatio / 2;
    track.scrollLeft = geo.setStart + progress * geo.setWidth;
  }
  function onBarPointerDown(e: React.PointerEvent) {
    scrubbing.current = true;
    scrubFromEvent(e);
  }
  function onBarPointerMove(e: React.PointerEvent) {
    if (scrubbing.current) scrubFromEvent(e);
  }
  function onBarPointerUp() {
    scrubbing.current = false;
  }

  if (count === 0) return null;

  return (
    <div className="my-6">
      {showShapeToggle && (
        <div className="mb-3 flex justify-end">
          <ShapeToggle shape={shape} onChange={setShape} />
        </div>
      )}

      <div
        ref={trackRef}
        onScroll={onScroll}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        className="flex overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] cursor-grab active:cursor-grabbing [&::-webkit-scrollbar]:hidden"
        style={{
          gap: SHADOW_REACH * 2,
          padding: `${SHADOW_REACH}px ${SHADOW_REACH / 2}px`,
          WebkitMaskImage: `linear-gradient(to right, transparent, black ${FADE_WIDTH}px, black calc(100% - ${FADE_WIDTH}px), transparent)`,
          maskImage: `linear-gradient(to right, transparent, black ${FADE_WIDTH}px, black calc(100% - ${FADE_WIDTH}px), transparent)`,
        }}
      >
        {loop.map((image, i) => {
          const original = i % count;
          return (
            <div key={i} className="shrink-0">
              <PolaroidFrame
                image={image}
                rotate={tilted ? POLAROID_TILTS[original % POLAROID_TILTS.length] : 0}
                width={activeWidth}
                height={activeHeight}
                onClick={() => onFrameClick(original)}
              />
            </div>
          );
        })}
      </div>

      {/* drag this to scrub — doubles as the "there's more to browse" hint.
          the bar thickens + brightens on hover, and a ghost thumb one lap
          behind the real one makes the loop wrap read as continuous */}
      {count > 1 && (
        <div
          ref={barRef}
          onPointerDown={onBarPointerDown}
          onPointerMove={onBarPointerMove}
          onPointerUp={onBarPointerUp}
          onPointerLeave={onBarPointerUp}
          className="group relative mt-3 w-full cursor-pointer touch-none select-none py-3"
        >
          <div className="relative h-[3px] w-full overflow-hidden rounded-full bg-[rgba(154,127,107,.14)] transition-[height,background-color] duration-200 group-hover:h-[6px] group-hover:bg-[rgba(154,127,107,.24)]">
            <div
              ref={thumbRef}
              className="absolute inset-y-0 rounded-full bg-[rgba(154,127,107,.45)] transition-[background-color] duration-200 group-hover:bg-[rgba(154,127,107,.75)]"
              style={{ width: "30%", left: 0 }}
            />
            <div
              ref={thumbGhostRef}
              className="absolute inset-y-0 rounded-full bg-[rgba(154,127,107,.45)] transition-[background-color] duration-200 group-hover:bg-[rgba(154,127,107,.75)]"
              style={{ width: "30%", left: "-100%" }}
            />
          </div>
        </div>
      )}

      {lightboxIndex !== null && (
        <ImageLightbox
          images={images}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onIndexChange={setLightboxIndex}
        />
      )}
    </div>
  );
}
