"use client";

import { useEffect, useRef, useState } from "react";

const GLYPHS = [".", "܁", "₊", "˚", "⊹", "｡", "⋆"];
const SPARKS_PER_CLICK = 7;
const SPARK_TTL_MS = 1800;

interface KaoSpark {
  id: number;
  glyph: string;
  dx: number;
  dy: number;
  rot: number;
  size: number; // em, relative to the headline
  delay: number;
  duration: number;
}

// the (^▽^)/ in the about headline — turns pink on hover, and clicking
// makes little text sparkles fly out from the hand
export function Kaomoji() {
  const [sparks, setSparks] = useState<KaoSpark[]>([]);
  const nextId = useRef(0);
  const timeouts = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const pending = timeouts.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  const burst = () => {
    const born: KaoSpark[] = Array.from({ length: SPARKS_PER_CLICK }, (_, i) => ({
      id: nextId.current++,
      glyph: GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
      dx: 10 + Math.random() * 46,
      dy: Math.random() * 52 - 26,
      rot: Math.random() * 120 - 60,
      size: 0.32 + Math.random() * 0.34,
      delay: i * 0.045,
      duration: 0.85 + Math.random() * 0.5,
    }));
    setSparks((s) => [...s, ...born]);
    const ids = new Set(born.map((b) => b.id));
    timeouts.current.push(setTimeout(() => setSparks((s) => s.filter((k) => !ids.has(k.id))), SPARK_TTL_MS));
  };

  return (
    <span
      className="relative cursor-pointer text-ink-dark transition-colors duration-[350ms] hover:text-pink-deep"
      onClick={burst}
    >
      (^
      {/* ▽ falls back to a non-Cormorant font, so shrink + stroke it to blend in */}
      <span
        className="inline-block"
        style={{ fontSize: ".5em", transform: "translateY(-.15em)", WebkitTextStroke: ".7px currentColor" }}
      >
        &#9661;
      </span>
      ^)/
      <span className="pointer-events-none absolute left-full top-0 h-full w-0" aria-hidden>
        {sparks.map((s) => (
          <span
            key={s.id}
            className="font-serif absolute left-0 top-1/2 leading-none text-pink-deep opacity-0 will-change-transform"
            style={
              {
                fontSize: `${s.size}em`,
                "--dx": `${s.dx}px`,
                "--dy": `${s.dy}px`,
                "--rot": `${s.rot}deg`,
                animation: `kao-spark ${s.duration}s cubic-bezier(.22,1,.36,1) ${s.delay}s forwards`,
              } as React.CSSProperties
            }
          >
            {s.glyph}
          </span>
        ))}
      </span>
    </span>
  );
}
