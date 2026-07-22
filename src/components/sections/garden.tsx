"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { useFx } from "@/components/layout/fx-provider";
import { FourPointStar } from "@/components/ui/four-point-star";
import { gardenNodes, site, taglines } from "@/content/site";
import { ease } from "@/lib/theme";

const ROTATE_MS = 5200;
const FADE_MS = 1000;

// home — constellation garden: script name, rotating subtitle, four floating
// corner stars that navigate to each section
export function Garden() {
  return (
    <main className="relative flex h-dvh items-center justify-center overflow-hidden">
      <div className="pointer-events-none relative z-[2] px-6 text-center">
        <h1 className="font-script text-[clamp(58px,10vw,150px)] font-normal leading-[.9] text-ink">{site.name}</h1>
        <RotatingTagline />
      </div>
      <GardenStars />
    </main>
  );
}

function RotatingTagline() {
  const [index, setIndex] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    // don't auto-rotate under reduced motion — show a single tagline statically
    if (typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const cycle = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setIndex((i) => (i + 1) % taglines.length);
        setFading(false);
      }, FADE_MS);
    }, ROTATE_MS);
    return () => clearInterval(cycle);
  }, []);

  return (
    <div className="font-serif mt-[.5em] min-h-[1.5em] text-[clamp(16px,2vw,25px)] italic tracking-[.04em] text-ink-muted">
      <span
        style={{
          opacity: fading ? 0 : 1,
          filter: fading ? "blur(4px)" : "blur(0)",
          transition: "opacity 1s ease, filter 1s ease",
          willChange: "opacity",
        }}
      >
        {taglines[index]}
      </span>
    </div>
  );
}

interface NodeMotion {
  cur: { x: number; y: number };
  s1: number;
  s2: number;
  ph: number;
  homeX: number;
  homeY: number;
}

function GardenStars() {
  const { engine, burst } = useFx();
  const wrapRefs = useRef<(HTMLElement | null)[]>([]);
  const [hovered, setHovered] = useState<number | null>(null);
  // touch devices have no hover — a tap briefly marks the star "active" so it
  // flashes its color + turns while the page fades out
  const [tapped, setTapped] = useState<number | null>(null);

  useEffect(() => {
    // idle drift + cursor parallax, eased toward each star's corner anchor
    const motions: NodeMotion[] = gardenNodes.map(() => ({
      cur: { x: 0, y: 0 },
      s1: 0.4 + Math.random() * 0.3,
      s2: 0.3 + Math.random() * 0.3,
      ph: Math.random() * 6.28,
      homeX: 0,
      homeY: 0,
    }));
    const place = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      gardenNodes.forEach((n, i) => {
        motions[i].homeX = n.hx * Math.min(w * 0.33, 460);
        motions[i].homeY = n.hy * Math.min(h * 0.36, 320);
      });
    };
    place();
    window.addEventListener("resize", place);

    // reduced motion: stars rest at their anchors (no idle drift, no parallax)
    const reduce =
      typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;

    const t0 = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = (now - t0) / 1000;
      motions.forEach((m, i) => {
        const el = wrapRefs.current[i];
        if (!el) return;
        const ix = reduce ? 0 : Math.sin(t * m.s1 + m.ph) * 12;
        const iy = reduce ? 0 : Math.cos(t * m.s2 + m.ph) * 14;
        const par = reduce ? 0 : 1;
        const tx = m.homeX + ix + engine.pointer.nx * (20 + i * 5) * par;
        const ty = m.homeY + iy + engine.pointer.ny * (20 + i * 5) * par;
        m.cur.x += (tx - m.cur.x) * 0.06;
        m.cur.y += (ty - m.cur.y) * 0.06;
        el.style.transform = `translate(-50%,-50%) translate(${m.cur.x}px,${m.cur.y}px)`;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", place);
    };
  }, [engine]);

  return (
    <>
      {gardenNodes.map((node, i) => {
        const active = hovered === i || tapped === i;
        return (
          <Link
            key={node.key}
            href={node.href}
            ref={(el) => {
              wrapRefs.current[i] = el;
            }}
            className="absolute left-1/2 top-1/2 z-[3] cursor-pointer text-center will-change-transform"
            onPointerEnter={() => setHovered(i)}
            onPointerLeave={() => setHovered(null)}
            onClick={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              burst(r.left + r.width / 2, r.top + 18, node.color, 20, "#ffffff");
              // on touch (no hover) flash the star as the page cross-fades away
              if (typeof matchMedia === "function" && matchMedia("(hover: none)").matches) {
                setTapped(i);
                setTimeout(() => setTapped((t) => (t === i ? null : t)), 900);
              }
            }}
          >
            <span
              className="flex justify-center"
              style={{
                transform: active ? "scale(1.28) rotate(6deg)" : undefined,
                transition: `transform 1.2s ${ease.soft}`,
              }}
            >
              <FourPointStar
                size={26}
                color={active ? node.color : "#ffffff"}
                style={{ filter: "drop-shadow(0 0 5px rgba(255,255,255,.9))" }}
              />
            </span>
            <span
              className="font-serif mt-2 block text-[21px] italic tracking-[.02em]"
              style={{
                color: active ? "#6b5343" : "#8a6f5c",
                transform: active ? "translateY(2px)" : undefined,
                transition: `color .8s ease, transform .9s ${ease.soft}`,
              }}
            >
              {node.label}
            </span>
          </Link>
        );
      })}
    </>
  );
}
