"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import { useFx } from "@/components/layout/fx-provider";
import { BackLink } from "@/components/ui/back-link";
import { FourPointStar } from "@/components/ui/four-point-star";
import type { DesignPiece } from "@/content/design";
import { clampCamAxis, computeWallBounds, layoutWall, type Placement } from "@/lib/design-wall";
import { focalPosition } from "@/lib/focal";

// wall tuning — "calm" motion only (the prototype's lively/museum modes were cut)
const IDLE_AMP = 3.2; // px of gentle idle sway
const IDLE_SPEED = 0.32; // sway frequency
const MOMENTUM_DECAY = 0.9; // per-frame velocity falloff after a drag
const BOUND_PAD = 150; // slack past the furthest piece before the drag stops
const DRAG_SLOP = 6; // px of movement that counts as a drag (suppresses the click)

// per-piece animation state, mutated every frame (kept out of React state so the
// rAF loop never triggers a re-render)
interface Runtime {
  curScale: number;
  curRot: number;
  phase: number;
  hover: boolean;
}

function restingTransform(pl: Placement): string {
  return `translate(-50%,-50%) translate(${pl.x}px,${pl.y}px) rotate(${pl.rot}deg)`;
}

// explore ⁄ compact toggle label — dims when inactive, brightens + lifts on hover
function ModeButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
      className="font-serif text-[16px] italic tracking-[.04em] text-pink-deep transition-opacity duration-[400ms]"
      style={{
        opacity: active || hover ? 1 : 0.38,
        fontWeight: active ? 500 : 400,
        transform: hover ? "translateY(-1px)" : "none",
      }}
    >
      {label}
    </button>
  );
}

