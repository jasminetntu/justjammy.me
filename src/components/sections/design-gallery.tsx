"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { useFx } from "@/components/layout/fx-provider";
import { BackLink } from "@/components/ui/back-link";
import { FourPointStar } from "@/components/ui/four-point-star";
import { pieces } from "@/content/design";
import { clampCamAxis, computeWallBounds, layoutWall, type Placement } from "@/lib/design-wall";

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
// (ported from the prototype's [data-art-mode] pointer handlers)
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

export function DesignGallery() {
  const router = useRouter();
  const { burst } = useFx();

  const [mode, setMode] = useState<"wall" | "grid">("wall");

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
  // with per-piece manual overrides honored), then pair it back with its content
  const layout = useMemo(() => {
    const placed = layoutWall(
      pieces.map((p) => ({ slug: p.slug, width: p.size.w, height: p.size.h, place: p.place })),
    );
    return pieces.map((p) => {
      const pl = placed.get(p.slug)!;
      return { piece: p, ...pl, w: p.size.w, h: p.size.h };
    });
  }, []);

  // gallery extent, derived from the resolved layout — grows as you add pieces
  const bounds = useMemo(
    () => computeWallBounds(layout.map((l) => ({ x: l.x, y: l.y, w: l.w, h: l.h }))),
    [layout],
  );

  // the draggable wall: pointer drag + momentum + parallax + idle sway, all driven
  // by one rAF loop. lives for the component's lifetime; guarded to wall mode.
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
    };
    const onUp = () => {
      if (!dragging.current) return;
      dragging.current = false;
      if (wallRef.current) wallRef.current.style.cursor = "grab";
    };

    const wall = wallRef.current;
    wall?.addEventListener("pointerdown", onDown);
    addEventListener("pointermove", onMove, { passive: true });
    addEventListener("pointerup", onUp);
    addEventListener("resize", measure);

    return () => {
      cancelAnimationFrame(raf);
      wall?.removeEventListener("pointerdown", onDown);
      removeEventListener("pointermove", onMove);
      removeEventListener("pointerup", onUp);
      removeEventListener("resize", measure);
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
      {/* WALL — full-bleed draggable polaroid scatter */}
      <div
        ref={wallRef}
        className="absolute inset-0 cursor-grab touch-none"
        style={{ display: mode === "wall" ? "block" : "none" }}
      >
        {layout.map((l) => {
          const p = l.piece;
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
              className="group absolute left-1/2 top-1/2 z-[1] block cursor-pointer"
              style={{ willChange: "transform" }}
            >
              {/* the framed piece */}
              <div className="rounded-[2px] bg-white p-[11px_11px_30px] shadow-[0_12px_30px_rgba(154,90,120,.16),0_2px_6px_rgba(154,90,120,.12)] transition-shadow duration-500 group-hover:shadow-[0_26px_56px_rgba(154,90,120,.28),0_6px_14px_rgba(154,90,120,.16)]">
                <div
                  className="relative overflow-hidden rounded-[1px]"
                  style={{ width: l.w, height: l.h, background: p.image ? undefined : p.gradient }}
                >
                  {p.image ? (
                    <Image
                      src={p.image.src}
                      alt={p.image.alt}
                      fill
                      sizes="384px"
                      className="object-cover"
                      draggable={false}
                    />
                  ) : (
                    <span className="font-serif absolute inset-0 flex items-end p-3 text-[13px] italic text-[rgba(120,60,90,.4)]">
                      {p.medium}
                    </span>
                  )}
                </div>
              </div>
              {/* caption blooms in on hover */}
              <div className="pointer-events-none absolute inset-x-0 top-full mt-[11px] translate-y-[-4px] text-center opacity-0 transition-[opacity,transform] duration-[450ms] group-hover:translate-y-0 group-hover:opacity-100">
                <div className="font-serif text-[18px] text-[#6b4358]">{p.title}</div>
                <div className="font-serif text-[13px] italic text-[#b07a97]">
                  {p.medium} · {p.year}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* GRID — editorial masonry, three columns */}
      {mode === "grid" && (
        <div className="absolute inset-0 z-[1] overflow-y-auto">
          <div className="mx-auto max-w-[1180px] px-[clamp(24px,5vw,60px)] pb-[100px] pt-[172px]">
            <div className="flex items-start gap-6">
              {[0, 1, 2].map((col) => (
                <div key={col} className="flex flex-1 flex-col">
                  {pieces
                    .filter((_, i) => i % 3 === col)
                    .map((p) => {
                      return (
                        <Link
                          key={p.slug}
                          href={`/design/${p.slug}`}
                          onClick={(e) => {
                            burst(e.clientX, e.clientY, "#dd8fb6", 14, "#ffffff");
                          }}
                          className="group relative mb-6 block cursor-pointer overflow-hidden rounded-[14px] shadow-[0_8px_24px_rgba(154,90,120,.12)] transition-[transform,box-shadow] duration-500 hover:-translate-y-[5px] hover:shadow-[0_18px_42px_rgba(154,90,120,.22)]"
                        >
                          <div
                            className="relative w-full"
                            style={{ height: p.gridHeight, background: p.image ? undefined : p.gradient }}
                          >
                            {p.image && (
                              <Image
                                src={p.image.src}
                                alt={p.image.alt}
                                fill
                                sizes="(max-width:768px) 100vw, 380px"
                                className="object-cover"
                              />
                            )}
                          </div>
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[rgba(90,40,60,.46)] to-transparent p-[18px_16px_15px] opacity-0 transition-opacity duration-[450ms] group-hover:opacity-100">
                            <div className="font-serif text-[20px] text-white">{p.title}</div>
                            <div className="font-serif text-[13px] italic text-white/85">
                              {p.medium} · {p.year}
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* back + eyebrow — top left, below the header */}
      <div className="pointer-events-none absolute left-[calc(clamp(22px,4vw,52px)+50px)] top-[110px] z-[6] flex flex-col items-start gap-2">
        <BackLink href="/" label="back" className="pointer-events-auto text-ink-faint" />
        <div className="font-serif text-[16px] italic uppercase tracking-[.2em] text-pink-deep">
          design
        </div>
      </div>

      {/* explore ⁄ compact toggle — bottom center */}
      <div className="absolute bottom-7 left-1/2 z-[6] inline-flex -translate-x-1/2 items-center gap-3.5 rounded-[20px] border border-[rgba(201,127,166,.14)] bg-[rgba(255,252,254,.82)] px-[22px] py-2 shadow-[0_4px_18px_rgba(154,90,120,.07)] backdrop-blur-[8px]">
        <ModeButton label="explore" active={mode === "wall"} onClick={() => setMode("wall")} />
        <FourPointStar size={10} color="#e2a7c4" />
        <ModeButton label="compact" active={mode === "grid"} onClick={() => setMode("grid")} />
      </div>

      {/* wander hint — only meaningful on the wall */}
      {mode === "wall" && (
        <div className="font-serif pointer-events-none absolute bottom-[74px] left-1/2 z-[5] -translate-x-1/2 whitespace-nowrap text-[14.5px] italic text-[#c189a6]">
          drag to wander
        </div>
      )}

      {/* instagram */}
      <a
        href="https://www.instagram.com/jammydoodlez"
        target="_blank"
        rel="noopener noreferrer"
        title="@jammydoodlez"
        className="absolute bottom-7 right-[clamp(20px,4vw,44px)] z-[6] inline-flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(201,127,166,.14)] bg-[rgba(255,252,254,.82)] text-pink-deep shadow-[0_4px_18px_rgba(154,90,120,.07)] backdrop-blur-[8px] transition-transform duration-300 hover:scale-110 hover:-rotate-[4deg]"
      >
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