export function DesignGallery({ pieces }: { pieces: DesignPiece[] }) {
  const router = useRouter();
  const { burst } = useFx();

  // remembers whichever view (wall/grid) was last active, so navigating into
  // a piece and back lands you where you left off instead of resetting to
  // wall; starts "wall" on every render (server included) and only switches
  // after mount, so hydration never has to reconcile a mismatched guess
  const [mode, setMode] = useState<"wall" | "grid">("wall");
  // runs before paint (unlike useEffect) so a restored "grid" mode never
  // flashes "wall" first
  useLayoutEffect(() => {
    try {
      if (localStorage.getItem("design-mode") === "grid") setMode("grid");
    } catch {
      // localStorage unavailable (private mode, etc.) — stay on wall
    }
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem("design-mode", mode);
    } catch {
      // ignore — persistence is best-effort
    }
  }, [mode]);

  // "drag to wander" hint — shown until the first real drag, then never again
  // (persisted across visits)
  const [showHint, setShowHint] = useState(false);
  const hintDismissed = useRef(false);
  useEffect(() => {
    let draggedBefore = false;
    try {
      draggedBefore = localStorage.getItem("design-wall-dragged") === "1";
    } catch {
      // localStorage unavailable (private mode, etc.) — show the hint
    }
    if (draggedBefore) {
      hintDismissed.current = true;
      return;
    }
    // defer the state flip out of the effect body (lint: no sync setState)
    const id = requestAnimationFrame(() => setShowHint(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // refs the rAF loop reads without re-subscribing
  const modeRef = useRef(mode);
  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  const wallRef = useRef<HTMLDivElement>(null);
  const frames = useRef(new Map<string, HTMLElement>());
  const runtime = useRef(new Map<string, Runtime>());

  const cam = useRef({ x: 0, y: 0 });
  const camV = useRef({ x: 0, y: 0 });
  const dragging = useRef(false);
  const dragDist = useRef(0);
  const last = useRef({ x: 0, y: 0 });
  const viewport = useRef({ w: 1200, h: 800 });

  // resolve each piece's wall position once (auto-scattered, non-overlapping,
  // manual overrides honored), then pair back with content
  const layout = useMemo(() => {
    const placed = layoutWall(
      pieces.map((p) => ({ slug: p.slug, width: p.size.w, height: p.size.h, place: p.place })),
    );
    return pieces.map((p) => {
      const pl = placed.get(p.slug)!;
      return { piece: p, ...pl, w: p.size.w, h: p.size.h };
    });
  }, [pieces]);

  // gallery extent, derived from the resolved layout — grows as you add pieces
  const bounds = useMemo(
    () => computeWallBounds(layout.map((l) => ({ x: l.x, y: l.y, w: l.w, h: l.h }))),
    [layout],
  );

  // draggable wall — pointer drag + momentum + parallax + idle sway in one rAF
  // loop; lives for the component's lifetime, guarded to wall mode
  useEffect(() => {
    const reduce =
      typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;

    for (const l of layout) {
      runtime.current.set(l.piece.slug, {
        curScale: 1,
        curRot: l.rot,
        // deterministic-ish phase spread so idle sway isn't synchronized
        phase: (l.piece.slug.length * 1.7) % (Math.PI * 2),
        hover: false,
      });
    }

    const measure = () => {
      viewport.current = { w: innerWidth, h: innerHeight };
    };
    measure();

    const clampCam = () => {
      const { w: W, h: H } = viewport.current;
      const c = cam.current,
        v = camV.current;
      const nx = clampCamAxis(c.x, bounds.minX, bounds.maxX, W, bounds.cx, BOUND_PAD);
      const ny = clampCamAxis(c.y, bounds.minY, bounds.maxY, H, bounds.cy, BOUND_PAD);
      // kill any momentum still pushing into a bound we just hit
      if (nx < c.x && v.x > 0) v.x = 0;
      if (nx > c.x && v.x < 0) v.x = 0;
      if (ny < c.y && v.y > 0) v.y = 0;
      if (ny > c.y && v.y < 0) v.y = 0;
      c.x = nx;
      c.y = ny;
    };

    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (modeRef.current !== "wall") return;
      const t = (now - start) / 1000;
      const c = cam.current,
        v = camV.current;

      if (!dragging.current) {
        c.x += v.x;
        c.y += v.y;
        v.x *= MOMENTUM_DECAY;
        v.y *= MOMENTUM_DECAY;
        if (Math.abs(v.x) < 0.02) v.x = 0;
        if (Math.abs(v.y) < 0.02) v.y = 0;
      }
      clampCam();

      for (const l of layout) {
        const el = frames.current.get(l.piece.slug);
        const rt = runtime.current.get(l.piece.slug);
        if (!el || !rt) continue;
        const idleX = reduce ? 0 : Math.sin(t * IDLE_SPEED + rt.phase) * IDLE_AMP;
        const idleY = reduce ? 0 : Math.cos(t * IDLE_SPEED * 0.85 + rt.phase) * IDLE_AMP;
        const tx = l.x + c.x * l.depth + idleX;
        const ty = l.y + c.y * l.depth + idleY;
        rt.curScale += ((rt.hover ? 1.06 : 1) - rt.curScale) * 0.15;
        rt.curRot += ((rt.hover ? 0 : l.rot) - rt.curRot) * 0.15;
        el.style.transform = `translate(-50%,-50%) translate(${tx}px,${ty}px) rotate(${rt.curRot}deg) scale(${rt.curScale})`;
      }
    };
    raf = requestAnimationFrame(tick);

    const onDown = (e: PointerEvent) => {
      dragging.current = true;
      dragDist.current = 0;
      last.current = { x: e.clientX, y: e.clientY };
      camV.current = { x: 0, y: 0 };
      if (wallRef.current) wallRef.current.style.cursor = "grabbing";
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging.current) return;
      const dx = e.clientX - last.current.x;
      const dy = e.clientY - last.current.y;
      cam.current.x += dx;
      cam.current.y += dy;
      camV.current = reduce ? { x: 0, y: 0 } : { x: dx, y: dy };
      dragDist.current += Math.abs(dx) + Math.abs(dy);
      last.current = { x: e.clientX, y: e.clientY };
      // first real drag → retire the hint for good
      if (dragDist.current > DRAG_SLOP && !hintDismissed.current) {
        hintDismissed.current = true;
        setShowHint(false);
        try {
          localStorage.setItem("design-wall-dragged", "1");
        } catch {
          // ignore — persistence is best-effort
        }
      }
    };
    const onUp = () => {
      if (!dragging.current) return;
      dragging.current = false;
      if (wallRef.current) wallRef.current.style.cursor = "grab";
    };

    // trackpad/wheel pan — no click-drag needed. Sign matches native scroll
    // (scrollTop += deltaY): content moves opposite the wheel delta
    const onWheel = (e: WheelEvent) => {
      if (modeRef.current !== "wall") return;
      e.preventDefault();
      const dx = -e.deltaX;
      const dy = -e.deltaY;
      cam.current.x += dx;
      cam.current.y += dy;
      camV.current = { x: 0, y: 0 };
      dragDist.current += Math.abs(dx) + Math.abs(dy);
      if (dragDist.current > DRAG_SLOP && !hintDismissed.current) {
        hintDismissed.current = true;
        setShowHint(false);
        try {
          localStorage.setItem("design-wall-dragged", "1");
        } catch {
          // ignore — persistence is best-effort
        }
      }
    };

    const wall = wallRef.current;
    wall?.addEventListener("pointerdown", onDown);
    addEventListener("pointermove", onMove, { passive: true });
    addEventListener("pointerup", onUp);
    addEventListener("resize", measure);
    wall?.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      cancelAnimationFrame(raf);
      wall?.removeEventListener("pointerdown", onDown);
      removeEventListener("pointermove", onMove);
      removeEventListener("pointerup", onUp);
      removeEventListener("resize", measure);
      wall?.removeEventListener("wheel", onWheel);
    };
  }, [bounds, layout]);

  // click a piece → sparkle burst, then navigate (suppressed if it was a drag)
  const openPiece = (e: React.MouseEvent, slug: string) => {
    if (dragDist.current > DRAG_SLOP) {
      e.preventDefault();
      return;
    }
    burst(e.clientX, e.clientY, "#dd8fb6", 16, "#ffffff");
    router.push(`/design/${slug}`);
  };

  return (
    <main className="fixed inset-0 overflow-hidden">
      {/* wall — full-bleed draggable polaroid scatter */}
      <div
        ref={wallRef}
        className="absolute inset-0 cursor-grab touch-none select-none"
        style={{ display: mode === "wall" ? "block" : "none" }}
      >
        {layout.map((l) => {
          const p = l.piece;
          const thumb = p.images?.[0];
          return (
            <Link
              key={p.slug}
              href={`/design/${p.slug}`}
              onClick={(e) => openPiece(e, p.slug)}
              ref={(el) => {
                if (el) {
                  frames.current.set(p.slug, el);
                  el.style.transform = restingTransform(l);
                } else {
                  frames.current.delete(p.slug);
                }
              }}
              onPointerEnter={() => {
                const rt = runtime.current.get(p.slug);
                if (rt) rt.hover = true;
              }}
              onPointerLeave={() => {
                const rt = runtime.current.get(p.slug);
                if (rt) rt.hover = false;
              }}
              className="group absolute left-1/2 top-1/2 z-[1] block cursor-pointer hover:z-20 focus-visible:z-20"
              style={{ willChange: "transform" }}
            >
              {/* the framed piece */}
              <div className="relative rounded-[2px] bg-white p-[11px_11px_44px] shadow-[0_12px_30px_rgba(154,90,120,.16),0_2px_6px_rgba(154,90,120,.12)] transition-shadow duration-500 group-hover:shadow-[0_26px_56px_rgba(154,90,120,.28),0_6px_14px_rgba(154,90,120,.16)] max-md:group-active:shadow-[0_26px_56px_rgba(154,90,120,.28),0_6px_14px_rgba(154,90,120,.16)]">
                <div
                  className="relative overflow-hidden rounded-[1px]"
                  style={{ width: l.w, height: l.h, background: thumb ? undefined : p.gradient }}
                >
                  {thumb ? (
                    <Image
                      src={thumb.src}
                      alt={thumb.alt}
                      fill
                      sizes="384px"
                      className="object-cover"
                      style={{ objectPosition: focalPosition(thumb.focal) }}
                      draggable={false}
                    />
                  ) : (
                    <span className="font-serif absolute inset-0 flex items-end p-3 text-[13px] italic text-[rgba(120,60,90,.4)]">
                      {p.medium}
                    </span>
                  )}
                </div>
                {/* caption in the polaroid's own white margin, like a note
                    under a real photo — revealed on hover */}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-start gap-0.5 px-4 py-[8px] text-left opacity-0 transition-opacity duration-[350ms] group-hover:opacity-100 max-md:group-active:opacity-100">
                  <div className="font-serif truncate text-[15px] font-medium leading-none text-[#6b4358]">
                    {p.title}
                  </div>
                  <div className="font-serif truncate text-[11px] italic leading-none text-[#a37a90]">
                    {p.medium} · {p.year}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* grid — editorial masonry, three columns */}
      {mode === "grid" && (
        <div className="absolute inset-0 z-[1] overflow-y-auto">
          <div className="mx-auto max-w-[1180px] px-[clamp(24px,5vw,60px)] pb-[100px] pt-[132px] md:pt-[172px]">
            {/* CSS multi-column masonry — 2 cols on phones, 3 on wider screens */}
            <div className="columns-2 gap-6 md:columns-3">
              {pieces.map((p) => {
                const thumb = p.images?.[0];
                return (
                <Link
                  key={p.slug}
                  href={`/design/${p.slug}`}
                  onClick={(e) => {
                    burst(e.clientX, e.clientY, "#dd8fb6", 14, "#ffffff");
                  }}
                  className="group relative mb-6 block cursor-pointer overflow-hidden break-inside-avoid rounded-[14px] shadow-[0_8px_24px_rgba(154,90,120,.12)] transition-[transform,box-shadow] duration-500 hover:-translate-y-[5px] hover:shadow-[0_18px_42px_rgba(154,90,120,.22)] max-md:active:-translate-y-[5px] max-md:active:shadow-[0_18px_42px_rgba(154,90,120,.22)]"
                >
                  <div
                    className="relative w-full"
                    style={{ aspectRatio: `${p.size.w} / ${p.size.h}`, background: thumb ? undefined : p.gradient }}
                  >
                    {thumb && (
                      <Image
                        src={thumb.src}
                        alt={thumb.alt}
                        fill
                        sizes="(max-width:768px) 50vw, 380px"
                        className="object-cover"
                        style={{ objectPosition: focalPosition(thumb.focal) }}
                      />
                    )}
                  </div>
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[rgba(90,40,60,.46)] to-transparent p-[18px_16px_15px] opacity-0 transition-opacity duration-[450ms] group-hover:opacity-100 max-md:group-active:opacity-100">
                    <div className="font-serif text-[20px] text-white">{p.title}</div>
                    <div className="font-serif text-[13px] italic text-white/85">
                      {p.medium} · {p.year}
                    </div>
                  </div>
                </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* back + eyebrow — top left, below the header; mobile lines up with the
          page edge (matching about's left padding), desktop shifts right to
          clear the J monogram */}
      <div className="pointer-events-none absolute left-[clamp(24px,5vw,60px)] top-24 z-[21] flex flex-col items-start gap-2 md:left-[calc(clamp(22px,4vw,52px)+50px)]">
        <BackLink href="/" label="back" className="pointer-events-auto text-ink-faint" />
        <h1 className="font-serif text-[16px] italic uppercase tracking-[.2em] text-pink-deep">
          design
        </h1>
      </div>

      {/* explore ⁄ compact toggle — bottom center */}
      <div className="absolute bottom-7 left-1/2 z-[21] inline-flex -translate-x-1/2 items-center gap-3.5 rounded-[20px] border border-[rgba(201,127,166,.14)] bg-[rgba(255,252,254,.82)] px-[22px] py-2 shadow-[0_4px_18px_rgba(154,90,120,.07)] backdrop-blur-[8px]">
        <ModeButton label="explore" active={mode === "wall"} onClick={() => setMode("wall")} />
        <FourPointStar size={10} color="#e2a7c4" />
        <ModeButton label="compact" active={mode === "grid"} onClick={() => setMode("grid")} />
      </div>

      {/* wander hint — wall only; fades in on load, out on the first drag, so
          it never blinks away */}
      {mode === "wall" && (
        <div
          className="font-serif pointer-events-none absolute bottom-[74px] left-1/2 z-[21] -translate-x-1/2 whitespace-nowrap text-[14.5px] italic text-[#c189a6] transition-opacity duration-700 ease-out"
          style={{ opacity: showHint ? 1 : 0 }}
        >
          drag to wander
        </div>
      )}

      {/* instagram */}
      <a
        href="https://www.instagram.com/jammydoodlez"
        target="_blank"
        rel="noopener noreferrer"
        title="@jammydoodlez"
        className="group absolute bottom-7 right-[clamp(20px,4vw,44px)] z-[21] inline-flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(201,127,166,.14)] bg-[rgba(255,252,254,.82)] text-pink-deep shadow-[0_4px_18px_rgba(154,90,120,.07)] backdrop-blur-[8px] transition-transform duration-300 hover:scale-110 hover:-rotate-[4deg] max-md:active:scale-110 max-md:active:-rotate-[4deg]"
      >
        {/* handle — blooms in to the left so it never clips off the screen edge */}
        <span className="font-serif pointer-events-none absolute right-full top-1/2 -translate-x-[6px] -translate-y-1/2 whitespace-nowrap rounded-full border border-[rgba(201,127,166,.14)] bg-[rgba(255,252,254,.9)] px-3 py-1.5 text-[13px] italic text-pink-deep opacity-0 shadow-[0_4px_18px_rgba(154,90,120,.07)] backdrop-blur-[8px] transition-[opacity,transform] duration-[350ms] group-hover:-translate-x-[11px] group-hover:opacity-100 max-md:group-active:-translate-x-[11px] max-md:group-active:opacity-100">
          @jammydoodlez
        </span>
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
        </svg>
        <span className="sr-only">Instagram @jammydoodlez</span>
      </a>
    </main>
  );
}
